import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { ChangedEmail } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const token = req.headers.get("Authorization");
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "");
        if (!decoded || typeof decoded !== "object" || !decoded.id) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const userId = decoded.id;
        const body = await req.json();
        const { email } = body;
        if(!email || typeof email !== "string") {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        const userCheck = await prisma.user.findUnique({
            where: {
                email: email
            },
        });

        if (userCheck) {
            return NextResponse.json({ error: "Email already in use" }, { status: 409 });
        }

        const emailToken = jwt.sign({ userId: userId, newEmail: email }, process.env.JWT_SECRET || "", {
            expiresIn: "1d"
        })

        const emailTokenRecord = await prisma.changeEmailToken.upsert({
            where: {
                userId
            },
            create: {
                userId,
                changeToken: emailToken,
                expDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day expiration
            },
            update: {
                changeToken: emailToken,
                expDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day expiration
            }
        })

        if (!emailTokenRecord) {
            return NextResponse.json({ error: "Failed to create email token" }, { status: 500 });
        }

        const emailSent = await ChangedEmail(email, emailToken);
        if (emailSent.status != 200) {
            return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
        }

        return NextResponse.json({ message: "Email to confirm changes has been sent. Check your inbox to proceed." }, { status: 200 });

    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}