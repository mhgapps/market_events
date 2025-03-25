import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /api/assigned-locations
 * Returns an array of locations the user is assigned to.
 * Example: all locations from your "Location" table.
 */
export async function GET() {
  try {
    // 1. Fetch from the "Location" table. Adjust if you have a where clause.
    const userLocations = await prisma.location.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(userLocations);
  } catch (error) {
    console.error("Error fetching assigned locations:", error);
    return NextResponse.json({ error: "Failed to get assigned locations" }, { status: 500 });
  }
}