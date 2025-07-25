import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ValidateAPIKey, ValidateToken } from "@/lib/auth";

export async function DELETE(request: Request) {
    try {
        let userId = "";
        try {
            const token = await ValidateToken(request);

            if (!token) {
                return NextResponse.json({ error: "Invalid token" }, { status: 401 });
            }

            if (typeof token.token === "object" && token.token !== null && "id" in token.token) {
                userId = (token.token as any).id;
            }
        } catch {
            const token = request.headers.get("Authorization");
            const apiKey = await ValidateAPIKey(token!);

            if (!apiKey.valid) {
                return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
            }

            userId = apiKey.key!.id;
        }
        
        const { searchParams } = new URL(request.url);
        const groupId = searchParams.get('groupId');
        if (!groupId) {
            return NextResponse.json({ error: 'groupId is required' }, { status: 400 });
        }
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            }
        });
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const group = await prisma.shortUrlGroups.findUnique({
            where: {
                id: groupId,
                ownerId: user.id,
            },
        });
        if (!group) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }

        // update link relations
        await prisma.shortUrl.updateMany({
            where: {
                groupId: group.id,
            },
            data: {
                groupId: null,
            },
        });

        // delete group
        await prisma.shortUrlGroups.delete({
            where: {
                id: group.id,
            },
        });

        return NextResponse.json({ message: 'Group deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}