import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"
import jwt, { JwtPayload } from 'jsonwebtoken'

export async function GET(req: Request) {
    try {
        const token = req.headers.get("Authorization");

        if (!token) {
            throw new Error("Token não fornecido");
        }

        const decoded = jwt.decode(token) as JwtPayload | null;

        if (!decoded || typeof decoded !== "object" || !decoded.id) {
            throw new Error("Token inválido");
        }

        const list = await prisma.apiKeys.findMany({
            where: {
                userId: decoded?.id
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