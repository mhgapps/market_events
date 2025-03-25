"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";

type BrandData = {
  id: string;
  name: string;
};

// Define a separate prop type for this modal
type AddPackageModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  allBrands: BrandData[];
};

export default function AddPackageModal({
  open,
  onClose,
  onSuccess,
  allBrands,
}: AddPackageModalProps) {
  // Local form data for creating a package
  const [formData, setFormData] = useState({
    name: "",
    brandId: "",
    description: "",
    pricePerPerson: "",
  });

  // Handle text changes for name, description, price
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle brand select changes
  const handleBrandSelectChange = (event: SelectChangeEvent<string>) => {
    setFormData((prev) => ({ ...prev, brandId: event.target.value }));
  };

  // POST to /api/packages to create a new package
  const handleCreatePackage = async () => {
    try {
      const res = await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          brandId: Number(formData.brandId),
          description: formData.description,
          pricePerPerson: Number(formData.pricePerPerson) || 0,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to create package");
      }
      alert("Package created successfully!");
      onClose();
      onSuccess(); // e.g., reload or refetch in parent
    } catch (error) {
      console.error(error);
      alert("Error creating package");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Create a New Package</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
        <TextField
          label="Package Name"
          name="name"
          value={formData.name}
          onChange={handleTextChange}
        />
        <FormControl>
          <InputLabel id="brand-select-label">Brand</InputLabel>
          <Select
            labelId="brand-select-label"
            name="brandId"
            value={formData.brandId}
            label="Brand"
            onChange={handleBrandSelectChange}
          >
            <MenuItem value="">-- Select a brand --</MenuItem>
            {allBrands.map((brand) => (
              <MenuItem key={brand.id} value={brand.id}>
                {brand.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleTextChange}
          multiline
          rows={6}
        />
        <TextField
          label="Price (Per Person)"
          name="pricePerPerson"
          type="number"
          value={formData.pricePerPerson}
          onChange={handleTextChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleCreatePackage}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}