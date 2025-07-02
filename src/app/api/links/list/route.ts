import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { checkUserPlan } from "@/lib/plan";

export async function GET(req: Request) {
    try {
        const authToken = req.headers.get("Authorization");
        if (!authToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const { page, limit, search } = Object.fromEntries(searchParams.entries());

        let userId: string | null = null;
        try {
            const decoded = jwt.verify(authToken, process.env.JWT_SECRET!) as { id: string };
            userId = decoded.id;
        } catch (err) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const userPlan = await checkUserPlan(req.headers.get('userPlan') || '');

        let list: any = [];
        if (search) {
            list = await prisma.shortUrl.findMany({
                where: {
                    userId: userId,
                    originalUrl: {
                        contains: search
                    }
                }
            })
            if (list.length === 0) {
                list = await prisma.shortUrl.findMany({
                    where: {
                        userId: userId,
                        slug: {
                            contains: search
                        }
                    }
                })
            }
        } else {
            list = await prisma.shortUrl.findMany({
                where: {
                    userId: userId,
                }
            })
        }

        const totalCount = list.length;
        const pageSize = parseInt(limit || "5", 10);
        const currentPage = parseInt(page || "1", 10);
        const totalPages = Math.ceil(totalCount / pageSize);
        const paginatedList = list.slice((currentPage - 1) * pageSize, currentPage * pageSize);



        return NextResponse.json({
            links: {
                list: paginatedList,
                totalCount: totalCount,
                totalPages: totalPages,
                currentPage: currentPage,
                pageSize: pageSize
            }, allowEdit: userPlan
        }, { status: 200 });
    } catch (error) {
        console.error("Error fetching list:", error);
        return NextResponse.json({ error: "Failed to fetch list" }, { status: 500 });
    }
}