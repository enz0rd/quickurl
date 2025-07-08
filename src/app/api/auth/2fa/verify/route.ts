import { decryptSecret, verify2FACode } from "@/lib/2fa";
import { prisma } from "@/lib/prisma"; // exemplo
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ValidateUserPlan } from "@/lib/plan";

export async function POST(req: Request) {
    const token = req.headers.get("Authorization");
    const body = await req.json();

    if (!body.code) {
        return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    let email = ''
    if (!token) {
        email = body.email;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.twoFASecret) {
            return NextResponse.json({ error: "2FA not enabled" }, { status: 400 });
        }

        const decryptedSecret = decryptSecret(user.twoFASecret);
        const isValid = verify2FACode(body.code.trim(), decryptedSecret); // Corrigido aqui

        if (!isValid) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        // Create token
        const jwtSecret = process.env.JWT_SECRET || "shhhh";
        const expirationTime: string = process.env.JWT_TOKEN_EXP || '1h'; // Default to 1 hour if not set
        if (!jwtSecret) {
            return NextResponse.json({ error: 'JWT secret is not set' }, { status: 500 });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                customerId: user.stripeCustomerId
            },
            jwtSecret,
            {
                expiresIn: expirationTime,
                issuer: 'quickurl',
                audience: 'quickurl-users',
                algorithm: 'HS256'
            } as jwt.SignOptions
        );

        const checkUserPlan = await prisma.subscription.findUnique({ where: { userId: user.id } });
        let userPlan = null;
        let userPlanFetched: { userPlan?: string, status?: string, error?: string } = { userPlan: '', status: '' };
        // Atualizar status de assinatura
        if (checkUserPlan) {
            userPlanFetched = await ValidateUserPlan(checkUserPlan?.stripeSubscriptionId || '', user.id);
            if (userPlanFetched.error) {
                return NextResponse.json({ error: userPlanFetched.error }, { status: 500 });
            }

            userPlan = userPlanFetched.userPlan;
        } else {
            userPlan = jwt.sign({ planId: btoa('free') }, jwtSecret);
        }

        return NextResponse.json({ message: 'User logged in successfully', token: token, userPlan: userPlan }, { status: 200 });
    } else {
        email = (jwt.verify(token as string, process.env.JWT_SECRET as string) as { email: string }).email;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.twoFASecret) {
            return NextResponse.json({ error: "2FA not enabled" }, { status: 400 });
        }

        const decryptedSecret = decryptSecret(user.twoFASecret);
        const isValid = verify2FACode(body.code.trim(), decryptedSecret); // Corrigido aqui

        if (!isValid) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        await prisma.user.update({
            where: { email },
            data: { twoFAEnabled: true },
        });
    }


    if (!token) {

    }

    return NextResponse.json({ success: true });
}
