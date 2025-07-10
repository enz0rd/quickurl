import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Reset2FA } from '@/lib/email';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Check if the user exists
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const token = jwt.sign({
            userId: user.id,
            email: user.email,
        }, process.env.JWT_SECRET || "shhhh", {
            expiresIn: '15m'
        });

        // create a record in database to validate token
        const validationRecord = await prisma.reset2FAToken.upsert({
            where: {
                userId: user.id
            },
            create: {
                userId: user.id,
                resetToken: token
            },
            update: {
                resetToken: token,
                expDate: new Date(Date.now() + 15 * 60 * 1000)
            }
        });

        if (!validationRecord) {
            return NextResponse.json({ error: "Failed to create reset token" }, { status: 500 });
        }

        // Send email to confirm 2fa reset
        const sentEmail = await Reset2FA(email, token);

        if (!sentEmail) {
            return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 });
        }

        return NextResponse.json({ message: "An email was sent to confirm this action. Proceed to your email inbox." }, { status: 200 });
    } catch (error) {
        console.error("Error in 2FA reset route:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}