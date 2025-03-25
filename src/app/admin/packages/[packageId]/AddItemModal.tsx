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
  Box,
  Typography
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";

type ItemData = {
  id: number;
  name: string;
  description?: string | null;
  category?: string | null;
};

type BrandData = {
  id: string;
  name: string;
};

type AddItemModalProps = {
  open: boolean;
  onClose: () => void;
  packageId: string;                // needed for POST /api/packages/[id]/items
  brandAllItems: ItemData[];        // items filtered by brand, passed from parent
  onItemAttached: (newItem: ItemData) => void;
  allBrands?: BrandData[];          // optional list of all brands if you want user to pick brand for new item
};

export default function AddItemModal({
  open,
  onClose,
  packageId,
  brandAllItems,
  onItemAttached,
  allBrands,
}: AddItemModalProps) {
  // Toggle: create new item vs. attach existing
  const [creatingNewItem, setCreatingNewItem] = useState(false);
  // Selected item ID (for existing items)
  const [selectedItemId, setSelectedItemId] = useState("");
  // New item fields
  const [newItemData, setNewItemData] = useState({
    name: "",
    description: "",
    category: "",
    brandId: "", // brand for new item
  });

  // Toggle between existing vs. new item
  const handleToggleNewItem = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreatingNewItem(e.target.checked);
    setSelectedItemId("");
    setNewItemData({ name: "", description: "", category: "", brandId: "" });
  };

  // Handle existing item selection
  const handleSelectExistingItem = (event: SelectChangeEvent<string>) => {
    setSelectedItemId(event.target.value);
  };

  // Handle new item text fields
  const handleNewItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewItemData((prev) => ({ ...prev, [name]: value }));
  };

  // For brand selection if you want user to pick brand from a dropdown
  const handleNewItemBrandChange = (event: SelectChangeEvent<string>) => {
    setNewItemData((prev) => ({ ...prev, brandId: event.target.value }));
  };

  // Attach item to package
  const handleAttachItem = async () => {
    try {
      let body: any;
      if (creatingNewItem) {
        body = {
          createNewItem: true,
          name: newItemData.name,
          description: newItemData.description,
          category: newItemData.category,
          // brandId is optional unless your items table requires it
          brandId: newItemData.brandId ? Number(newItemData.brandId) : undefined,
        };
      } else {
        body = {
          createNewItem: false,
          itemId: Number(selectedItemId),
        };
      }

      const res = await fetch(`/api/packages/${packageId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("Failed to attach item");
      }

      // The route should return { item: {...} } for the newly attached item
      const data = await res.json();
      if (data.item) {
        onItemAttached(data.item);
      }

      alert("Item attached successfully!");
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error attaching item");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Add Item to Package</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Choose an existing item or create a new one.
          </Typography>

          {/* Toggle: existing vs. new */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <input
              type="checkbox"
              checked={creatingNewItem}
              onChange={handleToggleNewItem}
              id="toggleNewItem"
            />
            <label htmlFor="toggleNewItem" style={{ marginLeft: 8 }}>
              Create New Item
            </label>
          </Box>

          {creatingNewItem ? (
            // New item fields
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Item Name"
                name="name"
                value={newItemData.name}
                onChange={handleNewItemChange}
                fullWidth
              />
              <TextField
                label="Description"
                name="description"
                value={newItemData.description}
                onChange={handleNewItemChange}
                fullWidth
                multiline
                rows={2}
              />
              <TextField
                label="Category"
                name="category"
                value={newItemData.category}
                onChange={handleNewItemChange}
                fullWidth
              />

              {/* Optional brand selection if you pass allBrands */}
              {allBrands && allBrands.length > 0 && (
                <FormControl fullWidth>
                  <InputLabel id="new-item-brand-label">Brand</InputLabel>
                  <Select
                    labelId="new-item-brand-label"
                    name="brandId"
                    value={newItemData.brandId}
                    label="Brand"
                    onChange={handleNewItemBrandChange}
                  >
                    <MenuItem value="">-- Select a brand --</MenuItem>
                    {allBrands.map((b) => (
                      <MenuItem key={b.id} value={b.id}>
                        {b.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          ) : (
            // Existing item dropdown
            <FormControl fullWidth>
              <InputLabel id="existing-item-label">Existing Items</InputLabel>
              <Select
                labelId="existing-item-label"
                value={selectedItemId}
                label="Existing Items"
                onChange={handleSelectExistingItem}
              >
                <MenuItem value="">-- Select an item --</MenuItem>
                {brandAllItems.map((item) => (
                  <MenuItem key={item.id} value={String(item.id)}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleAttachItem}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}