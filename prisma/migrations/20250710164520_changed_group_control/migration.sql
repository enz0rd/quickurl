/*
  Warnings:

  - You are about to drop the `Groups_Urls` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Groups_Urls" DROP CONSTRAINT "Groups_Urls_groupId_fkey";

-- DropForeignKey
ALTER TABLE "Groups_Urls" DROP CONSTRAINT "Groups_Urls_shortUrlId_fkey";

-- AlterTable
ALTER TABLE "ChangeEmailToken" ALTER COLUMN "expDate" SET DEFAULT NOW() + INTERVAL '1 day';

-- AlterTable
ALTER TABLE "Reset2FAToken" ALTER COLUMN "expDate" SET DEFAULT NOW() + INTERVAL '15 minutes';

-- AlterTable
ALTER TABLE "ResetPasswordToken" ALTER COLUMN "expDate" SET DEFAULT NOW() + INTERVAL '15 minutes';

-- AlterTable
ALTER TABLE "ShortUrl" ADD COLUMN     "groupId" TEXT,
ALTER COLUMN "expDate" SET DEFAULT NOW() + INTERVAL '5 days';

-- DropTable
DROP TABLE "Groups_Urls";

-- AddForeignKey
ALTER TABLE "ShortUrl" ADD CONSTRAINT "ShortUrl_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ShortUrlGroups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
