"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardActions,
  TextField,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  Grid,
  Divider
} from "@mui/material";
import AddItemModal from "./AddItemModal";

type ItemData = {
  id: number;
  name: string;
  description?: string | null;
  category?: string | null;
  brandId?: string | number;
};

type PackageData = {
  id: string;
  name: string;
  brandId?: string;
  brandName?: string;
  description?: string | null;
  pricePerPerson?: number | null;
};

type PackageDetailProps = {
  packageData: PackageData;
  items: ItemData[];
  allItems: ItemData[];
};

export default function PackageDetail({ packageData, items, allItems }: PackageDetailProps) {
  const router = useRouter();

  // Debug logs to check brandId and items
  console.log("PackageDetail: packageData.brandId =>", packageData.brandId);
  console.log("PackageDetail: allItems =>", allItems);

  // Store items in local state so we can update without reloading
  const [localItems, setLocalItems] = useState<ItemData[]>(items);

  // Filter allItems by brand
  const brandAllItems = packageData.brandId
    ? allItems.filter((i) => {
        const itemBrandId = String(i.brandId ?? "");
        const pkgBrandId = String(packageData.brandId);
        console.log(`Checking item ${i.id}: itemBrandId=${itemBrandId}, pkgBrandId=${pkgBrandId}`);
        return itemBrandId === pkgBrandId;
      })
    : [];

  console.log("PackageDetail: brandAllItems =>", brandAllItems);

  // Package editing state
  const [formData, setFormData] = useState({
    name: packageData.name || "",
    description: packageData.description || "",
    pricePerPerson: packageData.pricePerPerson?.toString() || "",
  });

  // Modal for adding items
  const [openModal, setOpenModal] = useState(false);

  // Handler to open/close the modal
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  // Called when a new item is successfully attached
  const handleItemAttached = (newItem: ItemData) => {
    setLocalItems((prev) => [...prev, newItem]);
  };

  // Handle text changes for package fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Save package (PUT request)
  const handleSave = async () => {
    try {
      const res = await fetch(`/api/packages/${packageData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          pricePerPerson: Number(formData.pricePerPerson),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update package");
      }
      alert("Package updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Error updating package");
    }
  };

  // Cancel (return to packages list)
  const handleCancel = () => {
    router.push("/admin/packages");
  };

  // Save + Close (PUT request, then go back to packages)
  const handleSaveAndClose = async () => {
    try {
      const res = await fetch(`/api/packages/${packageData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          pricePerPerson: Number(formData.pricePerPerson),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update package");
      }
      alert("Package updated successfully!");
      router.push("/admin/packages");
    } catch (error) {
      console.error(error);
      alert("Error updating package");
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: "auto", mt: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Edit Package
          </Typography>

          {/* Row with Name & Brand */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Package Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              {/* Read-only brand field */}
              <TextField
                label="Brand"
                name="brandName"
                value={packageData.brandName || ""}
                fullWidth
                margin="normal"
                disabled
              />
            </Grid>
          </Grid>

          {/* Price */}
          <TextField
            label="Price (Per Person)"
            name="pricePerPerson"
            value={formData.pricePerPerson}
            onChange={handleChange}
            fullWidth
            margin="normal"
            type="number"
          />

          {/* Description */}
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
            rows={6}
          />
        </CardContent>

        <CardActions sx={{ justifyContent: "flex-end", paddingRight: 2, paddingBottom: 2 }}>
          <Button variant="outlined" color="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSave} sx={{ ml: 1 }}>
            Save
          </Button>
          <Button variant="contained" color="primary" onClick={handleSaveAndClose} sx={{ ml: 1 }}>
            Close
          </Button>
        </CardActions>

        <Divider />

        {/* Items Section */}
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Items in This Package
          </Typography>
          {localItems.length === 0 ? (
            <Typography>No items attached yet.</Typography>
          ) : (
            <List>
              {localItems.map((item) => (
                <ListItem key={item.id}>
                  <Typography>
                    <strong>{item.name}</strong>
                  </Typography>
                </ListItem>
              ))}
            </List>
          )}

          {/* Add item to package */}
          <Button variant="outlined" color="secondary" sx={{ mt: 2 }} onClick={handleOpenModal}>
            + Add Item
          </Button>
        </CardContent>
      </Card>

      {/* AddItemModal is separate now */}
      <AddItemModal
        open={openModal}
        onClose={handleCloseModal}
        packageId={packageData.id}
        brandAllItems={brandAllItems}
        onItemAttached={handleItemAttached}
      />
    </Box>
  );
}