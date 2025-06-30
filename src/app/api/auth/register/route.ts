import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;
    
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

        // Create new user
        const user = await prisma.user.create({
            data: { email, password }
        })

        if (!user) {
            return NextResponse.json({ error: 'User registration failed' }, { status: 500 });
        }

        return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}