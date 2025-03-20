"use client";
import React, { useState } from "react";

export default function InquiryPage() {
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
    employeeName: "", // Only needed for internal entries
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        });
      } else {
        alert("Error submitting inquiry.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Submission error. Please try again.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Customer Inquiry</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>First Name: <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required /></label>
        </div>
        <div>
          <label>Last Name: <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required /></label>
        </div>
        <div>
          <label>Email: <input type="email" name="email" value={formData.email} onChange={handleChange} required /></label>
        </div>
        <div>
          <label>Primary Phone: <input type="tel" name="primaryPhone" value={formData.primaryPhone} onChange={handleChange} required /></label>
        </div>
        <div>
          <label>Secondary Phone: <input type="tel" name="secondaryPhone" value={formData.secondaryPhone} onChange={handleChange} /></label>
        </div>
        <div>
          <label>Event Date: <input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} required /></label>
        </div>
        <div>
          <label>Event Time: <input type="time" name="eventTime" value={formData.eventTime} onChange={handleChange} required /></label>
        </div>
        <div>
          <label>Guest Count: <input type="number" name="guestCount" value={formData.guestCount} onChange={handleChange} required /></label>
        </div>
        <div>
          <label>Service:
            <select name="service" value={formData.service} onChange={handleChange} required>
              <option value="">Select Service</option>
              <option value="BRUNCH">Brunch</option>
              <option value="LUNCH">Lunch</option>
              <option value="DINNER">Dinner</option>
            </select>
          </label>
        </div>
        <div>
          <label>Event Type:
            <select name="eventTypeId" value={formData.eventTypeId} onChange={handleChange}>
              <option value="">Select Event Type</option>
              <option value="1">Wedding</option>
              <option value="2">Corporate</option>
              <option value="3">Birthday</option>
              <option value="4">Other</option>
            </select>
          </label>
        </div>
        <div>
          <label>Message: <textarea name="message" value={formData.message} onChange={handleChange} /></label>
        </div>
        <div>
          <label>Employee Name (For Internal Use): <input type="text" name="employeeName" value={formData.employeeName} onChange={handleChange} /></label>
        </div>
        <button type="submit">Submit Inquiry</button>
      </form>
    </div>
  );
}