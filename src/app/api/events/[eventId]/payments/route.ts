// src/app/api/events/[eventId]/payments/[paymentId]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RouteProps {
  params: { eventId: string, paymentId: string }
}

export async function PUT(request: Request, { params }: RouteProps) {
  try {
    const eventId = Number(params.eventId); // For validation or logging if needed
    const paymentId = Number(params.paymentId);
    const { amount, paymentType, referenceNumber, paymentDate } = await request.json();

    const updatedPayment = await prisma.eventPayments.update({
      where: { id: paymentId },
      data: {
        amount: Number(amount),
        paymentType,
        referenceNumber,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      },
    });

    return NextResponse.json(updatedPayment);
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
  }
}