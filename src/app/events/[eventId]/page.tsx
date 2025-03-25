export const dynamic = "force-dynamic";

import { PrismaClient } from "@prisma/client";
import EventDetailClient from "./EventDetailClient";

const prisma = new PrismaClient();

/**
 * Recursively convert any Prisma Decimal fields to plain numbers.
 * Next.js can't serialize Decimal objects by default.
 */
function decimalToNumber(obj: any): any {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  // If it's a Date object, return it as is
  if (obj instanceof Date) {
    return obj;
  }
  // If the object has a toNumber method, assume it's a Decimal and convert it
  if (typeof obj.toNumber === "function") {
    return obj.toNumber();
  }
  // If it's an array, recursively convert each element
  if (Array.isArray(obj)) {
    return obj.map(decimalToNumber);
  }
  // Otherwise, create a new object and recursively convert each property
  const newObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      newObj[key] = decimalToNumber(obj[key]);
    }
  }
  return newObj;
}

export default async function EventDetailPage({ params }: { params: { eventId: string } }) {
  // Convert the eventId param from string to number
  const eventId = Number(params.eventId);

  // 1. Fetch the event with location, inquiry, payments, eventPackages + eventPackageItems, etc.
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      inquiry: {
        include: {
          inquiryContacts: true,
          customer: true,
          eventType: true,
        },
      },
      location: true,
      payments: true,
      eventPackages: {
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
      },
    },
  });

  // If no event is found, return a simple 'Not Found' message
  if (!event) {
    return (
      <div style={{ padding: "1rem" }}>
        <h1>Event Not Found</h1>
        <p>No event with ID {eventId} exists.</p>
        <a href="/events">Back to Events</a>
      </div>
    );
  }

  // 2. Fetch brand-limited packages
  const brandId = event.location?.brandId || 0;
  const allPackages = await prisma.package.findMany({
    where: { brandId },
    orderBy: { name: "asc" },
    include: {
      packageItems: {
        include: { item: true },
      },
    },
  });

  // 3. Fetch event types if needed
  const allEventTypes = await prisma.eventType.findMany({
    orderBy: { name: "asc" },
  });

  // 4. Convert all Decimal fields to plain numbers
  const plainEvent = decimalToNumber(event);
  const plainPackages = decimalToNumber(allPackages);
  const plainEventTypes = decimalToNumber(allEventTypes);

  // Pass the converted data to the client component
  return (
    <EventDetailClient
      event={plainEvent}
      allPackages={plainPackages}
      allEventTypes={plainEventTypes}
    />
  );
}