import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/packages
 * Creates a new package in the database.
 * Expects JSON body: { name, brandId, description, pricePerPerson }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, brandId, description, pricePerPerson } = body;

    // Create the new package
    const newPackage = await prisma.package.create({
      data: {
        name,
        brandId,
        description,
        pricePerPerson,
      },
    });

    return NextResponse.json(newPackage);
  } catch (error) {
    console.error('Error creating package:', error);
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 });
  }
}