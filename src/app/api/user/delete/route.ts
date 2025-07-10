import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-06-30.basil',
});

export async function POST(req: Request) {
    try {
        const token = req.headers.get("Authorization");
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const tokenData = jwt.verify(token as string, process.env.JWT_SECRET as string) as { id: string };

        // deletes all data analytics
        await prisma.dataAnalytics.deleteMany({
            where: {
                ownerId: tokenData.id,
            }
        })

        // removes user subscription
        const subId = await prisma.subscription.findFirst({
            where: {
                userId: tokenData.id,
            },
            select: {
                stripeSubscriptionId: true,
            }
        })

        if (subId) {
            const subscription = await stripe.subscriptions.cancel(subId.stripeSubscriptionId, {
                invoice_now: true,
                prorate: true,
            });

            if (!subscription) {
                return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
            }

            await prisma.subscription.delete({
                where: {
                    stripeSubscriptionId: subId.stripeSubscriptionId
                }
            })
        }

        // deletes user links
        await prisma.shortUrl.deleteMany({
            where: {
                userId: tokenData.id,
            }
        });

        await prisma.shortUrlGroups.deleteMany({
            where: {
                ownerId: tokenData.id,
            }
        })

        // deletes user
        await prisma.user.delete({
            where: {
                id: tokenData.id,
            }
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Error in delete user route:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}