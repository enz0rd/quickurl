/*
  Warnings:

  - You are about to drop the column `icon` on the `ShortUrlGroups` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChangeEmailToken" ALTER COLUMN "expDate" SET DEFAULT NOW() + INTERVAL '1 day';

-- AlterTable
ALTER TABLE "Reset2FAToken" ALTER COLUMN "expDate" SET DEFAULT NOW() + INTERVAL '15 minutes';

-- AlterTable
ALTER TABLE "ResetPasswordToken" ALTER COLUMN "expDate" SET DEFAULT NOW() + INTERVAL '15 minutes';

-- AlterTable
ALTER TABLE "ShortUrl" ALTER COLUMN "expDate" SET DEFAULT NOW() + INTERVAL '5 days';

-- AlterTable
ALTER TABLE "ShortUrlGroups" DROP COLUMN "icon",
ADD COLUMN     "shortName" TEXT;
