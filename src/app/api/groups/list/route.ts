import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Group } from "@/lib/schema";
import { ValidateAPIKey, ValidateToken } from "@/lib/auth";

export async function GET(req: Request) {
    try {
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

        const { searchParams } = new URL(req.url);
        const { page, limit, search } = Object.fromEntries(searchParams.entries());


        let list: Group[] = [];
        if (search !== undefined && search !== "") {
            list = await prisma.shortUrlGroups.findMany({
                where: {
                    ownerId: userId,
                    name: {
                        contains: search,
                        mode: "insensitive"
                    }
                },
                orderBy: { createdAt: "desc" }
            })
            if (list.length === 0) {
                list = await prisma.shortUrlGroups.findMany({
                    where: {
                        ownerId: userId,
                        description: {
                            contains: search,
                            mode: "insensitive"
                        }
                    },
                    orderBy: { createdAt: "desc" }
                })
                if (list.length === 0) {
                    list = await prisma.shortUrlGroups.findMany({
                        where: {
                            ownerId: userId,
                            shortName: {
                                contains: search,
                                mode: "insensitive"
                            }
                        },
                        orderBy: { createdAt: "desc" }
                    })
                }
            }
        } else {
            list = await prisma.shortUrlGroups.findMany({
                where: {
                    ownerId: userId,
                },
                orderBy: { createdAt: "desc" }
            })
        }

        const totalCount = list.length;
        const pageSize = parseInt(limit || "5", 10);
        const currentPage = parseInt(page || "1", 10);
        const totalPages = Math.ceil(totalCount / pageSize);
        const paginatedList = list.slice((currentPage - 1) * pageSize, currentPage * pageSize);



        return NextResponse.json({
            groups: {
                list: paginatedList,
                totalCount: totalCount,
                totalPages: totalPages,
                currentPage: currentPage,
                pageSize: pageSize
            }
        }, { status: 200 });
    } catch (error) {
        console.error("Error fetching list:", error);
        return NextResponse.json({ error: "Failed to fetch list" }, { status: 500 });
    }
}