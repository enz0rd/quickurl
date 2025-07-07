import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const now = new Date();
    console.log(`Cron job ran at ${now.toISOString()}`);

    // Delete expired password tokens
    try {
        const deleted = await prisma.resetPasswordToken.deleteMany({
            where: {
                expDate: {
                    lt: now,
                },
            },
        });

        console.log(`Deleted ${deleted.count} expired reset password tokens`);
        return NextResponse.json({ message: `Deleted ${deleted.count} expired reset password tokens` }, { status: 200 });

    } catch (error) {
        console.error("Error deleting expired links:", error);
        return NextResponse.json({ error: "Error deleting expired links" }, { status: 500 });
    }
}