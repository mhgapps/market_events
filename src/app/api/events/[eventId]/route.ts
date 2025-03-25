import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface RouteProps {
  params: { eventId: string };
}

export async function PUT(request: Request, { params }: RouteProps) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const eventId = Number(resolvedParams.eventId);
    const { status, eventDate, eventTime, guestCount, specialRequest } = await request.json();

    // Combine date+time into a single valid Date if needed
    const parsedDate = eventDate ? new Date(eventDate) : null;
    const parsedTime =
      eventDate && eventTime
        ? new Date(`${eventDate}T${eventTime}`)
        : null;

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        status,
        eventDate: parsedDate || new Date(), // default if needed
        eventTime: parsedTime || new Date(), // default if needed
        guestCount: guestCount || 0,
        specialRequest,
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}