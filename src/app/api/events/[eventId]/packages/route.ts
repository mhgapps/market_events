// app/api/events/[eventId]/packages/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RouteProps {
  params: { eventId: string };
}

export async function POST(request: Request, { params }: RouteProps) {
  try {
    const eventId = Number(params.eventId);
    const { packageId } = await request.json();

    // 1. Create the eventPackages record
    const newEventPackage = await prisma.eventPackages.create({
      data: {
        eventId,
        packageId,
        priceAtBooking: 0, // or your logic
        guestCount: 0,     // or your logic
      },
      // 2. Return nested data
      include: {
        eventPackageItems: true, // no items yet, but let's include anyway
        package: {
          include: {
            packageItems: {
              include: { item: true },
            },
          },
        },
      },
    });

    return NextResponse.json(newEventPackage);
  } catch (error) {
    console.error('Error adding package:', error);
    return NextResponse.json({ error: 'Failed to add package' }, { status: 500 });
  }
}