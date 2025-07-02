import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;
        const { searchParams } = new URL(request.url);
        const redirectTo = searchParams.get('redirectTo') || '';

        if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // User registration logic
        const check = await prisma.user.findUnique({
            where: { email }
        })

        if (check) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = await prisma.user.create({
            data: { email, password: hashedPassword }
        })

        if (!user) {
            return NextResponse.json({ error: 'User registration failed' }, { status: 500 });
        }

        if(redirectTo !== '') {
            // Create token
            const jwtSecret = process.env.JWT_SECRET || "shhhh";
            const expirationTime: string = process.env.JWT_TOKEN_EXP || '1h'; // Default to 1 hour if not set
    
            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    customerId: user.stripeCustomerId
                },
                jwtSecret,
                {
                    expiresIn: expirationTime,
                    issuer: 'quickurl',
                    audience: 'quickurl-users',
                    algorithm: 'HS256'
                } as jwt.SignOptions
            );
    
            const checkUserPlan = await prisma.subscription.findUnique({ where: { userId: user.id } });
            let userPlan = null;
            if (checkUserPlan && checkUserPlan.status === 'active') {
                userPlan = jwt.sign({ planId: btoa(checkUserPlan.stripeSubscriptionId) }, jwtSecret);
            } else {
                userPlan = jwt.sign({ planId: btoa('free') }, jwtSecret);
            }
    
            return NextResponse.json({ message: 'Proceeding to checkout', token: token, userPlan: userPlan }, { status: 200 });
        } else {
            return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });
        }

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}