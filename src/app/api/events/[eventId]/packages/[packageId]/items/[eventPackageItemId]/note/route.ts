import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request, { params }: any) {
  console.log("[NOTE ROUTE] Starting POST to update note...");

  try {
    // Await the dynamic route params to avoid Next.js errors
    const resolvedParams = await Promise.resolve(params);
    const eventId = Number(resolvedParams.eventId);
    const packageId = Number(resolvedParams.packageId);
    const eventPackageItemId = Number(resolvedParams.eventPackageItemId);

    console.log("[NOTE ROUTE] eventId:", eventId);
    console.log("[NOTE ROUTE] packageId:", packageId);
    console.log("[NOTE ROUTE] eventPackageItemId:", eventPackageItemId);

    // Parse the JSON body to get the 'note' (raw HTML from Quill)
    const { note } = await request.json();
    console.log("[NOTE ROUTE] Received note:", note);

    // Update the 'notes' column in the EventPackageItems table with the raw HTML
    const updatedItem = await prisma.eventPackageItems.update({
      where: { id: eventPackageItemId },
      data: { notes: note },
      include: {
        packageItem: {
          include: {
            item: true,
          },
        },
      },
    });

    // Return the updated record, so the front end can merge it into state
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}