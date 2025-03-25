"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const toolbarOptions = [["bold", "italic", "underline"]];

interface Contact {
  id: number;
  contactDate: string;
  createdBy: string;
  note: string;
}

interface ContactLogProps {
  contacts: Contact[];
  inquiryId: number; // Inquiry ID to which the log belongs
}

const ContactLog: React.FC<ContactLogProps> = ({ contacts, inquiryId }) => {
  // Use local state for contacts so new logs are reflected immediately
  const [localContacts, setLocalContacts] = useState<Contact[]>(contacts);
  const [openContactModal, setOpenContactModal] = useState(false);
  const [tempCreatedBy, setTempCreatedBy] = useState("");
  const [tempNote, setTempNote] = useState("");

  // If contacts prop changes, update local state (optional)
  useEffect(() => {
    setLocalContacts(contacts);
  }, [contacts]);

  const handleOpenContactModal = () => {
    setTempCreatedBy("");
    setTempNote("");
    setOpenContactModal(true);
  };

  const handleCloseContactModal = () => {
    setOpenContactModal(false);
  };

  const handleSaveContact = async () => {
    try {
      console.log("Saving new contact with", {
        createdBy: tempCreatedBy,
        note: tempNote,
      });
      const res = await fetch(`/api/inquiries/${inquiryId}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ createdBy: tempCreatedBy, note: tempNote }),
      });
      if (!res.ok) {
        throw new Error("Failed to save contact");
      }
      const newContact = await res.json();
      console.log("Contact saved successfully", newContact);
      // Update local contacts state so the new log is shown immediately
      setLocalContacts((prev) => [...prev, newContact]);
    } catch (error) {
      console.error("Error saving contact:", error);
      alert("Error saving contact");
    }
    setOpenContactModal(false);
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Contact Log</Typography>
        <Button variant="outlined" onClick={handleOpenContactModal}>
          Log Contact
        </Button>
      </Box>

      {localContacts.length ? (
        localContacts.map((contact) => (
          <Box key={contact.id} mb={1}>
            <Typography variant="body2" fontWeight="bold">
              {new Date(contact.contactDate).toLocaleString()} (by {contact.createdBy})
            </Typography>
            {/* Use component="div" to avoid nesting <div> inside <p> */}
            <Typography
              variant="body2"
              component="div"
              dangerouslySetInnerHTML={{ __html: contact.note }}
            />
          </Box>
        ))
      ) : (
        <Typography variant="body2">No contacts logged.</Typography>
      )}

      <Dialog open={openContactModal} onClose={handleCloseContactModal} fullWidth>
        <DialogTitle>Log Contact</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Enter your name and note below.
          </Typography>

          <input
            style={{
              width: "100%",
              marginBottom: 12,
              border: "1px solid #ccc",
              padding: "8px",
              fontSize: "1rem",
            }}
            placeholder="Created By"
            value={tempCreatedBy}
            onChange={(e) => setTempCreatedBy(e.target.value)}
          />

          <ReactQuill
            theme="snow"
            value={tempNote}
            onChange={setTempNote}
            modules={{ toolbar: toolbarOptions }}
            style={{ minHeight: 120, marginTop: 12 }}
            placeholder="Enter your note..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseContactModal}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveContact}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContactLog;