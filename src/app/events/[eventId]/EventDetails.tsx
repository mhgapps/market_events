"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Grid,
} from "@mui/material";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const toolbarOptions = [
  ["bold", "italic", "underline"] // removed the bullet list
];

interface EventDetailsProps {
  status: string;
  setStatus: (status: string) => void;
  eventDate: string;
  setEventDate: (date: string) => void;
  eventTime: string;
  setEventTime: (time: string) => void;
  guestCount: number;
  setGuestCount: (count: number) => void;
  specialRequest: string;
  setSpecialRequest: (req: string) => void;
}

const EventDetails: React.FC<EventDetailsProps> = ({
  status,
  setStatus,
  eventDate,
  setEventDate,
  eventTime,
  setEventTime,
  guestCount,
  setGuestCount,
  specialRequest,
  setSpecialRequest,
}) => {
  const formatEventDate = (dateString: string): string => {
    if (!dateString) return "";
    const parts = dateString.split("-");
    if (parts.length !== 3) return dateString;
    return `${parts[1]}/${parts[2]}/${parts[0]}`;
  };

  const formatEventTime = (timeString: string): string => {
    if (!timeString) return "";
    const [hourStr, minute] = timeString.split(":");
    let hour = parseInt(hourStr);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minute} ${ampm}`;
  };

  // State for controlling the edit modal and temporary text
  const [openSRDialog, setOpenSRDialog] = useState(false);
  const [tempSR, setTempSR] = useState(specialRequest);
  
  // State for editing fields
  const [editField, setEditField] = useState<"eventDate" | "eventTime" | "guestCount" | null>(null);
  const [tempValue, setTempValue] = useState<string>("");

  // Open the edit modal for special request
  const handleOpenSRDialog = () => {
    setTempSR(specialRequest || "");
    setOpenSRDialog(true);
  };

  // Close without saving for special request
  const handleCloseSRDialog = () => {
    setOpenSRDialog(false);
  };

  // Save changes from the modal back into parent state for special request
  const handleSaveSR = () => {
    setSpecialRequest(tempSR);
    setOpenSRDialog(false);
  };

  // Open the edit modal for fields
  const handleOpenFieldEdit = (field: "eventDate" | "eventTime" | "guestCount") => {
    setEditField(field);
    if (field === "eventDate") {
      setTempValue(eventDate);
    } else if (field === "eventTime") {
      setTempValue(eventTime);
    } else if (field === "guestCount") {
      setTempValue(guestCount.toString());
    }
  };

  // Close without saving for fields
  const handleCloseFieldEdit = () => {
    setEditField(null);
    setTempValue("");
  };

  // Save changes from the modal back into parent state for fields
  const handleSaveFieldEdit = () => {
    if (editField === "eventDate") {
      setEventDate(tempValue);
    } else if (editField === "eventTime") {
      setEventTime(tempValue);
    } else if (editField === "guestCount") {
      setGuestCount(Number(tempValue));
    }
    setEditField(null);
    setTempValue("");
  };

  return (
    <Box>
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h5" component="h2">
          Event Details
        </Typography>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ my: 1 }}>
          <Typography variant="body1">
            <span onClick={() => handleOpenFieldEdit("eventDate")} style={{ cursor: "pointer" }}>
              <strong>Event Date:</strong> {formatEventDate(eventDate)}
            </span>
          </Typography>
        </Box>
        <Box sx={{ my: 1 }}>
          <Typography variant="body1">
            <span onClick={() => handleOpenFieldEdit("eventTime")} style={{ cursor: "pointer" }}>
              <strong>Event Time:</strong> {formatEventTime(eventTime)}
            </span>
          </Typography>
        </Box>
        <Box sx={{ my: 1 }}>
          <Typography variant="body1">
            <span onClick={() => handleOpenFieldEdit("guestCount")} style={{ cursor: "pointer" }}>
              <strong>Guest Count:</strong> {guestCount}
            </span>
          </Typography>
        </Box>
      </Box>
      <Grid item xs={12}>
        <Box sx={{ border: "1px solid #ccc", p: 2, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {specialRequest.trim() ? (
            <Box dangerouslySetInnerHTML={{ __html: specialRequest }} />
          ) : (
            <Typography variant="body2" color="text.secondary">
              Special Request
            </Typography>
          )}
        </Box>
        <Button
          variant="outlined"
          size="small"
          onClick={handleOpenSRDialog}
          sx={{ mt: 1 }}
        >
          Edit Special Request
        </Button>
      </Grid>

      {/* Dialog for Editing the Special Request */}
      <Dialog open={openSRDialog} onClose={handleCloseSRDialog} fullWidth>
        <DialogTitle>Edit Special Request</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Use the toolbar for basic formatting (bold, italic, bullet list).
          </Typography>
          <ReactQuill
            theme="snow"
            value={tempSR}
            onChange={setTempSR}
            modules={{ toolbar: toolbarOptions }}
            style={{ minHeight: "150px" }} // approx. 6 lines
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSRDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveSR}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for Editing Fields */}
      <Dialog open={editField !== null} onClose={handleCloseFieldEdit} fullWidth>
        <DialogTitle>Edit {editField === "eventDate" ? "Event Date" : editField === "eventTime" ? "Event Time" : editField === "guestCount" ? "Guest Count" : ""}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={editField === "eventDate" ? "Event Date" : editField === "eventTime" ? "Event Time" : "Guest Count"}
            type={editField === "guestCount" ? "number" : editField === "eventDate" ? "date" : "time"}
            fullWidth
            variant="standard"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFieldEdit}>Cancel</Button>
          <Button onClick={handleSaveFieldEdit}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventDetails;