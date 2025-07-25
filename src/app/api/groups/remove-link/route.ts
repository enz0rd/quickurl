import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ValidateAPIKey, ValidateToken } from "@/lib/auth";

export async function PATCH(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const linkId = searchParams.get("linkId");
        const groupId = searchParams.get("id");
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

        if (!linkId) {
            return NextResponse.json({ error: "Missing parameter" }, { status: 400 });
        }

        if (!groupId) {
            return NextResponse.json({ error: "Missing parameter" }, { status: 400 });
        }


        const shortUrl = await prisma.shortUrl.findUnique({
            where: {
                id: linkId,
                userId: userId,
                groupId: groupId
            }
        })

        if (!shortUrl) {
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