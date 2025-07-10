-- AlterTable
ALTER TABLE "ChangeEmailToken" ALTER COLUMN "expDate" SET DEFAULT NOW() + INTERVAL '1 day';

-- AlterTable
ALTER TABLE "Reset2FAToken" ALTER COLUMN "expDate" SET DEFAULT NOW() + INTERVAL '15 minutes';

-- AlterTable
ALTER TABLE "ResetPasswordToken" ALTER COLUMN "expDate" SET DEFAULT NOW() + INTERVAL '15 minutes';

-- AlterTable
ALTER TABLE "ShortUrl" ALTER COLUMN "expDate" SET DEFAULT NOW() + INTERVAL '5 days';

-- CreateTable
CREATE TABLE "ShortUrlGroups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" TEXT NOT NULL,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShortUrlGroups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Groups_Urls" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "shortUrlId" TEXT NOT NULL,

    CONSTRAINT "Groups_Urls_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ShortUrlGroups" ADD CONSTRAINT "ShortUrlGroups_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Groups_Urls" ADD CONSTRAINT "Groups_Urls_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ShortUrlGroups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Groups_Urls" ADD CONSTRAINT "Groups_Urls_shortUrlId_fkey" FOREIGN KEY ("shortUrlId") REFERENCES "ShortUrl"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
