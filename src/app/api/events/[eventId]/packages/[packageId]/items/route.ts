import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface RouteProps {
  params: { eventId: string; packageId: string };
}

export async function POST(request: Request, { params }: RouteProps) {
  try {
    const eventId = Number(params.eventId);
    const packageId = Number(params.packageId);
    const { itemIds } = await request.json(); // [1, 2, 3]

    // Fetch existing items for this event/package
    const existingItems = await prisma.eventPackageItems.findMany({
      where: { eventId, packageId },
    });
    const existingItemIds = existingItems.map((i) => i.itemId);

    // Filter new itemIds to only include those not already present
    const newItemIds = itemIds?.filter((id: number) => !existingItemIds.includes(id)) || [];

    // Insert only the new items
    if (newItemIds.length > 0) {
      await prisma.eventPackageItems.createMany({
        data: newItemIds.map((itemId: number) => ({
          eventId,
          packageId,
          itemId,
        })),
      });
    }

    // Return the updated eventPackages record
    const updatedPkg = await prisma.eventPackages.findUnique({
      where: { eventId_packageId: { eventId, packageId } },
      include: {
        eventPackageItems: {
          include: {
            packageItem: {
              include: { item: true },
            },
          },
        },
        package: {
          include: {
            packageItems: {
              include: { item: true },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedPkg);
  } catch (error) {
    console.error("Error updating package items:", error);
    return NextResponse.json({ error: "Failed to update package items" }, { status: 500 });
  }
}