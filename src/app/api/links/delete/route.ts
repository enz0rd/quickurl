import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');
        if(!slug) {
            return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
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
            },
            include: {
                urls: true,
            },
        });
        if(!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const link = await prisma.shortUrl.findUnique({
            where: {
                slug: slug,
                userId: user.id,
            },
        });
        if(!link) {
            return NextResponse.json({ error: 'Link not found' }, { status: 404 });
        }

        await prisma.dataAnalytics.deleteMany({
            where: {
                shortUrlId: link.id,
            },
        });

        await prisma.shortUrl.delete({
            where: {
                id: link.id,
            },
        });
        return NextResponse.json({ message: 'Link deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}