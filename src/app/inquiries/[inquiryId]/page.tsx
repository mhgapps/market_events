export const dynamic = "force-dynamic";
export const dynamicParams = true;

import { PrismaClient, Inquiry, InquiryContact, EventType, Location } from "@prisma/client";
import InquiryDetailClient from "./InquiryDetailClient";

const prisma = new PrismaClient();

// Merge Inquiry with its related fields
interface InquiryWithContacts extends Inquiry {
  inquiryContacts: InquiryContact[];
  eventType: EventType | null;
  location: Location | null; // add location here
}

export default async function InquiryDetailPage({ params }: { params: { inquiryId: string } }) {
  // Use "inquiryId" from folder [inquiryId]
  const id = Number(params.inquiryId);

  // Fetch scalar fields + eventType + location + inquiryContacts
  const inquiry = (await prisma.inquiry.findUnique({
    where: { id },
    include: {
      eventType: true,
      location: true, // <--- fetch location
      inquiryContacts: true,
    },
  })) as InquiryWithContacts | null;

  if (!inquiry) {
    return (
      <div style={{ padding: "1rem" }}>
        <h1>Inquiry Not Found</h1>
        <p>No inquiry with ID {params.inquiryId} exists.</p>
        <a href="/inquiries">Back to Inquiries</a>
      </div>
    );
  }

  // Pass the data (including location + inquiryContacts) to the client component
  return <InquiryDetailClient inquiry={inquiry} />;
}