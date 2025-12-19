/*
  Warnings:

  - You are about to drop the `StudentAnswer` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Submission" ADD COLUMN "feedback" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "StudentAnswer";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "SubmissionAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "answerText" TEXT,
    "fileUrl" TEXT,
    "selectedAnswerId" TEXT,
    "points" INTEGER,
    "feedback" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submissionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    CONSTRAINT "SubmissionAnswer_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SubmissionAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionAnswer_submissionId_questionId_key" ON "SubmissionAnswer"("submissionId", "questionId");
