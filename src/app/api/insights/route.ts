import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkUserPlan } from "@/lib/plan";
import { ValidateAPIKey, ValidateToken } from "@/lib/auth";
import { getUserRateLimitInfo } from "@/lib/rate-limit";

// this requests gets total links, total clicks and rate limit info for the user, it is used in the dashboard page
export async function GET(request: Request) {
  const apiKey = request.headers.get("Authorization");

  if (!apiKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let tokenCheck: any = await ValidateAPIKey(apiKey);
    let userId = "";
    let plan = "";

    if (!tokenCheck.valid) {
      console.log("API key invalid, checking for token...");
      const validatedToken: any = await ValidateToken(request);

      if (!validatedToken || (!validatedToken.valid && !validatedToken.id)) {
        throw new Error("Unauthorized");
      }
      
      tokenCheck = validatedToken;
      userId = validatedToken.token.id || validatedToken.token.userId || "";
      
      if (!userId) {
        throw new Error("Unauthorized");
      }

      plan =
        request.headers.get("UserPlan") ||
        validatedToken.customerId ||
        userId;
    } else {
      userId = tokenCheck.key!.id;
      plan = userId;
    }

    const checkedPlan = await checkUserPlan(plan);

    let totalLinks = 0;
    let totalClicks = 0;

    if (checkedPlan) {
      totalLinks = await prisma.shortUrl.count({
        where: {
          userId,
        },
      });

      totalClicks = await prisma.dataAnalytics.count({
        where: {
          ownerId: userId,
        },
      });
    }

    const rateLimitInfo = await getUserRateLimitInfo(
      userId,
      checkedPlan ? "pro" : "free",
    );

    return NextResponse.json(
        {
            totalLinks,
            totalClicks,
            rateLimit: rateLimitInfo,
            plan: checkedPlan ? "pro" : "free"
        },
        { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
