-- CreateTable
CREATE TABLE "CFSimulation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "inputData" JSONB NOT NULL,
    "results" JSONB,
    "cashFlowTable" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CFSimulation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CFSimulation_userId_idx" ON "CFSimulation"("userId");
