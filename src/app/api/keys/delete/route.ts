import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ValidateAPIKey, ValidateToken } from "@/lib/auth";

export async function DELETE(req: Request) {
  try {
    let userId = "";
    try {
      const token = await ValidateToken(req);

      if (!token) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }

      if (typeof token.token === "object" && token.token !== null && "id" in token.token) {
        userId = (token.token as any).id;
      }
    } catch {
      const token = req.headers.get("Authorization");
      const apiKey = await ValidateAPIKey(token!);

      if (!apiKey.valid) {
        return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
      }

      userId = apiKey.key!.id;
    }

    const { searchParams } = new URL(req.url)

    const keyId = searchParams.get("keyId");

    if (!keyId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 403 });
    }

    const keyCheck = await prisma.apiKeys.findFirst({
      where: {
        id: keyId,
        userId,
      },
    });

    if (!keyCheck) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    await prisma.apiKeys.delete({
      where: {
        id: keyId,
      },
    });

    return NextResponse.json({ message: "API key deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("ERROR CREATING API KEY - ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
