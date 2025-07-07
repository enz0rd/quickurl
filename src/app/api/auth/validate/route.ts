import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { checkUserPlan } from "@/lib/plan";

export async function POST(request: Request) {
    const token = request.headers.get("Authorization");
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        if (!decoded || typeof decoded !== "object" || !decoded.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let permissions: string[] = [];
        const plan = request.headers.get('userPlan');
        if (plan) {
            const userPlan = await checkUserPlan(plan);
            if (userPlan) {
                permissions = ['edit', 'data-analysis'];
            }
        }
        return NextResponse.json({ valid: true, permissions }, { status: 200 });
    } catch (error) {
        console.log("Error validating token:", error);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}