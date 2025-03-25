import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// A simple contract template function
function generateContractContent(event: any): string {
  return `
    <h1>Event Contract</h1>
    <p>Thank you for choosing us to serve your event.</p>
    <h2>Event Details</h2>
    <p>Date: ${new Date(event.eventDate).toLocaleDateString()}</p>
    <p>Time: ${new Date(event.eventTime).toLocaleTimeString()}</p>
    <p>Guest Count: ${event.guestCount}</p>
    <h2>Terms and Conditions</h2>
    <p>[Insert your terms and conditions here]</p>
  `;
}

export async function POST(request: Request) {
  try {
    const { eventId } = await request.json();
    const event = await prisma.event.findUnique({
      where: { id: Number(eventId) },
    });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    const content = generateContractContent(event);
    const contract = await prisma.contract.create({
      data: {
        eventId: Number(eventId),
        content,
      },
    });
    return NextResponse.json(contract);
  } catch (error) {
    console.error("Error generating contract:", error);
    return NextResponse.json({ error: "Failed to generate contract" }, { status: 500 });
  }
}