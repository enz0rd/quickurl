import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ValidateToken from "@/lib/auth";

export async function DELETE(req: Request) {
  try {
    const token = await ValidateToken(req);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Corrigindo o acesso ao id do usuário no token
    let userId: string | undefined;

    if (
      typeof token.token === "object" &&
      token.token !== null &&
      "id" in token.token
    ) {
      userId = (token.token as any).id;
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url)
    
    const keyId = searchParams.get("keyId");
    
    if(!keyId) {
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
