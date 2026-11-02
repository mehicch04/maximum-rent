ALTER TABLE "Car" ADD COLUMN IF NOT EXISTS "descriptionDe" TEXT, ADD COLUMN IF NOT EXISTS "descriptionEs" TEXT;

CREATE TABLE IF NOT EXISTS "Promotion" (
  "id" TEXT NOT NULL,
  "titleHr" TEXT NOT NULL,
  "titleEn" TEXT, "titleDe" TEXT, "titleEs" TEXT,
  "textHr" TEXT, "textEn" TEXT, "textDe" TEXT, "textEs" TEXT,
  "badge" TEXT, "image" TEXT, "link" TEXT, "carId" TEXT,
  "startsAt" TIMESTAMP(3), "endsAt" TIMESTAMP(3),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Promotion_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Promotion_isActive_sortOrder_idx" ON "Promotion"("isActive", "sortOrder");
