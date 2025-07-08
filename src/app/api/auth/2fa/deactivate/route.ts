import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
    const token = request.headers.get("Authorization");
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "");
        const user = await prisma.user.findUnique({
            where: { id: (decoded as { id: string }).id },
        });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        await prisma.user.update({
            where: { id: (decoded as { id: string }).id },
            data: { twoFAEnabled: false, twoFASecret: null },
        });
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}