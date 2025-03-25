import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RouteProps {
  params: {
    eventId: string;
    packageId: string;
  };
}

/**
 * GET or PUT or PATCH methods might exist here.
 * We only show the DELETE fix.
 */

/**
 * DELETE /api/events/[eventId]/packages/[packageId]
 * Removes the (eventId, packageId) record from EventPackages,
 * plus any eventPackageItems for that combination.
 */
export async function DELETE(request: Request, { params }: RouteProps) {
  try {
    const eventId = Number(params.eventId);
    const packageId = Number(params.packageId);

    // 1. Remove event-level item selections for this package
    await prisma.eventPackageItems.deleteMany({
      where: {
        eventId,
        packageId,
      },
    });

    // 2. Remove the EventPackages record
    await prisma.eventPackages.delete({
      where: {
        eventId_packageId: {
          eventId,
          packageId,
        },
      },
    });

    // Return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing package from event:', error);
    return NextResponse.json({ error: 'Failed to remove package from event' }, {
      status: 500,
    });
  }
}
