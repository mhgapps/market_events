"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import AddCardOutlinedIcon from '@mui/icons-material/AddCardOutlined';

// Define the interface for a payment record
interface Payment {
  id: number;
  paymentDate: string;
  amount: number;
  paymentType: string;
  referenceNumber?: string;
}

// Define the props expected by the PaymentSection component
interface PaymentSectionProps {
  eventId: number;
  payments: Payment[];
  onPaymentUpdated?: (updatedPayment: Payment) => void;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({ eventId, payments, onPaymentUpdated }) => {
  const [localPayments, setLocalPayments] = useState<Payment[]>(payments);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editedAmount, setEditedAmount] = useState("");
  const [editedPaymentType, setEditedPaymentType] = useState("");
  const [editedReferenceNumber, setEditedReferenceNumber] = useState("");
  const [editedPaymentDate, setEditedPaymentDate] = useState("");

  // Update localPayments if payments prop changes
  useEffect(() => {
    setLocalPayments(payments);
  }, [payments]);

  const handleEditClick = (payment: Payment) => {
    setEditingPayment(payment);
    setEditedAmount(payment.amount.toString());
    setEditedPaymentType(payment.paymentType);
    setEditedReferenceNumber(payment.referenceNumber || "");
    // Convert the payment date to ISO string and slice to get "YYYY-MM-DDTHH:MM" format
    setEditedPaymentDate(new Date(payment.paymentDate).toISOString().slice(0, 16));
  };

  const handleCloseEditModal = () => {
    setEditingPayment(null);
  };

  const handleSavePaymentEdit = async () => {
    if (!editingPayment) return;
    try {
      const res = await fetch(`/api/events/${eventId}/payments/${editingPayment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(editedAmount),
          paymentType: editedPaymentType,
          referenceNumber: editedReferenceNumber,
          paymentDate: editedPaymentDate,
        }),
      });
      if (!res.ok) throw new Error("Failed to update payment");
      const updatedPayment = await res.json();
      // Update local state with the updated payment
      setLocalPayments((prev) =>
        prev.map((p) => (p.id === updatedPayment.id ? updatedPayment : p))
      );
      if (onPaymentUpdated) {
        onPaymentUpdated(updatedPayment);
      }
      handleCloseEditModal();
    } catch (error) {
      console.error("Error updating payment:", error);
      alert("Error updating payment");
    }
  };

  return (
    <Box sx={{ marginBottom: 2 }}>
      <Typography variant="h6" gutterBottom>
        Payments
      </Typography>
      <List>
        {localPayments.map((payment) => (
          <ListItem key={payment.id} divider>
            <ListItemText
              primary={`$${payment.amount.toFixed(2)} - ${payment.paymentType}${
                payment.referenceNumber ? ` (Ref: ${payment.referenceNumber})` : ""
              }`}
              secondary={new Date(payment.paymentDate).toLocaleString()}
            />
            <IconButton onClick={() => handleEditClick(payment)} size="small">
              <EditIcon fontSize="small" />
            </IconButton>
          </ListItem>
        ))}
      </List>

      {/* Edit Payment Dialog */}
      <Dialog open={Boolean(editingPayment)} onClose={handleCloseEditModal} fullWidth>
        <DialogTitle>Edit Payment</DialogTitle>
        <DialogContent>
          <TextField
            label="Payment Date"
            type="datetime-local"
            fullWidth
            margin="dense"
            value={editedPaymentDate}
            onChange={(e) => setEditedPaymentDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Amount"
            type="number"
            fullWidth
            margin="dense"
            value={editedAmount}
            onChange={(e) => setEditedAmount(e.target.value)}
          />
          <TextField
            label="Payment Type"
            fullWidth
            margin="dense"
            value={editedPaymentType}
            onChange={(e) => setEditedPaymentType(e.target.value)}
          />
          <TextField
            label="Reference Number"
            fullWidth
            margin="dense"
            value={editedReferenceNumber}
            onChange={(e) => setEditedReferenceNumber(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal}>Cancel</Button>
          <Button variant="contained" onClick={handleSavePaymentEdit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentSection;