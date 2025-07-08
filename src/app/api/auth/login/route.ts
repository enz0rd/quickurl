import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { ValidateUserPlan } from '@/lib/plan';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;
    
        if (!email || !password) {
        return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
        }
    
        // Login logic
        const check = await prisma.user.findUnique({
            where: { email }
        });

        if(!check) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, check.password);
        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        if(check.twoFAEnabled) {
            return NextResponse.json({ twoFA: true }, { status: 200 });
        }

        // Create token
        const jwtSecret = process.env.JWT_SECRET || "shhhh";
        const expirationTime: string = process.env.JWT_TOKEN_EXP || '1h'; // Default to 1 hour if not set
        if (!jwtSecret) {
            return NextResponse.json({ error: 'JWT secret is not set' }, { status: 500 });
        }

        const token = jwt.sign(
            {
                id: check.id,
                email: check.email,
                customerId: check.stripeCustomerId
            },
            jwtSecret,
            {
                expiresIn: expirationTime,
                issuer: 'quickurl',
                audience: 'quickurl-users',
                algorithm: 'HS256'
            } as jwt.SignOptions
        );

        const checkUserPlan = await prisma.subscription.findUnique({ where: { userId: check.id } });
        let userPlan = null;
        let userPlanFetched: { userPlan?: string, status?: string, error?: string } = { userPlan: '', status: '' };
        // Atualizar status de assinatura
        if(checkUserPlan) {
            userPlanFetched = await ValidateUserPlan(checkUserPlan?.stripeSubscriptionId || '', check.id);
            if (userPlanFetched.error) {
                return NextResponse.json({ error: userPlanFetched.error }, { status: 500 });
            }

            userPlan = userPlanFetched.userPlan;
        } else {
            userPlan = jwt.sign({ planId: btoa('free') }, jwtSecret);
        }

        return NextResponse.json({ message: 'User logged in successfully', token: token, userPlan: userPlan }, { status: 200 });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}