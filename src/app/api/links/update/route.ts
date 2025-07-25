import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { checkUserPlan } from "@/lib/plan";
import bcrypt from "bcrypt";
import { ValidateAPIKey, ValidateToken } from "@/lib/auth";
import { editLinkSchema } from "@/lib/schema";

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
    const plan = req.headers.get("UserPlan") || "";
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

    const userPlan = await checkUserPlan(plan);
    if (!userPlan) {
      return NextResponse.json({ error: "User does not have permission to edit links" }, { status: 403 });
    }
    const userId = (jwt.verify(token, process.env.JWT_SECRET) as { id: string })
      .id;

    const linkData = await prisma.shortUrl.findUnique({
      where: {
        slug: slug,
        userId,
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            shortName: true,
          }
        },
      }
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
        group: linkData.group,
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

      if(!body.dataToUpdate) {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
      }

      const parsed = editLinkSchema.safeParse(body.dataToUpdate);

      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
      }
    }
    
    const plan = req.headers.get("UserPlan") || userId;

    const userPlan = await checkUserPlan(plan);

    if (!userPlan) {
      return NextResponse.json({ error: "User does not have permission to edit links" }, { status: 403 });
    }

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

    if(body.dataToUpdate.slug) {
      const checkIfNewSlugExists = await prisma.shortUrl.findFirst({
        where: {
          slug: body.dataToUpdate.slug,
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
    }

    if (body.dataToUpdate.password) {
      body.dataToUpdate.password = await bcrypt.hash(body.dataToUpdate.password, 10);
    }

    if (body.resetPassword) {
      body.dataToUpdate.password = null;
    }

    // Preparar os dados para atualização
    const updateData: {
      slug?: string;
      originalUrl?: string;
      uses?: number
      expDate?: Date | string | null,
      password?: string
    } = { ...body.dataToUpdate };

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
