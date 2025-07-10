-- AlterTable
ALTER TABLE "ChangeEmailToken" ALTER COLUMN "expDate" SET DEFAULT NOW() + INTERVAL '1 day';

-- AlterTable
ALTER TABLE "ResetPasswordToken" ALTER COLUMN "expDate" SET DEFAULT NOW() + INTERVAL '15 minutes';

-- AlterTable
ALTER TABLE "ShortUrl" ALTER COLUMN "expDate" SET DEFAULT NOW() + INTERVAL '5 days';

-- CreateTable
CREATE TABLE "Reset2FAToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resetToken" TEXT NOT NULL,
    "expDate" TIMESTAMP(3) NOT NULL DEFAULT NOW() + INTERVAL '15 minutes',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reset2FAToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reset2FAToken_userId_key" ON "Reset2FAToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Reset2FAToken_resetToken_key" ON "Reset2FAToken"("resetToken");

-- AddForeignKey
ALTER TABLE "Reset2FAToken" ADD CONSTRAINT "Reset2FAToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
