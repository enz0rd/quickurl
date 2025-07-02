import { NextResponse } from "next/server";
import Stripe from "stripe";
import jwt from 'jsonwebtoken';
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-06-30.basil',
});

export async function POST(request: Request) {
    try {
        const token = request.headers.get("Authorization");
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const payload = jwt.verify(token, process.env.JWT_SECRET as string);
        if (!payload || typeof payload !== "object" || !payload.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = payload.id;
        const body = await request.json();
        const { subscriptionId } = body;

        if (!subscriptionId) {
            return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 });
        }
        // Cancel the subscription in Stripe
        const subscription = await stripe.subscriptions.cancel(subscriptionId, {
            invoice_now: true,
            prorate: true,
        });
        if (!subscription) {
            return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
        }
        // Update the subscription in the database
        await prisma.subscription.update({
            where: { stripeSubscriptionId: subscription.id },
            data: {
                status: subscription.status,
                updatedAt: new Date(),
            },
        });

        const userPlan = jwt.sign({ planId: btoa("free")}, process.env.JWT_SECRET as string);

        return NextResponse.json({ success: true, userPlan }, { status: 200 });
    } catch (error) {
        console.error("Error canceling subscription:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
