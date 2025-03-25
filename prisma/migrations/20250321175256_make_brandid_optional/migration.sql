-- AlterTable
ALTER TABLE "Items" ADD COLUMN     "brandId" INTEGER;

-- AddForeignKey
ALTER TABLE "Items" ADD CONSTRAINT "Items_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
