import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Inquiry received:", body);
    console.log("Event Date:", body.eventDate, "Event Time:", body.eventTime);
    console.log("Parsed guestCount:", body.guestCount ? parseInt(body.guestCount) : null);
    console.log("Parsed eventTypeId:", body.eventTypeId ? parseInt(body.eventTypeId) : null);

    const inquiry = await prisma.inquiry.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        primaryPhone: body.primaryPhone,
        secondaryPhone: body.secondaryPhone || null,
        message: body.message || null,
        eventDate: body.eventDate ? new Date(body.eventDate) : null,
        eventTime: body.eventTime && body.eventDate ? new Date(`${body.eventDate}T${body.eventTime}`) : null,
        guestCount: body.guestCount ? parseInt(body.guestCount) : null,
        service: body.service || null,
        employeeName: body.employeeName || null,
        eventTypeId: body.eventTypeId ? parseInt(body.eventTypeId) : null,
      },
    });

    console.log("Inquiry created:", inquiry);
    return NextResponse.json({ message: "Inquiry submitted successfully.", inquiry });
  } catch (error) {
    console.error("Error processing inquiry:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Internal Server Error: ${errorMessage}` }, { status: 500 });
  }
}