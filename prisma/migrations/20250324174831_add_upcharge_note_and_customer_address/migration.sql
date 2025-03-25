-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "zipCode" TEXT;

-- AlterTable
ALTER TABLE "EventPackageItems" ADD COLUMN     "upchargeNote" TEXT;

-- AlterTable
ALTER TABLE "EventPackages" ADD COLUMN     "upchargeNote" TEXT;
