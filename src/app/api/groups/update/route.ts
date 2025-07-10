import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

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

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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

        const body = await req.json();

        const groupCheck = await prisma.shortUrlGroups.findUnique({
            where: {
                id: id,
                ownerId: user.id
            }
        });

        if (!groupCheck) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        const nameCheck = await prisma.shortUrlGroups.findMany({
            where: {
                name: body.name,
                ownerId: user.id,
                id: { not: id }
            }
        });

        if (nameCheck.length > 0) {
            return NextResponse.json({ error: "Group name already exists" }, { status: 400 });
        }

        const shortNameCheck = await prisma.shortUrlGroups.findMany({
            where: {
                shortName: body.shortName,
                ownerId: user.id,
                id: { not: id }
            }
        });

        if (shortNameCheck.length > 0) {
            return NextResponse.json({ error: "Group short name already exists" }, { status: 400 });
        }

        await prisma.shortUrlGroups.update({
            where: {
                id: id,
                ownerId: user.id
            },
            data: {
                name: body.name,
                shortName: body.shortName,
                description: body.description
            }
        });

        return NextResponse.json({ message: "Group updated successfully" }, { status: 200 });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}