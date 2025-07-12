-- AlterTable
ALTER TABLE "ChangeEmailToken" ALTER COLUMN "expDate" SET DEFAULT NOW() + INTERVAL '1 day';

-- AlterTable
ALTER TABLE "Reset2FAToken" ALTER COLUMN "expDate" SET DEFAULT NOW() + INTERVAL '15 minutes';

-- AlterTable
ALTER TABLE "ResetPasswordToken" ALTER COLUMN "expDate" SET DEFAULT NOW() + INTERVAL '15 minutes';

-- AlterTable
ALTER TABLE "ShortUrl" ALTER COLUMN "expDate" SET DEFAULT NOW() + INTERVAL '5 days';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "apiKey" TEXT;
