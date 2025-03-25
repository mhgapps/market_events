// src/app/api/events/[eventId]/packages/[packageId]/upcharge/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface RouteProps {
  params: { eventId: string, packageId: string }
}

export async function POST(request: Request, { params }: RouteProps) {
  try {
    // Resolve and convert parameters
    const { eventId: eventIdStr, packageId: packageIdStr } = params;
    const eventId = Number(eventIdStr);
    const packageId = Number(packageIdStr);
    
    // Parse JSON payload
    const { upcharge, note } = await request.json();
    console.log("Package-level upcharge route received:", { eventId, packageId, upcharge, note });
    
    // Convert upcharge value to number and then to Prisma.Decimal
    const amount = parseFloat(upcharge);
    if (isNaN(amount)) {
      return NextResponse.json({ error: "Invalid upcharge value" }, { status: 400 });
    }
    const decimalUpcharge = new Prisma.Decimal(amount);

    // Update the EventPackages record
    const updatedPkg = await prisma.eventPackages.update({
      where: {
        eventId_packageId: { eventId, packageId },
      },
      data: {
        upcharge: decimalUpcharge,
        upchargeNote: note,
      },
      include: {
        eventPackageItems: {
          include: {
            packageItem: { include: { item: true } },
          },
        },
        package: true,
      },
    });

    console.log("Package-level upcharge updated successfully:", updatedPkg);
    return NextResponse.json(updatedPkg);
  } catch (error) {
    console.error("Error updating package-level upcharge:", error);
    return NextResponse.json({ error: "Failed to add upcharge" }, { status: 500 });
  }
}