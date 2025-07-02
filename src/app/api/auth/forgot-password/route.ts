import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { ResetPasswordEmail } from "@/lib/email";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;
        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }
        
        // Search user
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Generate reset token
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error("ALERT - JWT_SECRET is not set");
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }

        // Generate reset token
        const resetToken = jwt.sign({ email: user.email }, jwtSecret, {
            expiresIn: '15m', // Token valid for 15 minutes
        });

        // create a record in database to validate token
        const validationRecord = await prisma.resetPasswordToken.upsert({
            where: {
                userId: user.id,
            },
            update: {
                resetToken: resetToken,
                expDate: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
            },
            create: {
                userId: user.id,
                resetToken: resetToken,
                expDate: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
            }
        });

        if (!validationRecord) {
            return NextResponse.json({ error: "Failed to create reset token record" }, { status: 500 });
        }

        // Send email with reset link 
        const emailSend = await ResetPasswordEmail(user.email, resetToken);
        if(emailSend?.status !== 200) {
            return NextResponse.json({ error: "Failed to send email. Please try again later." }, { status: 500 });
        }       

        // Return success response
        return NextResponse.json({ message: "Password reset link sent to your email. Check your inbox to proceed" }, { status: 200 });
    } catch (error) {
        console.error("Error in POST /api/auth/reset-password:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
    }


    