import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    if (!slug) {
      return NextResponse.json(
        {
          message: "Missing 'slug' parameter",
        },
        { status: 400 }
      );
    }

    const token = req.headers.get("Authorization") || "";
    if (token === "") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!process.env.JWT_SECRET) {
      console.log("ALERT - JWT secret not set");
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
    const userId = (jwt.verify(token, process.env.JWT_SECRET) as { id: string })
      .id;

    const linkData = await prisma.shortUrl.findUnique({
      where: {
        slug: slug,
        userId,
      },
    });

    if (!linkData) {
      return NextResponse.json(
        {
          message: "Could not find a link with this slug",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        id: linkData.id,
        slug: linkData.slug,
        originalUrl: linkData.originalUrl,
        uses: linkData.uses,
        expDate: linkData.expDate,
        userId: linkData.userId,
        createdAt: linkData.createdAt,
        updatedAt: linkData.updatedAt,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error fetching link data: " + error.message);
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const oldSlug = searchParams.get("slug");
    const body = await req.json();

    if (!oldSlug) {
      return NextResponse.json(
        {
          message: "Missing 'slug' parameter",
        },
        { status: 400 }
      );
    }

    const token = req.headers.get("Authorization") || "";
    if (token === "") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!process.env.JWT_SECRET) {
      console.log("ALERT - JWT secret not set");
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    const userId = (jwt.verify(token, process.env.JWT_SECRET) as { id: string })
      .id;

    const check = await prisma.shortUrl.findUnique({
      where: {
        slug: oldSlug,
        userId,
      },
    });

    if (!check) {
      return NextResponse.json(
        {
          message: "Couldn't find a link with the slug provided",
        },
        { status: 404 }
      );
    }

    const checkIfNewSlugExists = await prisma.shortUrl.findFirst({
      where: {
        slug: body.slug,
        id: {
          not: check.id,
        },
      },
    });

    if (checkIfNewSlugExists) {
      return NextResponse.json(
        {
          message: "Slug already taken",
        },
        { status: 409 }
      );
    }

    // Preparar os dados para atualização
    const updateData: any = { ...body };

    // Converter expDate de string para DateTime se fornecido
    if (updateData.expDate && typeof updateData.expDate === "string") {
      // Se a string estiver vazia, definir como null para remover a data de expiração
      if (updateData.expDate.trim() === "") {
        updateData.expDate = null;
      } else {
        // Converter para DateTime ISO
        updateData.expDate = new Date(updateData.expDate + "T00:00:00.000Z");
      }
    }

    const patchedLink = await prisma.shortUrl.update({
      where: {
        slug: oldSlug,
      },
      data: updateData,
    });

    return NextResponse.json(
      {
        message: "Link updated successfully",
        data: patchedLink,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error fetching link data: " + error.message);
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
