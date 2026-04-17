import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { ValidateAPIKey, ValidateToken } from "@/lib/auth";
import { checkUserPlan } from "@/lib/plan";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const plan = request.headers.get("UserPlan") || "";
    if (!type || !["JSON", "EXCEL", "CSV"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid export type" },
        { status: 400 }
      );
    }

    let userId = "";
    try {
      const token = await ValidateToken(request);

      if (!token) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }

      if (
        typeof token.token === "object" &&
        token.token !== null &&
        "id" in token.token
      ) {
        userId = (token.token as any).id;
      }
    } catch {
      const token = request.headers.get("Authorization");
      const apiKey = await ValidateAPIKey(token!);

      if (!apiKey.valid) {
        return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
      }

      userId = apiKey.key!.id;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        urls: true,
      },
    });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userPlan = await checkUserPlan(plan);
    if (!userPlan) {
      return NextResponse.json(
        { error: "User does not have permission to export links" },
        { status: 403 }
      );
    }

    let list: {
      slug: string;
      originalUrl: string;
      uses: number;
      timesUsed: number;
      expDate: string;
      createdAt: string;
      updatedAt: string;
    }[] = [];

    const rawList = await prisma.shortUrl.findMany({
      where: {
        userId: user.id,
      },
      select: {
        slug: true,
        originalUrl: true,
        uses: true,
        timesUsed: true,
        expDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    list = rawList
      .filter((item) => item.slug !== null && item.expDate !== null)
      .map((item) => ({
        slug: item.slug!,
        originalUrl: item.originalUrl,
        uses: item.uses,
        timesUsed: item.timesUsed,
        expDate: item.expDate!.toISOString(),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      }));

    if (!list || list.length === 0) {
      return NextResponse.json({ error: "Links not found" }, { status: 404 });
    }

    return NextResponse.json({ list }, { status: 200 });
  } catch (error) {
    console.error("Error exporting links:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
