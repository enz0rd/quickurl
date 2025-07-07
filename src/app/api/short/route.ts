import { NextResponse } from "next/server";
import { urlShortenerFormSchema } from "@/lib/schema";
import jwt from 'jsonwebtoken';
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const body = await req.json();
    const parsed = urlShortenerFormSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { url, turnstile, slug } = parsed.data;

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
    
    const urlToReturn = new URL(req.url).origin + "/r/" + shortUrlRecord.slug;

    return NextResponse.json({ shortenedUrl: urlToReturn }, { status: 200 });
}
