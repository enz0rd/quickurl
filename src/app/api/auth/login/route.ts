import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;
    
        if (!email || !password) {
        return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
        }
    
        // Login logic
        const check = await prisma.user.findUnique({
            where: { email, password }
        });

        if (!check) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
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
                email: check.email
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
        if (checkUserPlan && checkUserPlan.status === 'active') {
            userPlan = jwt.sign({ planId: btoa(checkUserPlan.stripeSubscriptionId) }, jwtSecret);
        } else {
            userPlan = jwt.sign({ planId: btoa('free') }, jwtSecret);
        }

        return NextResponse.json({ message: 'User logged in successfully', token: token, userPlan: userPlan }, { status: 200 });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}