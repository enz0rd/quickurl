-- AlterTable
ALTER TABLE "ResetPasswordToken" ALTER COLUMN "expDate" SET DEFAULT NOW() + INTERVAL '15 minutes';

-- AlterTable
ALTER TABLE "ShortUrl" ALTER COLUMN "expDate" SET DEFAULT NOW() + INTERVAL '5 days';

-- CreateTable
CREATE TABLE "ChangeEmailToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "changeToken" TEXT NOT NULL,
    "expDate" TIMESTAMP(3) NOT NULL DEFAULT NOW() + INTERVAL '1 day',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChangeEmailToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChangeEmailToken_userId_key" ON "ChangeEmailToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChangeEmailToken_changeToken_key" ON "ChangeEmailToken"("changeToken");

-- AddForeignKey
ALTER TABLE "ChangeEmailToken" ADD CONSTRAINT "ChangeEmailToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
