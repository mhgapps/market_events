import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const inquiryId = Number(params.id);
    const { eventTypeId } = await request.json();
    const updatedInquiry = await prisma.inquiry.update({
      where: { id: inquiryId },
      data: {
        eventTypeId: eventTypeId || null,
      },
    });
    return NextResponse.json(updatedInquiry);
  } catch (error) {
    console.error('Error updating inquiry event type:', error);
    return NextResponse.json({ error: 'Failed to update event type' }, { status: 500 });
  }
}