import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

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

  const urlToRedirect = urlCheck.originalUrl

  return NextResponse.json({ urlToRedirect }, { status: 200 });
}
