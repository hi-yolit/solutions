-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELLED', 'TRIAL');

-- AlterTable
ALTER TABLE "profile" ADD COLUMN     "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "currentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "paystackCustomerId" TEXT,
ADD COLUMN     "solutionCredits" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "subscriptionCode" TEXT,
ADD COLUMN     "subscriptionStatus" "SubscriptionStatus",
ADD COLUMN     "trialEndsAt" TIMESTAMP(3);
