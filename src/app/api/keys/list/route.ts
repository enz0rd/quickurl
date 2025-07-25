import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"
import jwt, { JwtPayload } from 'jsonwebtoken'
import { ValidateAPIKey, ValidateToken } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        let userId = "";
        try {
            const token = await ValidateToken(req);

            if (!token) {
                return NextResponse.json({ error: "Invalid token" }, { status: 401 });
            }

            if (typeof token.token === "object" && token.token !== null && "id" in token.token) {
                userId = (token.token as any).id;
            }
        } catch {
            const token = req.headers.get("Authorization");
            const apiKey = await ValidateAPIKey(token!);

            if (!apiKey.valid) {
                return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
            }

            userId = apiKey.key!.id;
        }

        const list = await prisma.apiKeys.findMany({
            where: {
                userId: userId
            },
            select: {
                id: true,
                name: true,
                key: true,
                expiresAt: true
            }
        })

        return NextResponse.json({ list }, { status: 200 });
    } catch (error) {
        console.error("ERROR ON API KEY LISTING - ", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}