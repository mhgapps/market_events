// app/api/events/[eventId]/packages/[packageId]/items/remove/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RouteProps {
  params: { eventId: string; packageId: string };
}

export async function POST(request: Request, { params }: RouteProps) {
  try {
    const eventId = Number(params.eventId);
    const packageId = Number(params.packageId);
    const { itemId } = await request.json();

    // remove just that single (eventId, packageId, itemId)
    await prisma.eventPackageItems.deleteMany({
      where: { eventId, packageId, itemId },
    });

    // return updated package
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
    console.error("Error removing item:", error);
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  }
}