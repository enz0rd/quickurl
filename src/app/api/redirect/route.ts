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
        gt: new Date()
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
    switch (body.browser) {
      case body.browser.includes("Chrome"):
        browser = "Chrome";
        break;
      case body.browser.includes("Chromium"):
        browser = "Chrome";
        break;
      case body.browser.includes("Firefox"):
        browser = "Firefox";
        break;
      case body.browser.includes("Safari"):
        browser = "Safari";
        break;
      case body.browser.includes("Edge"):
        browser = "Edge";
        break;
      case body.browser.includes("Opera"):
        browser = "Opera";
        break;
      default:
        browser = "Other";
        break;
    }

    let os = '';
    switch (body.os) {
      case body.os.includes("Linux"):
        os = "Linux";
        break;
      case body.os.includes("Windows"):
        os = "Windows";
        break;
      case body.os.includes("macOS"):
        os = "macOS";
        break;
      case body.os.includes("Android"):
        os = "Android";
        break;
      case body.os.includes("iOS"):
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
