import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const now = new Date();
    console.log(`Cron job ran at ${now.toISOString()}`);

    // Delete expired password tokens
    try {
        const deletedResetPasswordTokens = await prisma.resetPasswordToken.deleteMany({
            where: {
                expDate: {
                    lt: now,
                },
            },
        });

        const deletedChangeEmailTokens = await prisma.changeEmailToken.deleteMany({
            where: {
                expDate: {
                    lt: now,
                },
            },
        });

        console.log(`Deleted ${deletedChangeEmailTokens.count} expired changed email tokens`);
        console.log(`Deleted ${deletedResetPasswordTokens.count} expired reset password tokens`);
        return NextResponse.json({ deleted: true, passwordTokens: deletedResetPasswordTokens.count, emailTokens: deletedChangeEmailTokens.count }, { status: 200 });
} catch (error) {
    console.error("Error deleting expired tokens:", error);
    return NextResponse.json({ error: "Error deleting expired tokens" }, { status: 500 });
}
}