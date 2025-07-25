import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { ValidateAPIKey, ValidateToken } from "@/lib/auth";
import { editGroupSchema } from "@/lib/schema";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                {
                    message: "Missing parameter",
                },
                { status: 400 }
            );
        }
        const token = req.headers.get("Authorization");
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.decode(token || "");
        const user = decoded as { id: string };

        const groupRecord = await prisma.shortUrlGroups.findUnique({
            where: {
                id: id,
                ownerId: user.id
            }
        });

        if (!groupRecord) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        const groupLinks = await prisma.shortUrl.findMany({
            where: {
                groupId: id,
                userId: user.id
            }
        });

        const responseData = {
            group: groupRecord,
            links: groupLinks
        }

        return NextResponse.json(responseData, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                {
                    message: "Missing parameter",
                },
                { status: 400 }
            );
        }

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

        const body = await req.json();

        const parsed = editGroupSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        const groupCheck = await prisma.shortUrlGroups.findUnique({
            where: {
                id: id,
                ownerId: userId
            }
        });

        if (!groupCheck) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        const nameCheck = await prisma.shortUrlGroups.findMany({
            where: {
                name: body.name,
                ownerId: userId,
                id: { not: id }
            }
        });

        if (nameCheck.length > 0) {
            return NextResponse.json({ error: "Group name already exists" }, { status: 400 });
        }

        if(body.shortName) {
            const shortNameCheck = await prisma.shortUrlGroups.findMany({
                where: {
                    shortName: body.shortName,
                    ownerId: userId,
                    id: { not: id }
                }
            });
    
            if (shortNameCheck.length > 0) {
                return NextResponse.json({ error: "Group short name already exists" }, { status: 400 });
            }
        }


        await prisma.shortUrlGroups.update({
            where: {
                id: id,
                ownerId: userId
            },
            data: {
                ...body
            }
        });

        return NextResponse.json({ message: "Group updated successfully" }, { status: 200 });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}