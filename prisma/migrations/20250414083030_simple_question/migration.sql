/*
  Warnings:

  - You are about to drop the column `pageNumber` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "pageNumber",
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;
