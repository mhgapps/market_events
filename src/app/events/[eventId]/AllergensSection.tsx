"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  Tooltip,
} from "@mui/material";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";

interface Allergen {
  id: number;
  name: string;
}

interface AllergensSectionProps {
  eventId: number;
  eventAllergens?: Allergen[]; // Allergens already assigned to the event
  allAllergens?: Allergen[];   // Full list of available allergens
  onAllergensUpdated?: (updated: Allergen[]) => void;
}

const AllergensSection: React.FC<AllergensSectionProps> = ({
  eventId,
  eventAllergens = [],
  allAllergens = [],
  onAllergensUpdated,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedAllergenIds, setSelectedAllergenIds] = useState<number[]>([]);

  // Log incoming allergens for troubleshooting
  useEffect(() => {
    console.log("All allergens received:", allAllergens);
    const initialIds = eventAllergens.map((a) => a.id);
    setSelectedAllergenIds(initialIds);
  }, [eventAllergens, allAllergens]);

  const handleToggleAllergen = (id: number) => {
    setSelectedAllergenIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}/allergens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allergenIds: selectedAllergenIds }),
      });
      if (!res.ok) throw new Error("Failed to update allergens");
      const updatedAllergens = await res.json();
      // Expecting updatedAllergens to be an array of EventAllergens records with an "allergen" property.
      const updatedAllergenList = updatedAllergens.map((ea: any) => ea.allergen);
      console.log("Updated allergens:", updatedAllergenList);
      if (onAllergensUpdated) onAllergensUpdated(updatedAllergenList);
      setOpenModal(false);
    } catch (error) {
      console.error("Error updating allergens:", error);
      alert("Error updating allergens");
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Tooltip title="Add Allergens">
        <IconButton onClick={() => setOpenModal(true)}>
          <WarningAmberOutlinedIcon />
        </IconButton>
      </Tooltip>
      {selectedAllergenIds.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="h6" color="red">
            Allergens
          </Typography>
          <Typography variant="body2" color="red">
            {allAllergens
              .filter((a) => selectedAllergenIds.includes(a.id))
              .map((a) => a.name)
              .join(", ")}
          </Typography>
        </Box>
      )}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth>
        <DialogTitle>Select Allergens</DialogTitle>
        <DialogContent>
          {allAllergens.length > 0 ? (
            allAllergens.map((allergen) => (
              <FormControlLabel
                key={allergen.id}
                control={
                  <Checkbox
                    checked={selectedAllergenIds.includes(allergen.id)}
                    onChange={() => handleToggleAllergen(allergen.id)}
                  />
                }
                label={allergen.name}
              />
            ))
          ) : (
            <Typography>No allergens available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AllergensSection;