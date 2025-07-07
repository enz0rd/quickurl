import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const now = new Date();
    const expired30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 dias em milissegundos
    console.log(`Cron job ran at ${now.toISOString()}`);

    // Delete expired links
    try {
        const deleted = await prisma.dataAnalytics.deleteMany({
            where: {
                accessedAt: {
                    lt: expired30Days,
                },
            },
        });

        console.log(`Deleted ${deleted.count} expired data analytics`);
        return NextResponse.json({ message: `Deleted ${deleted.count} expired data analytics` }, { status: 200 });

    } catch (error) {
        console.error("Error deleting expired data analytics:", error);
        return NextResponse.json({ error: "Error deleting expired data analytics" }, { status: 500 });
    }
}