import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { ValidateAPIKey, ValidateToken } from "@/lib/auth";
import { checkUserPlan } from "@/lib/plan";

export async function POST(request: Request) {
  try {
    const plan = request.headers.get("UserPlan") || "";
    console.log("Received import request with plan:", request.headers.get("UserPlan"));

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
      }
    });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userPlan = await checkUserPlan(plan);
    if (!userPlan) {
      return NextResponse.json(
        { error: "User does not have permission to import links" },
        { status: 403 }
      );
    }
    

    try {
      const body = await request.json();
      const links = body;

      console.log(typeof links);
      if (!Array.isArray(links)) {
        return NextResponse.json(
          { error: "Invalid links format" },
          { status: 400 }
        );
      }

      const linksToCreate = links.map((link: any) => ({
        slug: Math.random().toString(36).slice(2, 8),
        originalUrl: link.originalUrl,
        uses: 0,
        timesUsed: link.timesUsed || 0,
        expDate: link.expDate 
          ? new Date(link.expDate) 
          : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        userId: userId,
      }));

      console.log("Links to create:", linksToCreate);

      await prisma.shortUrl.createMany({
        data: linksToCreate,
      });

      return NextResponse.json(
        { message: "Links imported successfully" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error importing links:", error);
      return NextResponse.json(
        { error: "Failed to import links" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error importing links:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
