import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-06-30.basil',
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { plan } = body;

        if (!plan) {
            return NextResponse.json({ error: 'Plan is required' }, { status: 400 });
        }

        const token = request.headers.get("Authorization");
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET as string);
        if (!payload || typeof payload !== "object" || !payload.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = payload.id;
        let customerId = payload.customerId;

        if(!customerId) {
            const customer = await stripe.customers.create({ email: payload.email });
            customerId = customer.id;
            await prisma.user.update({
                where: { id: userId },
                data: { stripeCustomerId: customerId }
            });
        }       

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            customer: customerId,
            line_items: [{
                price: 'price_1RgBdhPrMf0FRQomkASpp4CB',
                quantity: 1,
            }],
            success_url: `${process.env.PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.PUBLIC_APP_URL}/cancel?session_id={CHECKOUT_SESSION_ID}`,
        });

        return NextResponse.json({ checkoutUrl: session.url }, { status: 200 });
    } catch (error) {
        console.error("Error creating checkout session:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}