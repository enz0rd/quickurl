import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {

        const token = req.headers.get("Authorization");

        if (!token) {
            return NextResponse.json({
                error: "Unauthorized",
            }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

        if (!decoded || typeof decoded !== "object" || !decoded.id) {
            return NextResponse.json({
                error: "Unauthorized",
            }, { status: 401 });
        }

        const body = await req.json();

        const groupNameCheck = await prisma.shortUrlGroups.findFirst({
            where: {
                name: body.name,
                ownerId: decoded.id
            }
        })

        if (groupNameCheck) {
            return NextResponse.json({
                error: "You already have a group with this name",
            }, { status: 400 });
        }

        const groupShortNameCheck = await prisma.shortUrlGroups.findFirst({
            where: {
                shortName: body.shortName,
                ownerId: decoded.id
            }
        })

        if (groupShortNameCheck) {
            return NextResponse.json({
                error: "You already have a group with this short name",
            }, { status: 400 });
        }

        let data: {
            name: string;
            shortName: string;
            description?: string;
            ownerId: string
        } = {
            name: "",
            shortName: "",
            ownerId: ""
        };  
        
        if (body.description) {
            data = {
                name: body.name,
                shortName: body.shortName,
                description: body.description,
                ownerId: decoded.id
            }
        } else {
            data = {
                name: body.name,
                shortName: body.shortName,
                ownerId: decoded.id
            }
        }

        const group = await prisma.shortUrlGroups.create({
            data: data
        })

        if(!group) {
            return NextResponse.json({
                error: "Could not create group, please try again later",
            }, { status: 500 });
        }

        return NextResponse.json({ message: "Group created successfully" }, { status: 200 });

    } catch (error) {
        console.log("Error creating group: ", error);
        return NextResponse.json({
            error: "Internal server error",
        }, { status: 500 });
    }
}