"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent
} from "@mui/material";

export default function InquiryPage() {
  // ------------------- LOCAL STATE -------------------
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    primaryPhone: "",
    secondaryPhone: "",
    eventDate: "",
    eventTime: "",
    guestCount: "",
    service: "",
    eventTypeId: "",
    message: "",
    employeeName: "",
    locationId: "",
  });

  // Arrays fetched from your APIs
  const [assignedLocations, setAssignedLocations] = useState<
    { id: number; name: string }[]
  >([]);
  const [eventTypes, setEventTypes] = useState<{ id: number; name: string }[]>(
    []
  );

  // ------------------- FETCH DATA -------------------
  useEffect(() => {
    (async () => {
      try {
        // 1. Fetch assigned locations
        const locRes = await fetch("/api/assigned-locations");
        const locData = await locRes.json();

        // If exactly one location, default it
        if (locData.length === 1) {
          setFormData((prev) => ({ ...prev, locationId: String(locData[0].id) }));
        }
        setAssignedLocations(locData);

        // 2. Fetch event types
        const etRes = await fetch("/api/event-types");
        const etData = await etRes.json();
        setEventTypes(etData);
      } catch (error) {
        console.error("Error fetching assigned locations or event types", error);
      }
    })();
  }, []);

  // ------------------- HANDLERS -------------------
  // Normal text fields
  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Service dropdown
  const handleServiceChange = (e: SelectChangeEvent<string>) => {
    setFormData({ ...formData, service: e.target.value });
  };

  // Event Type dropdown
  const handleEventTypeChange = (e: SelectChangeEvent<string>) => {
    setFormData({ ...formData, eventTypeId: e.target.value });
  };

  // Location dropdown
  const handleLocationChange = (e: SelectChangeEvent<string>) => {
    setFormData({ ...formData, locationId: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Inquiry submitted successfully!");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          primaryPhone: "",
          secondaryPhone: "",
          eventDate: "",
          eventTime: "",
          guestCount: "",
          service: "",
          eventTypeId: "",
          message: "",
          employeeName: "",
          locationId: "",
        });
      } else {
        alert("Error submitting inquiry.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Submission error. Please try again.");
    }
  };

  // Are multiple locations assigned?
  const userHasMultipleLocations = assignedLocations.length > 1;

  // ------------------- RENDER -------------------
  return (
    <Container maxWidth="md">
      <Box
        sx={{ mt: 4, mb: 4, p: 3, bgcolor: "#fff", borderRadius: 2, boxShadow: 3 }}
      >
        <Typography variant="h4" component="h1" textAlign="center" gutterBottom>
          Event Inquiry Form
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            {/* First & Last Name */}
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleTextChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleTextChange}
              />
            </Grid>

            {/* Email & Phones */}
            <Grid item xs={12} md={4}>
              <TextField
                required
                fullWidth
                type="email"
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleTextChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                required
                fullWidth
                label="Primary Phone"
                name="primaryPhone"
                value={formData.primaryPhone}
                onChange={handleTextChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Secondary Phone"
                name="secondaryPhone"
                value={formData.secondaryPhone}
                onChange={handleTextChange}
              />
            </Grid>

            {/* Event Date, Time, Guest Count */}
            <Grid item xs={12} md={4}>
              <TextField
                required
                fullWidth
                type="date"
                label="Event Date"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleTextChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                required
                fullWidth
                type="time"
                label="Event Time"
                name="eventTime"
                value={formData.eventTime}
                onChange={handleTextChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                required
                fullWidth
                type="number"
                label="Guest Count"
                name="guestCount"
                value={formData.guestCount}
                onChange={handleTextChange}
              />
            </Grid>

            {/* Service, Event Type, and Location on same line */}
            <Grid container item spacing={2} xs={12} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth required>
                  <InputLabel id="service-label">Service</InputLabel>
                  <Select
                    labelId="service-label"
                    label="Service"
                    name="service"
                    value={formData.service}
                    onChange={handleServiceChange}
                  >
                    <MenuItem value="">Select Service</MenuItem>
                    <MenuItem value="BRUNCH">Brunch</MenuItem>
                    <MenuItem value="LUNCH">Lunch</MenuItem>
                    <MenuItem value="DINNER">Dinner</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="eventType-label">Event Type</InputLabel>
                  <Select
                    labelId="eventType-label"
                    label="Event Type"
                    name="eventTypeId"
                    value={formData.eventTypeId}
                    onChange={handleEventTypeChange}
                  >
                    <MenuItem value="">Select Event Type</MenuItem>
                    {eventTypes.map((et) => (
                      <MenuItem key={et.id} value={String(et.id)}>
                        {et.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {userHasMultipleLocations && (
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth required>
                    <InputLabel id="location-label">Location</InputLabel>
                    <Select
                      labelId="location-label"
                      label="Location"
                      name="locationId"
                      value={formData.locationId}
                      onChange={handleLocationChange}
                    >
                      <MenuItem value="">-- Select Location --</MenuItem>
                      {assignedLocations.map((loc) => (
                        <MenuItem key={loc.id} value={String(loc.id)}>
                          {loc.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>

            {/* Message */}
            <Grid item xs={12}>
              <TextField
                multiline
                rows={3}
                fullWidth
                label="Notes"
                name="message"
                value={formData.message}
                onChange={handleTextChange}
              />
            </Grid>

            {/* Employee Name */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Employee Name (Internal Use)"
                name="employeeName"
                value={formData.employeeName}
                onChange={handleTextChange}
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ py: 1.5, mt: 1 }}
              >
                Submit Inquiry
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}