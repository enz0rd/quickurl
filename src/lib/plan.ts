import jwt from "jsonwebtoken";
import { prisma } from "./prisma";

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

    if(check?.status == "active") {
        return true;
    }

    return false;
}