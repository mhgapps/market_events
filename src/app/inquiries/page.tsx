import { PrismaClient, Inquiry, EventType, Location, InquiryContact } from "@prisma/client";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Grid
} from "@mui/material";
import Link from "next/link";

const prisma = new PrismaClient();

// 1. Define an interface that extends the default Inquiry
//    so TS knows about the eventType, inquiryContacts, and location relations.
interface InquiryWithRelations extends Inquiry {
  eventType: EventType | null;
  location: Location | null;
  inquiryContacts: InquiryContact[];
}

/**
 * Server component that queries the database via Prisma.
 * No 'use client' or 'use()' is needed, so Prisma runs on the server.
 */
export default async function AdminInquiriesPage() {
  const now = new Date();

  // 2. Cast the findMany result to InquiryWithRelations[]
  const inquiries = (await prisma.inquiry.findMany({
    where: {
      OR: [
        {
          events: {
            none: {},
          },
        },
        {
          events: {
            some: {
              eventDate: {
                gte: now,
              },
            },
          },
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      eventType: true,
      inquiryContacts: true, 
      location: true,       // fetch location
    },
  })) as InquiryWithRelations[];  // <--- cast here

  const nowMs = now.getTime();
  const ms48hours = 48 * 60 * 60 * 1000; // 48 hours in ms

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        New Event Inquiries
      </Typography>

      {inquiries.length === 0 ? (
        <Typography>No pending inquiries found.</Typography>
      ) : (
        <Grid container spacing={2}>
          {inquiries.map((inq) => {
            // highlight new inquiries (created < 48h ago)
            const createdAtTime = new Date(inq.createdAt).getTime();
            const isNew = nowMs - createdAtTime < ms48hours;

            // If new, add red border, else no border
            const borderColor = isNew ? "red" : "transparent";

            // Check if there's at least one contact log
            const hasContacts = inq.inquiryContacts?.length > 0;

            return (
              <Grid item xs={12} md={6} key={inq.id}>
                <Link
                  href={`/inquiries/${inq.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <Card
                    sx={{
                      position: "relative",
                      backgroundColor: "#fff",
                      border: 1,
                      borderColor,
                      borderRadius: 2,
                      "&:hover": { boxShadow: 6 },
                    }}
                  >
                    <CardActionArea>
                      <CardContent>
                        {/* Responded label (top-right corner) */}
                        {hasContacts && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              backgroundColor: "green",
                              color: "#fff",
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                            }}
                          >
                            RESPONDED
                          </Box>
                        )}

                        <Typography variant="h6" gutterBottom>
                          {inq.firstName} {inq.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {inq.email}
                        </Typography>

                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" fontWeight="bold">
                            Date &amp; Time:
                          </Typography>
                          <Typography variant="body2">
                            {inq.eventDate
                              ? new Date(inq.eventDate).toLocaleDateString()
                              : "N/A"}{" "}
                            {inq.eventTime
                              ? new Date(inq.eventTime).toLocaleTimeString()
                              : ""}
                          </Typography>
                        </Box>

                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" fontWeight="bold">
                            Event Type:
                          </Typography>
                          <Typography variant="body2">
                            {inq.eventType?.name || "N/A"}
                          </Typography>
                        </Box>
                      </CardContent>

                      {/* Location at the bottom right corner */}
                      {inq.location && (
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: 8,
                            right: 8,
                          }}
                        >
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color="text.secondary"
                          >
                            {inq.location.name}
                          </Typography>
                        </Box>
                      )}
                    </CardActionArea>
                  </Card>
                </Link>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}