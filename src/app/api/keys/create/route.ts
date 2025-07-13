import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ValidateToken from "@/lib/auth";
import { encryptSecret } from "@/lib/2fa";

export async function POST(req: Request) {
    try {
        const token = await ValidateToken(req);

        if(!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Corrigindo o acesso ao id do usuário no token
        let userId: string | undefined;

        if (typeof token.token === "object" && token.token !== null && "id" in token.token) {
            userId = (token.token as any).id;
        }

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

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

        if(keyCheck) {
            return NextResponse.json({ key: keyCheck }, { status: 200 });
        }

        const keyCount = await prisma.apiKeys.count({
            where: { userId }
        });

        if(keyCount >= 5) {
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

        if(!userData) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const keyData = {
            id: userId,
            email: userData.email,
            customerId: userData.stripeCustomerId,
            planStatus: userData.subscriptions?.status,
            createdAt: Date.now()
        }

        const keyInfo = `${userId}-${btoa(keyData.email)}/${btoa(keyData.customerId!)}-${Date.now()}/${btoa(keyData.planStatus!)}`

        const jwtSecret = process.env.JWT_SECRET;

        if(!jwtSecret) {
            console.error("ALERT - JWT_SECRET NOT DEFINED ON ENV");
            return NextResponse.json({ error: "Internal server error" }, { status: 500 });
        }

        // const generatedKey = await jwt.sign(keyData, jwtSecret);

        const key = await prisma.apiKeys.create({
            data: {
                key: keyInfo,
                name: name,
                userId,
                expiresAt: new Date(expiresAt) < new Date() ? new Date(new Date(expiresAt).setHours(23, 59, 59, 999)) : null
            }
        })

        return NextResponse.json({ key: key.key }, { status: 200 });
    } catch (error) {
        console.error("ERROR CREATING API KEY - ", error);
        return NextResponse.json({ error: "Internal server error" }, {status: 500})
    }
}