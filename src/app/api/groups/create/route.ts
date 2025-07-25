import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ValidateAPIKey, ValidateToken } from "@/lib/auth";
import { createGroupSchema } from "@/lib/schema";

export async function POST(req: Request) {
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

        const body = await req.json();

        const parsed = createGroupSchema.safeParse(body);
        
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        const userPlan = await prisma.subscription.findUnique({
            where: {
                userId: userId || undefined,
                status: {
                    in: ['active', 'trialing']
                },
            }
        })
    
        let plan: "free" | "pro" = "free";
        if(userPlan) {
            plan = "pro";
        }
    
        const groupQtd = await prisma.shortUrlGroups.count({
            where: {
                ownerId: userId
            }
        })

        if(groupQtd >= 5 && plan == "free") {
            return NextResponse.json({
                error: "5 groups limit reached",
            }, { status: 403 });
        } else if(groupQtd >= 50 && plan == "pro") {
            return NextResponse.json({
                error: "50 groups limit reached",
            }, { status: 403 });
        }

        const groupNameCheck = await prisma.shortUrlGroups.findFirst({
            where: {
                name: body.name,
                ownerId: userId
            }
        })

        if (groupNameCheck) {
            return NextResponse.json({
                error: "You already have a group with this name",
            }, { status: 400 });
        }

        const groupShortNameCheck = await prisma.shortUrlGroups.findFirst({
            where: {
                shortName: body.shortName,
                ownerId: userId
            }
        })

        if (groupShortNameCheck) {
            return NextResponse.json({
                error: "You already have a group with this short name",
            }, { status: 400 });
        }

        let data: {
            name: string;
            shortName: string;
            description?: string;
            ownerId: string
        } = {
            name: "",
            shortName: "",
            ownerId: ""
        };  
        
        if (body.description) {
            data = {
                name: body.name,
                shortName: body.shortName,
                description: body.description,
                ownerId: userId
            }
        } else {
            data = {
                name: body.name,
                shortName: body.shortName,
                ownerId: userId
            }
        }

        const group = await prisma.shortUrlGroups.create({
            data: data
        })

        if(!group) {
            return NextResponse.json({
                error: "Could not create group, please try again later",
            }, { status: 500 });
        }

        return NextResponse.json({ message: "Group created successfully" }, { status: 200 });

    } catch (error) {
        console.log("Error creating group: ", error);
        return NextResponse.json({
            error: "Internal server error",
        }, { status: 500 });
    }
}