/*
  Warnings:

  - Made the column `brandId` on table `Items` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Items" DROP CONSTRAINT "Items_brandId_fkey";

-- AlterTable
ALTER TABLE "Items" ALTER COLUMN "brandId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Items" ADD CONSTRAINT "Items_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
