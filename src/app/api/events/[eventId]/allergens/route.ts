import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface RouteProps {
  params: { eventId: string }
}

export async function POST(request: Request, { params }: RouteProps) {
  try {
    const eventId = Number(params.eventId);
    const { allergenIds } = await request.json(); // expect an array of numbers

    if (!Array.isArray(allergenIds)) {
      return NextResponse.json({ error: "Invalid allergenIds" }, { status: 400 });
    }

    // Delete existing eventAllergens for this event
    await prisma.eventAllergens.deleteMany({
      where: { eventId },
    });

    // Create new eventAllergens if allergenIds array is not empty
    if (allergenIds.length > 0) {
      const data = allergenIds.map((allergenId: number) => ({
        eventId,
        allergenId,
      }));
      await prisma.eventAllergens.createMany({ data });
    }

    // Retrieve updated eventAllergens along with allergen details
    const updatedAllergens = await prisma.eventAllergens.findMany({
      where: { eventId },
      include: { allergen: true },
    });

    return NextResponse.json(updatedAllergens);
  } catch (error) {
    console.error("Error updating event allergens:", error);
    return NextResponse.json({ error: "Failed to update event allergens" }, { status: 500 });
  }
}