import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
    try {
        const resetToken = request.headers.get("password-reset-token");

        if (!resetToken) {
            return NextResponse.json({ error: "Missing reset token header" }, { status: 400 });
        }

        // Validate the reset token here (e.g., check its format, expiration, etc.)
        const validateResetToken = await prisma.resetPasswordToken.findUnique({
            where: { resetToken: resetToken, expDate: { gte: new Date() } },
        });

        if (!validateResetToken) {
            return NextResponse.json({ error: "Invalid or expired reset token." }, { status: 403 });
        }

        // Reset password
        const body = await request.json();
        const { newPassword } = body;

        if (!newPassword) {
            return NextResponse.json({ error: "Password is required." }, { status: 400 });
        }

        // Update the user's password in the database
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: validateResetToken.userId },
            data: { password: hashedPassword },
        });

        // Delete the reset token after successful password reset
        await prisma.resetPasswordToken.delete({
            where: { resetToken: resetToken },
        });

        return NextResponse.json({ message: "Password reset successfully." }, { status: 200 });
    } catch (error) {
        console.error("Error in reset-password API:", error);
        return NextResponse.json({ error: "An error occurred while processing your request." }, { status: 500 });
    }
}