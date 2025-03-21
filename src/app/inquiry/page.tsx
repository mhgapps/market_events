"use client";
import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  MenuItem
} from '@mui/material';

export default function InquiryPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    primaryPhone: '',
    secondaryPhone: '',
    eventDate: '',
    eventTime: '',
    guestCount: '',
    service: '',
    eventTypeId: '',
    message: '',
    employeeName: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('Inquiry submitted successfully!');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          primaryPhone: '',
          secondaryPhone: '',
          eventDate: '',
          eventTime: '',
          guestCount: '',
          service: '',
          eventTypeId: '',
          message: '',
          employeeName: '',
        });
      } else {
        alert('Error submitting inquiry.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Submission error. Please try again.');
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4, p: 3, bgcolor: '#fff', borderRadius: 2, boxShadow: 3 }}>
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
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
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
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                required
                fullWidth
                label="Primary Phone"
                name="primaryPhone"
                value={formData.primaryPhone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Secondary Phone"
                name="secondaryPhone"
                value={formData.secondaryPhone}
                onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
              />
            </Grid>

            {/* Service & Event Type */}
            <Grid item xs={12} md={6}>
              <TextField
                required
                select
                fullWidth
                label="Service"
                name="service"
                value={formData.service}
                onChange={handleChange}
              >
                <MenuItem value="">Select Service</MenuItem>
                <MenuItem value="BRUNCH">Brunch</MenuItem>
                <MenuItem value="LUNCH">Lunch</MenuItem>
                <MenuItem value="DINNER">Dinner</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Event Type"
                name="eventTypeId"
                value={formData.eventTypeId}
                onChange={handleChange}
              >
                <MenuItem value="">Select Event Type</MenuItem>
                <MenuItem value="1">Wedding</MenuItem>
                <MenuItem value="2">Corporate</MenuItem>
                <MenuItem value="3">Birthday</MenuItem>
                <MenuItem value="4">Other</MenuItem>
              </TextField>
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
                onChange={handleChange}
              />
            </Grid>

            {/* Employee Name */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Employee Name (Internal Use)"
                name="employeeName"
                value={formData.employeeName}
                onChange={handleChange}
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