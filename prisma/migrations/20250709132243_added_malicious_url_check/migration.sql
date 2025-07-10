-- AlterTable
ALTER TABLE "ChangeEmailToken" ALTER COLUMN "expDate" SET DEFAULT NOW() + INTERVAL '1 day';

-- AlterTable
ALTER TABLE "ResetPasswordToken" ALTER COLUMN "expDate" SET DEFAULT NOW() + INTERVAL '15 minutes';

-- AlterTable
ALTER TABLE "ShortUrl" ADD COLUMN     "isMalicious" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isURLChecked" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "expDate" SET DEFAULT NOW() + INTERVAL '5 days';
