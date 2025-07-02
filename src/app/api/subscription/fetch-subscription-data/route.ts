import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-06-30.basil',
});

export async function GET(req: Request) {
    try {
        const token = req.headers.get("Authorization");
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userPlan = req.headers.get("userPlan");
        if (!userPlan) {
            return NextResponse.json({ error: 'User plan is required' }, { status: 400 });
        }
        const planPayload = jwt.verify(userPlan, process.env.JWT_SECRET as string);
        if (!planPayload || typeof planPayload !== "object" || !planPayload.planId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET as string);
        if (!payload || typeof payload !== "object" || !payload.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = payload.id;
        const planId = atob(planPayload.planId);

        if(planId === "free") {
            return NextResponse.json({
                subscriptionId: "",
                productName: "free plan",
                amount: 0, // convertendo de centavos para reais
                lastPaymentDate: "never",
                nextPaymentDate: "never",
                status: "active",
                cardLast4: ""
            }, { status: 200 });
        }

        // Fetch subscription data from stripe
        const subscription = await stripe.subscriptions.retrieve(planId, {
            expand: [
                "items.data.price.product",
                "latest_invoice.payment_intent",
                "default_payment_method",
            ],
        });

        const item = subscription.items.data[0];
        const price = item.price;
        const product = item.price.product as Stripe.Product;
        const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
        const paymentMethod = subscription.default_payment_method as Stripe.PaymentMethod;

        const createdDate = new Date(subscription.created * 1000);
        const periodEndDate = new Date(createdDate);
        periodEndDate.setMonth(createdDate.getMonth() + 1);
        await prisma.subscription.update({
            where: { stripeSubscriptionId: subscription.id },
            data: {
                status: subscription.status,
                currentPeriodEnd: periodEndDate,
            },
        });

        const subscriptionDatabase = await prisma.subscription.findUnique({
            where: { stripeSubscriptionId: subscription.id },
        });
        
        if (!subscription) {
            return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
        }
        
        const data = {
            subscriptionId: subscription.id,
            productName: product.name,
            amount: price.unit_amount! / 100, // convertendo de centavos para reais
            lastPaymentDate: new Date(latestInvoice.created * 1000),
            nextPaymentDate: subscriptionDatabase?.currentPeriodEnd ? new Date(subscriptionDatabase.currentPeriodEnd) : null,
            status: subscription.status,
            cardLast4: paymentMethod?.card?.last4 || null
        };


        // update subscription on database

        return NextResponse.json({ ...data }, { status: 200 });
    } catch (error) {
        console.error("Error fetching subscription data:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}