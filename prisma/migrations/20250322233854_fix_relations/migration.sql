-- AlterTable
ALTER TABLE "Brand" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "EventPackageItems" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "packageId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "finalUpcharge" DECIMAL(10,2) DEFAULT 0.00,
    "quantity" INTEGER DEFAULT 1,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventPackageItems_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EventPackageItems" ADD CONSTRAINT "EventPackageItems_eventId_packageId_fkey" FOREIGN KEY ("eventId", "packageId") REFERENCES "EventPackages"("eventId", "packageId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPackageItems" ADD CONSTRAINT "EventPackageItems_packageId_itemId_fkey" FOREIGN KEY ("packageId", "itemId") REFERENCES "PackageItems"("packageId", "itemId") ON DELETE RESTRICT ON UPDATE CASCADE;
