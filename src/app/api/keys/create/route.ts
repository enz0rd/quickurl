import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ValidateAPIKey, ValidateToken } from "@/lib/auth";
import { createApiKeySchema } from "@/lib/schema";

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

        const parsed = createApiKeySchema.safeParse(body);
        
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        } else if(parsed.data.expiresAt) {
            const date = new Date(body.expiresAt);
            if(date.getTime() < Date.now()) {
                return NextResponse.json({ error: "Invalid input" }, { status: 400 });
            }
        }

        const { name, expiresAt } = body;

        const keyCheck = await prisma.apiKeys.findFirst({
            where: {
                userId: userId,
                isActive: true,
                name: {
                    contains: name,
                    mode: "insensitive"
                }
            }
        })

        if (keyCheck) {
            return NextResponse.json({ key: keyCheck.key }, { status: 200 });
        }

        const keyCount = await prisma.apiKeys.count({
            where: { userId }
        });

        if (keyCount >= 5) {
            return NextResponse.json({ error: "API keys limit reached (5), please remove one to create another." }, { status: 403 });
        }

        const userData = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                email: true,
                stripeCustomerId: true,
                subscriptions: {
                    select: {
                        status: true
                    }
                }
            }
        });

        if (!userData) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const keyData = {
            id: userId,
            email: userData.email,
            customerId: userData.stripeCustomerId,
            planStatus: userData.subscriptions?.status,
            createdAt: Date.now(),
            expiresAt: expiresAt ? new Date(new Date(expiresAt).setHours(23, 59, 59, 999)).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }

        const keyInfo = `${userId}-${btoa(keyData.email)}/${btoa(keyData.customerId!)}-${btoa(keyData.expiresAt)}/${btoa(keyData.planStatus!)}/${btoa(name)}`
        
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            console.error("ALERT - JWT_SECRET NOT DEFINED ON ENV");
            return NextResponse.json({ error: "Internal server error" }, { status: 500 });
        }

        const key = await prisma.apiKeys.create({
            data: {
                key: keyInfo,
                name: name,
                userId,
                expiresAt: expiresAt ? new Date(new Date(expiresAt).setHours(23, 59, 59, 999)) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            }
        })

        return NextResponse.json({ key: key.key }, { status: 200 });
    } catch (error) {
        console.error("ERROR CREATING API KEY - ", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}