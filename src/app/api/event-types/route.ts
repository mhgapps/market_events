import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /api/event-types
 * Returns an array of event types from your `EventType` table.
 */
export async function GET() {
  try {
    const types = await prisma.eventType.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return NextResponse.json(types);
  } catch (error) {
    console.error("Error fetching event types:", error);
    return NextResponse.json({ error: "Failed to get event types" }, { status: 500 });
  }
}