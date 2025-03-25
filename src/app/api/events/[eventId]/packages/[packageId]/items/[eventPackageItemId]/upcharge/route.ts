//src/app/api/events/[eventId]/packages/[packageId]/items/[eventPackageItemId]/upcharge/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface RouteProps {
  params: { eventId: string, packageId: string, eventPackageItemId: string }
}

export async function POST(request: Request, { params }: RouteProps) {
  try {
    // Resolve and convert parameters
    const { eventId: eventIdStr, packageId: packageIdStr, eventPackageItemId: itemIdStr } = params;
    const eventId = Number(eventIdStr);
    const packageId = Number(packageIdStr);
    const eventPackageItemId = Number(itemIdStr);
    
    // Parse JSON payload
    const { upcharge, note } = await request.json();
    console.log("Item-level upcharge route received:", { eventId, packageId, eventPackageItemId, upcharge, note });
    
    // Convert upcharge value to number and then to Prisma.Decimal
    const amount = parseFloat(upcharge);
    if (isNaN(amount)) {
      return NextResponse.json({ error: "Invalid upcharge value" }, { status: 400 });
    }
    const decimalUpcharge = new Prisma.Decimal(amount);

    // Update the EventPackageItems record
    const updatedItem = await prisma.eventPackageItems.update({
      where: {
        id: eventPackageItemId,
      },
      data: {
        finalUpcharge: decimalUpcharge,
        upchargeNote: note,
      },
      include: {
        packageItem: { include: { item: true } },
      },
    });

    console.log("Item-level upcharge updated successfully:", updatedItem);
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating item-level upcharge:", error);
    return NextResponse.json({ error: "Failed to update item-level upcharge" }, { status: 500 });
  }
}