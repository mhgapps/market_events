"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from "@mui/material";

export default function InquiryDetailClient({ inquiry }: any) {
  // Maintain local state for contact logs
  const [localContacts, setLocalContacts] = useState(inquiry.inquiryContacts || []);

  const [openModal, setOpenModal] = useState(false);
  const [note, setNote] = useState("");
  const [createdBy, setCreatedBy] = useState("");

  // Open/close the “Log Contact” modal
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setNote("");
    setCreatedBy("");
  };

  // Actually save contact to /api/inquiries/[inquiry.id]/contacts
  const handleSaveContact = async () => {
    try {
      const res = await fetch(`/api/inquiries/${inquiry.id}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note, createdBy }),
      });
      if (!res.ok) {
        throw new Error("Failed to create contact");
      }

      // Parse the newly created contact
      const newContact = await res.json();

      // Append it to localContacts so it appears instantly
      setLocalContacts((prev: any) => [...prev, newContact]);

      alert("Contact saved successfully!");
      handleCloseModal();
    } catch (error) {
      console.error(error);
      alert("Error saving contact");
    }
  };

  // Convert to Event Handler
  const handleConvertToEvent = async () => {
    try {
      const res = await fetch(`/api/inquiries/${inquiry.id}/convert`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Failed to convert inquiry");
      }
      const data = await res.json();
      alert("Inquiry converted successfully!");
      // Optionally redirect to the new event's page:
      // window.location.href = `/events/${data.event.id}`;
    } catch (error) {
      console.error(error);
      alert("Error converting inquiry");
    }
  };

  // Helper to render a label/value pair
  function LabelValue({ label, value }: { label: string; value: string | number }) {
    // Convert phone or email to clickable links
    if ((label === "Primary Phone" || label === "Secondary Phone") && typeof value === "string") {
      return (
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {label}
          </Typography>
          <Typography variant="body2">
            <a href={`tel:${value}`} style={{ textDecoration: "none", color: "#1976d2" }}>
              {value}
            </a>
          </Typography>
        </Box>
      );
    } else if (label === "Email" && typeof value === "string") {
      return (
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {label}
          </Typography>
          <Typography variant="body2">
            <a href={`mailto:${value}`} style={{ textDecoration: "none", color: "#1976d2" }}>
              {value}
            </a>
          </Typography>
        </Box>
      );
    } else {
      // Default non-link display
      return (
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {label}
          </Typography>
          <Typography variant="body2">{value}</Typography>
        </Box>
      );
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Buttons above both cards, aligned left */}
      <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-start", gap: 2 }}>
        <Button variant="outlined" color="secondary" href="/inquiries">
          Back
        </Button>
        {/* Convert to Event button -> calls handleConvertToEvent */}
        <Button variant="contained" color="primary" onClick={handleConvertToEvent}>
          Convert to Event
        </Button>
      </Box>

      {/* Two cards side by side on desktop, stacked on mobile */}
      <Grid container spacing={2}>
        {/* Left Card: Inquiry Details */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              {/* Title row: Inquiry Detail + Event Type on left, Inquiry# + Location on right */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
                mb={1}
              >
                <Box>
                  <Typography variant="h5" gutterBottom>
                    Inquiry Detail
                  </Typography>
                  {/* Event Type in larger blue text below "Inquiry Detail" */}
                  <Typography variant="h6" gutterBottom sx={{ color: "#007bff", mt: 0 }}>
                    {inquiry.eventType ? inquiry.eventType.name : "N/A"}
                  </Typography>
                </Box>

                <Box textAlign="right">
                  <Typography variant="h5" gutterBottom>
                    #{inquiry.id}
                  </Typography>
                  {/* Location below the inquiry number */}
                  {inquiry.location && (
                    <Typography variant="body2" color="text.secondary">
                      {inquiry.location.name}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Row 1: Name + Email */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <LabelValue label="Name" value={`${inquiry.firstName} ${inquiry.lastName}`} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <LabelValue label="Email" value={inquiry.email} />
                </Grid>
              </Grid>

              {/* Row 2: Primary + Secondary Phone */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <LabelValue label="Primary Phone" value={inquiry.primaryPhone} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <LabelValue
                    label="Secondary Phone"
                    value={inquiry.secondaryPhone || "N/A"}
                  />
                </Grid>
              </Grid>

              {/* Row 3: Event Date + Time */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <LabelValue
                    label="Event Date"
                    value={
                      inquiry.eventDate
                        ? new Date(inquiry.eventDate).toLocaleDateString()
                        : "N/A"
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <LabelValue
                    label="Event Time"
                    value={
                      inquiry.eventTime
                        ? new Date(inquiry.eventTime).toLocaleTimeString()
                        : "N/A"
                    }
                  />
                </Grid>
              </Grid>

              {/* Row 4: Guest Count + Service */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <LabelValue
                    label="Guest Count"
                    value={inquiry.guestCount?.toString() || "N/A"}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <LabelValue label="Service" value={inquiry.service || "N/A"} />
                </Grid>
              </Grid>

              {/* Row 5: Message */}
              <Box sx={{ mb: 2 }}>
                <LabelValue label="Message" value={inquiry.message || "N/A"} />
              </Box>

              {/* Row 6: Submitted At */}
              <Box sx={{ mb: 2 }}>
                <LabelValue
                  label="Submitted At"
                  value={new Date(inquiry.createdAt).toLocaleString()}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Card: Contact Log */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <CardContent sx={{ flex: "1 1 auto" }}>
              {/* Top row: Contact History + Log Contact button at top right */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Contact History</Typography>
                <Button variant="outlined" color="primary" onClick={handleOpenModal}>
                  Log Contact
                </Button>
              </Box>

              {localContacts.length ? (
                localContacts.map((c: any) => (
                  <Box key={c.id} sx={{ mb: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {new Date(c.contactDate).toLocaleString()} (by {c.createdBy})
                    </Typography>
                    <Typography variant="body2">{c.note}</Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2">No contacts logged.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modal for logging contact */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth>
        <DialogTitle>Log Contact</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Created By"
            value={createdBy}
            onChange={(e) => setCreatedBy(e.target.value)}
            sx={{ marginTop: 2 }} // Prevents label overlap
          />
          <TextField
            label="Contact Note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveContact}
            disabled={!createdBy.trim() || !note.trim()} // Disable if fields are empty
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}