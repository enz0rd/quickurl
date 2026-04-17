import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { checkUserPlan } from "@/lib/plan";

export async function GET(request: Request) {
  const token = request.headers.get("Authorization");
  const userPlan = request.headers.get("UserPlan") || "";
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret",
    );
    const userId = (decoded as { id: string }).id;

    var permissions = {
      allowEdit: false,
      allowDA: false,
      allowQRCode: false,
      allowExport: false,
      allowImport: false,
    };
    if (userPlan) {
      const checkPlan = await checkUserPlan(userPlan);
      if (checkPlan) {
        permissions = {
          allowEdit: checkPlan,
          allowDA: checkPlan,
          allowQRCode: checkPlan,
          allowExport: checkPlan,
          allowImport: checkPlan,
        };
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        twoFAEnabled: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ ...user, permissions}, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
