import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const now = new Date();
    const expired30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 dias em milissegundos
    console.log(`Cron job ran at ${now.toISOString()}`);
    const errors: { message: string, reason: string }[] = [];
    
    // Delete expired data analytics
    let deletedDataAnalytics = 0;
    try {
        const deleted = await prisma.dataAnalytics.deleteMany({
            where: {
                accessedAt: {
                    lt: expired30Days,
                },
            },
        });

        deletedDataAnalytics = deleted.count

    } catch (error) {
        console.error("Error deleting expired data analytics:", error);
        errors.push({ message: "Error deleting expired data analytics", reason: JSON.stringify(error) || "Could not set reason, check console" });
    }

    // Delete expired links
    let deletedLinks = 0;
    try {
        const deleted = await prisma.shortUrl.deleteMany({
            where: {
                expDate: {
                    lt: now,
                },
            },
        });

        console.log(`Deleted ${deleted.count} expired links`);
        deletedLinks = deleted.count;

    } catch (error) {
        console.error("Error deleting expired links:", error);
        errors.push({ message: "Error deleting expired links", reason: JSON.stringify(error) || "Could not set reason, check console" });
    }

    if(errors.length > 0) {
        return NextResponse.json({ errors: errors }, { status: 500 });
    }

    return NextResponse.json({ deleted: true, links: deletedLinks, data_analytics: deletedDataAnalytics }, { status: 200 });
}