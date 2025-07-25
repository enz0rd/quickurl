import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { ValidateAPIKey, ValidateToken } from "@/lib/auth";

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');
        if (!slug) {
            return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
        }

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

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                urls: true,
            },
        });
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const link = await prisma.shortUrl.findUnique({
            where: {
                slug: slug,
                userId: user.id,
            },
        });
        if (!link) {
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