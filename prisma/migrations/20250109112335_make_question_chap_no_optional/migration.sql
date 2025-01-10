/*
  Warnings:

  - The values [EXPERT] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `expertId` on the `Solution` table. All the data in the column will be lost.
  - You are about to drop the column `verificationStatus` on the `Solution` table. All the data in the column will be lost.
  - You are about to drop the `ExpertProfile` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Resource` table without a default value. This is not possible if the table is not empty.
  - Added the required column `adminId` to the `Solution` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "QuestionStatus" AS ENUM ('DRAFT', 'LIVE');

-- CreateEnum
CREATE TYPE "ResourceStatus" AS ENUM ('DRAFT', 'LIVE');

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('STUDENT', 'ADMIN');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "ExpertProfile" DROP CONSTRAINT "ExpertProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "Solution" DROP CONSTRAINT "Solution_expertId_fkey";

-- AlterTable
ALTER TABLE "Chapter" ALTER COLUMN "number" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "status" "QuestionStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" "ResourceStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Solution" DROP COLUMN "expertId",
DROP COLUMN "verificationStatus",
ADD COLUMN     "adminId" TEXT NOT NULL;

-- DropTable
DROP TABLE "ExpertProfile";

-- DropEnum
DROP TYPE "VerificationStatus";

-- AddForeignKey
ALTER TABLE "Solution" ADD CONSTRAINT "Solution_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
