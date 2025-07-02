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

        let userId: string | null = null;
        try {
            const decoded = jwt.verify(authToken, process.env.JWT_SECRET!) as { id: string };
            userId = decoded.id;
        } catch (err) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const userPlan = await checkUserPlan(req.headers.get('userPlan') || '');

        const list = await prisma.shortUrl.findMany({
            where: {
                userId: userId,
            }
        })

        return NextResponse.json({ links: list, allowEdit: userPlan }, { status: 200 });
    } catch (error) {
        console.error("Error fetching list:", error);
        return NextResponse.json({ error: "Failed to fetch list" }, { status: 500 });
    }
}