import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const now = new Date();
    const expired30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 dias em milissegundos
    console.log(`Cron job ran at ${now.toISOString()}`);
    const errors: { message: string, reason: string }[] = [];

    // Delete expired data analytics
    let deletedDataAnalytics = 0;
    let deletedLinks = 0;
    try {
        await prisma.$transaction(async (tx) => {
            const deletedDA = await tx.dataAnalytics.deleteMany({
                where: {
                    accessedAt: {
                        lt: expired30Days,
                    },
                },
            });

            const deletedPublicSU = await tx.shortUrl.deleteMany({
                where: {
                    expDate: {
                        lt: now,
                    },
                    userId: null,
                },
            });

            const deletedPrivateSU = await tx.shortUrl.deleteMany({
                where: {
                    expDate: {
                        lt: now,
                    },
                    userId: {
                        not: null,
                    },
                    dataAnalytics: {
                        none: {},
                    },
                },
            });
        
            deletedLinks = deletedPublicSU.count + deletedPrivateSU.count;
            deletedDataAnalytics = deletedDA.count
        });
    } catch (error) {
        console.error("Error deleting expired records:", error);
        errors.push({ message: "Error deleting records", reason: JSON.stringify(error) || "Could not set reason, check console" });
    }

    return NextResponse.json({ deleted: true, links: deletedLinks, data_analytics: deletedDataAnalytics }, { status: 200 });
}