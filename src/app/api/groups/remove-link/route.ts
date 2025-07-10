import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const linkId = searchParams.get("linkId");
        const groupId = searchParams.get("id");
        const token = request.headers.get("Authorization");

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if(!linkId) {
            return NextResponse.json({ error: "Missing parameter" }, { status: 400 });
        }

        if(!groupId) {
            return NextResponse.json({ error: "Missing parameter" }, { status: 400 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        if(!decoded) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const user = decoded as { id: string };

        const shortUrl = await prisma.shortUrl.findUnique({
            where: {
                id: linkId,
                userId: user.id,
                groupId: groupId
            }
        })

        if(!shortUrl) {
            return NextResponse.json({ error: "Link not found" }, { status: 404 });
        }
        
        await prisma.shortUrl.update({
            where: {
                id: linkId
            },
            data: {
                groupId: null
            }
        });

        return NextResponse.json({ message: "Link removed from group" }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}