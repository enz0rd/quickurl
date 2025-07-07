import jwt from "jsonwebtoken";
import { prisma } from "./prisma";
import Stripe from "stripe";

export async function checkUserPlan(plan: string) {
    if(!plan) {
        return false;
    }
    
    const payload = jwt.verify(plan || '', process.env.JWT_SECRET || '') as { planId: string };
    const decodedPlan = atob(payload.planId);

    if(decodedPlan == "free") {
        return false;
    }

    const check = await prisma.subscription.findUnique({
        where: {
            stripeSubscriptionId: decodedPlan
        },
        select: {
            status: true
        }
    });

    if(check?.status == "active" || check?.status == 'trialing') {
        return true;
    }

    return false;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2025-06-30.basil",
});

export async function ValidateUserPlan(req: Request,subscriptionId: string, userID: string) {
    try {
        if (!subscriptionId) {
            throw new Error("Subscription ID is required");
        }
    
        const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
            expand: ["customer"],
        });
        if (!subscription) {
            throw new Error("Subscription not found");
        }
        const customer = subscription.customer as Stripe.Customer;
        if (!customer) {
            throw new Error("Customer not found");
        }
    
        await prisma.user.update({
            where: { id: userID },
            data: { stripeCustomerId: customer.id },
        });
    
        const createdDate = new Date(subscription.created * 1000);
        const periodEndDate = new Date(createdDate);
        periodEndDate.setMonth(createdDate.getMonth() + 1);
    
        await prisma.subscription.upsert({
            where: { userId: userID },
            update: {
                stripeSubscriptionId: subscription.id,
                stripePriceId: subscription.items.data[0].price.id,
                status: subscription.status,
                currentPeriodEnd: periodEndDate,
            },
            create: {
                userId: userID,
                stripeSubscriptionId: subscription.id,
                stripePriceId: subscription.items.data[0].price.id,
                status: subscription.status,
                currentPeriodEnd: periodEndDate,
            },
        });
    
        const jwtSecret = process.env.JWT_SECRET || "shhhh";
        const checkUserPlan = await prisma.subscription.findUnique({ where: { userId: userID } });
        let userPlan = null;
        if (checkUserPlan && (checkUserPlan.status === 'active' || checkUserPlan.status === 'trialing')) {
            userPlan = jwt.sign({ planId: btoa(checkUserPlan.stripeSubscriptionId) }, jwtSecret);
        } else {
            userPlan = jwt.sign({ planId: btoa('free') }, jwtSecret);
        }
        return { userPlan, status: subscription.status };
    } catch (error) {
        console.error("Error validating user plan:", error);
        return { error: "Failed to validate user plan" };
    }
}