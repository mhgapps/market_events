-- CreateTable
CREATE TABLE "InquiryContact" (
    "id" SERIAL NOT NULL,
    "inquiryId" INTEGER NOT NULL,
    "contactDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InquiryContact_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InquiryContact" ADD CONSTRAINT "InquiryContact_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
