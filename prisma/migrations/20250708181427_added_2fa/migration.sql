/*
  Warnings:

  - A unique constraint covering the columns `[twoFASecret]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ResetPasswordToken" ALTER COLUMN "expDate" SET DEFAULT NOW() + INTERVAL '15 minutes';

-- AlterTable
ALTER TABLE "ShortUrl" ALTER COLUMN "expDate" SET DEFAULT NOW() + INTERVAL '5 days';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "twoFAEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFASecret" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_twoFASecret_key" ON "User"("twoFASecret");
