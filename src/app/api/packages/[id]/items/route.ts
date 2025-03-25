//src/app/api/packages/[id]/items/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface RouteProps {
  params: { id: string };
}

/**
 * POST /api/packages/[id]/items
 * Attaches an item to the given package.
 * Body can be:
 *  { createNewItem: true, name, description, category }
 *  or
 *  { createNewItem: false, itemId }
 */
export async function POST(request: Request, { params }: RouteProps) {
  try {
    const packageId = Number(params.id);
    const body = await request.json();

    // 1. Fetch the package so we know which brand it belongs to
    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
      select: { brandId: true }, // we only need the brandId
    });
    if (!pkg) {
      throw new Error("Package not found or brandId not set");
    }

    if (body.createNewItem) {
      // 2. Create a new item with the same brandId as the package
      const newItem = await prisma.items.create({
        data: {
          name: body.name,
          description: body.description || "",
          category: body.category || "",
          brandId: pkg.brandId, // brand is required, so we set brandId
        },
      });

      // 3. Link it to the package via packageItems
      await prisma.packageItems.create({
        data: {
          packageId,
          itemId: newItem.id,
        },
      });

      return NextResponse.json({
        message: "New item created and attached.",
        item: newItem, // so we can update the client side
      });
    } else {
      // Attach existing item
      const itemId = Number(body.itemId);
      await prisma.packageItems.create({
        data: {
          packageId,
          itemId,
        },
      });

      // Optionally return the attached item
      const attachedItem = await prisma.items.findUnique({ where: { id: itemId } });

      return NextResponse.json({
        message: "Existing item attached.",
        item: attachedItem,
      });
    }
  } catch (error) {
    console.error("Error attaching item:", error);
    return NextResponse.json({ error: "Failed to attach item" }, { status: 500 });
  }
}