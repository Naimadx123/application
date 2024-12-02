-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('EN', 'PL');

-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "owner" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("id")
);
