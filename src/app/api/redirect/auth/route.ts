import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { isURLMalicious } from "@/lib/safeBrowsing";

export async function POST(req: Request) {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    const body = await req.json();

    if (!slug) {
        return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const urlCheck = await prisma.shortUrl.findFirst({
        where: {
            slug,
            expDate: {
                gte: new Date()
            }
        },
    });


    if (!urlCheck) {
        return NextResponse.json({ error: "Slug not found" }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(body.password, urlCheck.password!);
    if (!isPasswordValid) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Verifica se a URL já foi checada ou se faz mais de 7 dias desde a última checagem
    const aWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (
        !urlCheck.isURLChecked ||
        urlCheck.urlCheckedAt === null ||
        urlCheck.urlCheckedAt < aWeek
    ) {
        const isMalicious = await isURLMalicious(urlCheck.originalUrl);
        if (isMalicious) {
            // Update the URL to mark it as checked and malicious
            await prisma.shortUrl.update({
                where: { id: urlCheck.id },
                data: { isURLChecked: true, isMalicious: true, urlCheckedAt: new Date() },
            });

            // Return an error response if the URL is blocked
            return NextResponse.json({ error: "The URL to redirect was blocked because of security reasons" }, { status: 403 });
        }
        // Update the URL to mark it as checked and safe
        await prisma.shortUrl.update({
            where: { id: urlCheck.id },
            data: { isURLChecked: true, isMalicious: false, urlCheckedAt: new Date() },
        });
    }

    if (urlCheck.isMalicious) {
        // If the URL is marked as malicious, return an error response
        return NextResponse.json({ error: "The URL to redirect was blocked because of security reasons" }, { status: 403 });
    }

    // Check if the URL has reached its usage limit (0 is unlimited)
    if (urlCheck.uses > 0) {
        if (urlCheck.uses <= urlCheck.timesUsed) {
            return NextResponse.json({ error: "Link has reached its usage limit" }, { status: 403 });
        }

        // Increment the usage count
        await prisma.shortUrl.update({
            where: { id: urlCheck.id },
            data: { timesUsed: urlCheck.timesUsed + 1 },
        });
    }

    if (urlCheck.userId) {
        let device = '';
        if (["Windows", "Linux", "macOS"].includes(body.os)) {
            device = "desktop";
        } else {
            device = "mobile";
        }

        let browser = '';
        switch (body.browser.toUpperCase()) {
            case "CHROME":
            case "CHROMIUM":
                browser = "Chrome";
                break;
            case "FIREFOX":
                browser = "Firefox";
                break;
            case "SAFARI":
                browser = "Safari";
                break;
            case "EDGE":
                browser = "Edge";
                break;
            case "OPERA":
                browser = "Opera";
                break;
            default:
                browser = "Other";
                break;
        }

        let os = '';
        switch (body.os.toUpperCase()) {
            case "LINUX":
                os = "Linux";
                break;
            case "WINDOWS":
                os = "Windows";
                break;
            case "MACOS":
                os = "macOS";
                break;
            case "ANDROID":
                os = "Android";
                break;
            case "IOS":
                os = "iOS";
                break;
            default:
                os = "Other";
                break;
        }

        // if the url is owned by a user, record data analytics
        const dataAnalytics = await prisma.dataAnalytics.create({
            data: {
                shortUrlId: urlCheck.id,
                ownerId: urlCheck.userId,
                country: body.country || "unknown",
                city: body.city || "unknown",
                browser: browser,
                os: os,
                device: device || "unknown",
            }
        })

        if (!dataAnalytics) {
            console.log("Failed to record data analytics for slug:", slug);
        }
    }

    const urlToRedirect = urlCheck.originalUrl

    return NextResponse.json({ urlToRedirect }, { status: 200 });
}
