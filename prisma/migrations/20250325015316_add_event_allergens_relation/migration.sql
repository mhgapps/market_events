-- CreateTable
CREATE TABLE "Allergens" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Allergens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventAllergens" (
    "eventId" INTEGER NOT NULL,
    "allergenId" INTEGER NOT NULL,

    CONSTRAINT "EventAllergens_pkey" PRIMARY KEY ("eventId","allergenId")
);

-- AddForeignKey
ALTER TABLE "EventAllergens" ADD CONSTRAINT "EventAllergens_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAllergens" ADD CONSTRAINT "EventAllergens_allergenId_fkey" FOREIGN KEY ("allergenId") REFERENCES "Allergens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
