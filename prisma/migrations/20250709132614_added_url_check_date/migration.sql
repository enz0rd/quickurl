-- AlterTable
ALTER TABLE "ChangeEmailToken" ALTER COLUMN "expDate" SET DEFAULT NOW() + INTERVAL '1 day';

-- AlterTable
ALTER TABLE "ResetPasswordToken" ALTER COLUMN "expDate" SET DEFAULT NOW() + INTERVAL '15 minutes';

-- AlterTable
ALTER TABLE "ShortUrl" ADD COLUMN     "urlCheckedAt" TIMESTAMP(3),
ALTER COLUMN "expDate" SET DEFAULT NOW() + INTERVAL '5 days';
