import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      firstName,
      lastName,
      email,
      primaryPhone,
      secondaryPhone,
      eventDate,
      eventTime,
      guestCount,
      service,
      message,
      employeeName,
      locationId,
    } = data;

    const newInquiry = await prisma.inquiry.create({
      data: {
        firstName,
        lastName,
        email,
        primaryPhone,
        secondaryPhone,
        // Combine eventDate + eventTime if both exist
        eventDate: eventDate ? new Date(eventDate) : null,
        eventTime:
          eventDate && eventTime
            ? new Date(`${eventDate}T${eventTime}`)
            : null,
        guestCount: guestCount ? Number(guestCount) : null,
        service,
        message,
        employeeName,

        // Use 'location' instead of 'locationId'
        location: locationId
          ? {
              connect: {
                id: Number(locationId),
              },
            }
          : undefined,

        // Connect or create the Customer by email
        customer: {
          connectOrCreate: {
            where: { email },
            create: {
              firstName,
              lastName,
              email,
              phone: primaryPhone,
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, inquiry: newInquiry });
  } catch (error) {
    console.error("Error creating inquiry with location & customer:", error);
    return NextResponse.json(
      { error: "Failed to create inquiry" },
      { status: 500 }
    );
  }
}