import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

  // Check if the URL has reached its usage limit (0 is unlimited)
  if (urlCheck.uses > 0) {
    if (urlCheck.uses <= urlCheck.timesUsed) {
      return NextResponse.json({ error: "Link has reached its usage limit" }, { status: 403 });
    }

    if(urlCheck.password !== null) {
      // If the URL has a password, return that information
      return NextResponse.json({ hasPassword: true }, { status: 200 });
    }

    // Increment the usage count
    await prisma.shortUrl.update({
      where: { id: urlCheck.id },
      data: { timesUsed: urlCheck.timesUsed + 1 },
    });
  }

  console.table(urlCheck);
  if(urlCheck.password !== null) {
    // If the URL has a password, return that information
    return NextResponse.json({ hasPassword: true }, { status: 200 });
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
