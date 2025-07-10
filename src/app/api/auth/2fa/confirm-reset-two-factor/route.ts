import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const resetToken = body.resetToken;
        if (!resetToken || !body.password) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        // Verify the change token
        let decoded: any;
        try {
            decoded = jwt.verify(resetToken, process.env.JWT_SECRET || "") as { userId: string, newEmail: string };
        } catch (error) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
        }

        const { userId } = decoded;
        if (!userId) {
            return NextResponse.json({ error: "Invalid token data" }, { status: 400 });
        }

        // Check if the user exists
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        
        
        // Verify the user's password
        const isPasswordValid = await bcrypt.compare(body.password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ error: "Invalid password" }, { status: 401 });
        }
        
        const checkToken =  await prisma.reset2FAToken.findUnique({
            where: { userId, resetToken: resetToken }
        });
        if (!checkToken) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
        }

        // Update the user's email
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { twoFAEnabled: false, twoFASecret: null }
        });
        if (!updatedUser) {
            return NextResponse.json({ error: "Failed to reset 2FA" }, { status: 500 });
        }

        // Delete the change email token after successful update
        await prisma.reset2FAToken.delete({
            where: { userId }
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Error in confirm-reset-two-factor route:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}