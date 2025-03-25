import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface RouteProps {
  params: { id: string };
}

/**
 * POST /api/inquiries/[id]/convert
 * Converts an inquiry into an event by transferring event details.
 */
export async function POST(request: Request, { params }: RouteProps) {
  try {
    const inquiryId = Number(params.id);

    // 1. Fetch the inquiry (including its location)
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
      include: {
        location: true, // so we can get brandId from location.brandId
      },
    });

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    // 2. Infer brandId from the location
    //    If location is null or doesn't have brandId, default to 1 or throw an error
    //    Adjust as needed if your schema is different
    const brandIdFromLocation = inquiry.location?.brandId;
    if (!brandIdFromLocation) {
      return NextResponse.json({ error: "Location or brandId not found on inquiry" }, { status: 400 });
    }

    // 3. Create the event with transferred data
    const newEvent = await prisma.event.create({
      data: {
        // link back to the inquiry
        inquiryId,

        // brand & location from inquiry
        brandId: brandIdFromLocation,
        locationId: inquiry.locationId!,

        // status is PENDING by default
        status: "PENDING",

        // date/time/guestCount from inquiry
        eventDate: inquiry.eventDate || new Date(),
        eventTime: inquiry.eventTime || new Date(),
        guestCount: inquiry.guestCount || 0,

        // any other fields you want to set (taxRate, specialRequest, etc.)
      },
    });

    return NextResponse.json({ success: true, event: newEvent });
  } catch (error) {
    console.error("Error converting inquiry to event:", error);
    return NextResponse.json({ error: "Failed to convert inquiry" }, { status: 500 });
  }
}