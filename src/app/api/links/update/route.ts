import jwt from 'jsonwebtoken';
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get("slug");
        if (!slug) {
            return NextResponse.json({
            message: "Missing 'slug' parameter",
            }, { status: 400 });
        }

        const token = req.headers.get("Authorization") || "";
        if(token === "") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (!process.env.JWT_SECRET) {
            console.log("ALERT - JWT secret not set");
            return NextResponse.json({ error: "Internal server error" }, { status: 500 });
        }
        const userId = (jwt.verify(token, process.env.JWT_SECRET) as { id: string }).id;

        const linkData = await prisma.shortUrl.findUnique({
            where: {
                slug: slug,
                userId
            }
        })

        if(!linkData) {
            return NextResponse.json({
            message: "Could not find a link with this slug",
            }, { status: 404 });
        }

        return NextResponse.json({
            id: linkData.id,
            slug: linkData.slug,
            originalUrl: linkData.originalUrl,
            userId: linkData.userId,
            createdAt: linkData.createdAt,
            updatedAt: linkData.updatedAt
        }, { status: 200 })
    } catch (error: any) {
        console.log("Error fetching link data: " + error.message)
        return NextResponse.json({
          message: "Internal server error",
        }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {

    } catch (error: any) {
        console.log("Error fetching link data: " + error.message)
        return NextResponse.json({
          message: "Internal server error",
        }, { status: 500 });
    }
}