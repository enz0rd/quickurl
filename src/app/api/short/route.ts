import { NextResponse } from "next/server";
import { urlShortenerFormSchema, urlShortenerFormSchemaAPI } from "@/lib/schema";
import { prisma } from "@/lib/prisma";
import { userRateLimit } from "@/lib/rate-limit";
import { ValidateAPIKey, ValidateToken } from "@/lib/auth";

export async function POST(req: Request) {
    const body = await req.json();
    
    
    const { url, turnstile, slug, groupId } = {
        ...body
    };
    let userId = "";
    try {
        
        const token = await ValidateToken(req);
        
        if (!token) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }
        
        if (typeof token.token === "object" && token.token !== null && "id" in token.token) {
            userId = (token.token as any).id;
        }
        
        const parsed = urlShortenerFormSchema.safeParse(body);
        
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }
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
        if (!captchaResJson.success) {
            return NextResponse.json({ error: 'Invalid captcha' }, { status: 400 });
        }
    } catch {
        const token = req.headers.get("Authorization");
        const apiKey = await ValidateAPIKey(token!);

        if (!apiKey.valid) {
            return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
        }

        userId = apiKey.key!.id;

        const parsed = urlShortenerFormSchemaAPI.safeParse(body);
        
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }
    }


    const userPlan = await prisma.subscription.findUnique({
        where: {
            userId: userId || '',
            status: {
                in: ['active', 'trialing']
            },
        }
    })

    let plan: "free" | "pro" = "free";
    if (userPlan) {
        plan = "pro";
    }

    let identification = '';
    if (!userId) {
        identification = req.headers.get('x-forwarded-for') || 'unknown';
    } else {
        identification = userId;
    }
    // verify rate limit
    const rate = await userRateLimit(identification, plan);

    if (!rate.allowed) {
        return NextResponse.json({ error: 'Monthly link creation limit reached' }, { status: 429 });
    }

    let newSlug: string = "";

    if (slug == null || slug == "") {
        newSlug = Math.random().toString(36).slice(2, 8);
    }

    const shortUrlRecord = await prisma.shortUrl.create({
        data: {
            originalUrl: url,
            slug: slug || newSlug!,
            userId: userId || null
        }
    });

    if (!shortUrlRecord) {
        return NextResponse.json({ error: 'Error creating short URL' }, { status: 500 });
    }

    if (groupId) {
        const groupCheck = await prisma.shortUrlGroups.findUnique({
            where: {
                id: groupId,
            },
        })

        if (!groupCheck) {
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

        if (!linkedRecord) {
            return NextResponse.json({ error: 'Error linking URL to group' }, { status: 500 });
        }
    }

    const urlToReturn = new URL(req.url).origin + "/r/" + shortUrlRecord.slug;

    return NextResponse.json({ shortenedUrl: urlToReturn }, { status: 200 });
}
