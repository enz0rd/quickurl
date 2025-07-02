import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-06-30.basil",
});

export async function POST(req: Request) {
    try {
        const session_id = req.headers.get("stripe-session")!;

        if (!session_id) {
            return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.retrieve(session_id, {
            expand: ["subscription", "customer"],
        });

        const subscription = session.subscription as Stripe.Subscription;
        if (!subscription) {
            return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
        }
        const customer = session.customer as Stripe.Customer;
        if (!customer) {
            return NextResponse.json({ error: "Customer not found" }, { status: 404 });
        }
        const token = req.headers.get("Authorization");
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const payload = jwt.verify(token, process.env.JWT_SECRET as string);
        if (!payload || typeof payload !== "object" || !payload.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log(session)
        await prisma.user.update({
            where: { id: payload.id },
            data: { stripeCustomerId: customer.id },
        });

        const createdDate = new Date(subscription.created * 1000);
        const periodEndDate = new Date(createdDate);
        periodEndDate.setMonth(createdDate.getMonth() + 1);

        await prisma.subscription.upsert({
            where: { userId: payload.id },
            update: {
                stripeSubscriptionId: subscription.id,
                stripePriceId: subscription.items.data[0].price.id,
                status: subscription.status,
                currentPeriodEnd: periodEndDate,
            },
            create: {
                userId: payload.id,
                stripeSubscriptionId: subscription.id,
                stripePriceId: subscription.items.data[0].price.id,
                status: subscription.status,
                currentPeriodEnd: periodEndDate,
            },
        });

        const jwtSecret = process.env.JWT_SECRET || "shhhh";
        const checkUserPlan = await prisma.subscription.findUnique({ where: { userId: payload.id } });
        let userPlan = null;
        if (checkUserPlan && (checkUserPlan.status === 'active' || checkUserPlan.status === 'trialing')) {
            userPlan = jwt.sign({ planId: btoa(checkUserPlan.stripeSubscriptionId) }, jwtSecret);
        } else {
            userPlan = jwt.sign({ planId: btoa('free') }, jwtSecret);
        }

        return NextResponse.json({ userPlan: userPlan, message: "Subscription validated successfully" }, { status: 200 });

    } catch (error) {
        console.error("Subscription error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
