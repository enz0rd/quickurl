import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const groupId = searchParams.get('groupId');
        if(!groupId) {
            return NextResponse.json({ error: 'groupId is required' }, { status: 400 });
        }
        const token = request.headers.get('Authorization');
        if(!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { id: string, email: string };
        if(!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const user = await prisma.user.findUnique({
            where: {
                id: decoded.id,
            }
        });
        if(!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const group = await prisma.shortUrlGroups.findUnique({
            where: {
                id: groupId,
                ownerId: user.id,
            },
        });
        if(!group) {
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