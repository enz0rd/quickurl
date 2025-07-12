import { NextResponse } from "next/server";
import { urlShortenerFormSchema } from "@/lib/schema";
import jwt from 'jsonwebtoken';
import { prisma } from "@/lib/prisma";
import { userRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
    const body = await req.json();
    const parsed = urlShortenerFormSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { url, turnstile, slug, groupId } = parsed.data;

    const captchaRes = await fetch(`https://challenges.cloudflare.com/turnstile/v0/siteverify`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            secret: process.env.NEXT_PUBLIC_CF_SECRET_KEY || '',
            response: turnstile,
        }).toString(),
    });

    const captchaResJson = await captchaRes.json();
    if(!captchaResJson.success) {
        return NextResponse.json({ error: 'Invalid captcha' }, { status: 400 });
    }

    let userId: string | null = null;
    // TODO: Implement the logic to shorten the URL
    const authHeader = req.headers.get('Authorization');

    if(authHeader) {
        try {
            const decoded = jwt.verify(authHeader, process.env.JWT_SECRET!) as { id: string };
            userId = decoded.id;
        } catch (err) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }
    }

    const userPlan = await prisma.subscription.findUnique({
        where: {
            userId: userId || undefined,
            status: {
                in: ['active', 'trialing']
            },
        }
    })

    let plan: "free" | "pro" = "free";
    if(userPlan) {
        plan = "pro";
    }

    let identification = '';
    if(!userId) {
        identification = req.headers.get('x-forwarded-for') || 'unknown';
    } else {
        identification = userId;
    }
    // verify rate limit
    const rate = await userRateLimit(identification, plan);

    if(!rate.allowed) {
        return NextResponse.json({ error: 'Monthly link creation limit reached' }, { status: 429 });
    }

    let newSlug: string = "";

    if(slug == null || slug == "") {
        newSlug = Math.random().toString(36).slice(2, 8);
    }

    const shortUrlRecord = await prisma.shortUrl.create({
        data: {
            originalUrl: url,
            slug: slug || newSlug!,
            userId: userId || null
        }
    });

    if(!shortUrlRecord) {
        return NextResponse.json({ error: 'Error creating short URL' }, { status: 500 });
    }

    if(groupId) {
        const groupCheck = await prisma.shortUrlGroups.findUnique({
            where: {
                id: groupId,
            },
        })

        if(!groupCheck) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }

        const linkedRecord = await prisma.shortUrl.update({
            data: {
                groupId: groupCheck.id,
            },
            where: {
                id: shortUrlRecord.id
            }
        });

        if(!linkedRecord) {
            return NextResponse.json({ error: 'Error linking URL to group' }, { status: 500 });
        }
    }
    
    const urlToReturn = new URL(req.url).origin + "/r/" + shortUrlRecord.slug;

    return NextResponse.json({ shortenedUrl: urlToReturn }, { status: 200 });
}
