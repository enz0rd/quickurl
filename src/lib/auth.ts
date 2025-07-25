import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { prisma } from './prisma';

export async function ValidateToken(req: Request) {
    const token = req.headers.get("Authorization");
    
    if (!token) {
        NextResponse.json({ message: "Unauthorized" }, {status: 401});
        return;
    }
    
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error("ERROR VALIDATING TOKEN - JWT secret is not set");
        NextResponse.json({ message: "Internal server error" }, {status: 500});
        return;
    }

    const isValid = jwt.verify(token, jwtSecret);
    if (isValid) {
        const decoded = jwt.decode(token);
        return { valid: true, token: decoded, message: "Token is valid" };
    }
    
    NextResponse.json({ message: "Unauthorized" }, {status: 401});
}

export async function ValidateAPIKey(apiKey: string) {
    try {
        const [firstPart, timestampPart, planStatus] = apiKey.split('/');
    
        if(!firstPart || !timestampPart || !planStatus) {
            throw new Error("Invalid API key");
        }
        console.log('pass1')
        
        const [userId, emailEncoded] = firstPart.split('-');
        const [customerIdEncoded, expiresAtEncoded] = timestampPart.split('-');
        
        if(!userId || !emailEncoded || !customerIdEncoded || !expiresAtEncoded) {
            throw new Error("Invalid API key");
        }
        console.log('pass2')
        
        const email = atob(emailEncoded);
        const customerId = atob(customerIdEncoded);
        const expiresAt = new Date(atob(expiresAtEncoded)).getTime();
        const planStatusDecoded = atob(planStatus);

        if(isNaN(expiresAt)) {
            throw new Error("Invalid API key");
        }
        console.log('pass3')
        
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        const now = Date.now();
        
        if(now - expiresAt > maxAge) {
            throw new Error("API key expired");
        }
        console.log('pass4')
        
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
            throw new Error("User not found");
        }

        if(!userData.stripeCustomerId) {
            throw new Error("Stripe customer ID not found");
        }
        
        if(!userData.subscriptions) {
            throw new Error("Subscription not found");
        }
        
        if(userData.subscriptions.status !== planStatusDecoded || userData.email !== email || userData.stripeCustomerId !== customerId) {
            throw new Error('Invalid API Key');
        }

        const checkKey = await prisma.apiKeys.findUnique({
            where: {
                key: apiKey,
                isActive: true
            }
        });
        
        if(!checkKey) {
            throw new Error('Invalid API Key');
        }
        
        return { valid: true, key: {
            id: userId,
            email: userData.email,
            customerId: userData.stripeCustomerId,
        } };
    } catch (err) {
        return {
            valid: false,
            reason: (err as Error).message
        }
    }
}
