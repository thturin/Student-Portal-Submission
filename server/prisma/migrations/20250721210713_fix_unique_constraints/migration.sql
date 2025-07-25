/*
  Warnings:

  - A unique constraint covering the columns `[userId,assignmentId]` on the table `Submission` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_password_key";

-- AlterTable
ALTER TABLE "Submission" ALTER COLUMN "score" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Submission_userId_assignmentId_key" ON "Submission"("userId", "assignmentId");
