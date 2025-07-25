import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { checkUserPlan } from "@/lib/plan";
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
        const { page, limit, search, groupId } = Object.fromEntries(searchParams.entries());


        const userPlan = await checkUserPlan(req.headers.get('userPlan') || '');

        let list: {
            id: string;
            slug: string | null;
            originalUrl: string;
            uses: number;
            timesUsed: number;
            expDate: Date | null;
            userId: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[] = [];
        if (search !== undefined && search !== "") {
            if (groupId !== undefined && groupId !== "") {
                list = await prisma.shortUrl.findMany({
                    where: {
                        userId: userId,
                        groupId: groupId,
                        originalUrl: {
                            contains: search
                        }
                    },
                    include: {
                        group: {
                            select: {
                                shortName: true
                            }
                        }
                    },
                    orderBy: { createdAt: "desc" }
                })
                if (list.length === 0) {
                    list = await prisma.shortUrl.findMany({
                        where: {
                            userId: userId,
                            groupId: groupId,
                            slug: {
                                contains: search
                            }
                        },
                        include: {
                            group: true
                        },
                        orderBy: { createdAt: "desc" }
                    })
                }
            } else {
                list = await prisma.shortUrl.findMany({
                    where: {
                        userId: userId,
                        originalUrl: {
                            contains: search
                        }
                    },
                    include: {
                        group: {
                            select: {
                                shortName: true
                            }
                        }
                    },
                    orderBy: { createdAt: "desc" }
                })
                if (list.length === 0) {
                    list = await prisma.shortUrl.findMany({
                        where: {
                            userId: userId,
                            slug: {
                                contains: search
                            }
                        },
                        include: {
                            group: true
                        },
                        orderBy: { createdAt: "desc" }
                    })
                }
            }
        } else {
            if (groupId !== undefined && groupId !== "") {
                list = await prisma.shortUrl.findMany({
                    where: {
                        userId: userId,
                        groupId: groupId
                    },
                    include: {
                        group: {
                            select: {
                                name: true,
                                shortName: true
                            }
                        }
                    },
                    orderBy: { createdAt: "desc" }
                })
            } else {
                list = await prisma.shortUrl.findMany({
                    where: {
                        userId: userId,
                    },
                    include: {
                        group: {
                            select: {
                                shortName: true
                            }
                        }
                    },
                    orderBy: { createdAt: "desc" }
                })
            }
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
            }, allowEdit: userPlan, allowDA: userPlan, allowQRCode: userPlan
        }, { status: 200 });
    } catch (error) {
        console.error("Error fetching list:", error);
        return NextResponse.json({ error: "Failed to fetch list" }, { status: 500 });
    }
}