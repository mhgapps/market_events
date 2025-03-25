"use client";

import React from "react";
import { Box, Typography, Link } from "@mui/material";

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  secondaryPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface CustomerInfoProps {
  customer: Customer | null;
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({ customer }) => {
  if (!customer) {
    return <Typography variant="body2">No customer information available.</Typography>;
  }
  
  // Combine city, state, and zip into one line if available.
  const cityStateZip = [
    customer.city,
    customer.state,
    customer.zipCode,
  ]
    .filter((part) => part && part.trim().length > 0)
    .join(", ");

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Customer Information
      </Typography>
      <Typography variant="body2">
        <strong>Name:</strong> {customer.firstName} {customer.lastName}
      </Typography>
      <Typography variant="body2">
        <strong>Email:</strong>{" "}
        <Link href={`mailto:${customer.email}`} underline="hover">
          {customer.email}
        </Link>
      </Typography>
      {customer.phone && (
        <Typography variant="body2">
          <strong>Phone:</strong>{" "}
          <Link href={`tel:${customer.phone}`} underline="hover">
            {customer.phone}
          </Link>
        </Typography>
      )}
      {customer.secondaryPhone && (
        <Typography variant="body2">
          <strong>Secondary Phone:</strong>{" "}
          <Link href={`tel:${customer.secondaryPhone}`} underline="hover">
            {customer.secondaryPhone}
          </Link>
        </Typography>
      )}
      {customer.address && (
        <Box>
          <Typography variant="body2">
            <strong>Address:</strong>
          </Typography>
          <Typography variant="body2">
            {customer.address}
          </Typography>
          {cityStateZip && (
            <Typography variant="body2">
              {cityStateZip}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CustomerInfo;