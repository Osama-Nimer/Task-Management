/*
  Warnings:

  - You are about to drop the column `greade` on the `Answer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "greade",
ADD COLUMN     "grade" INTEGER;
