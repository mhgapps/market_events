// src/app/api/inquiries/[id]/contacts/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface RouteProps {
  params: { id: string };
}

/**
 * POST /api/inquiries/[id]/contacts
 * Creates a new InquiryContact record.
 * Expects JSON body: { note, createdBy }
 */
export async function POST(request: Request, { params }: RouteProps) {
  try {
    // 1. Log the route params
    console.log("Route params:", params);

    // Await the params before using them
    const resolvedParams = await Promise.resolve(params);
    const inquiryId = Number(resolvedParams.id);

    const { note, createdBy } = await request.json();

    // 2. Log the request body
    console.log("Request body:", { note, createdBy });

    // 3. Check if the inquiry actually exists
    const existingInquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
    });
    if (!existingInquiry) {
      console.log("No inquiry found with ID:", inquiryId);
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    // 4. Insert new contact
    const newContact = await prisma.inquiryContact.create({
      data: {
        inquiryId,
        note,
        createdBy,
      },
    });

    console.log("New contact created:", newContact);

    return NextResponse.json(newContact);
  } catch (error) {
    // 5. Log the full error details
    console.error("Error creating inquiry contact:", error);
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}