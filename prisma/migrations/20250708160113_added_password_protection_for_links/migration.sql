-- AlterTable
ALTER TABLE "ResetPasswordToken" ALTER COLUMN "expDate" SET DEFAULT NOW() + INTERVAL '15 minutes';

-- AlterTable
ALTER TABLE "ShortUrl" ADD COLUMN     "password" TEXT,
ALTER COLUMN "expDate" SET DEFAULT NOW() + INTERVAL '5 days';
