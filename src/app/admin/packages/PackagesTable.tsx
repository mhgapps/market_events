"use client";
import React, { useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import AddPackageModal from "./AddPackageModal";

type PackageData = {
  id: string;
  name: string;
  brandId: string;
  brandName: string;
  pricePerPerson: number;
  description: string;
};

type BrandData = {
  id: string;
  name: string;
};

type PackagesTableProps = {
  packages: PackageData[];
  allBrands: BrandData[];
};

export default function PackagesTable({ packages, allBrands }: PackagesTableProps) {
  // ---------- Brand Filter State ----------
  const [brandFilter, setBrandFilter] = useState("");

  // Handle brand filter changes
  const handleBrandFilterChange = (event: SelectChangeEvent<string>) => {
    setBrandFilter(event.target.value);
  };

  // Filter the packages array based on brandFilter
  const filteredPackages = brandFilter
    ? packages.filter((p) => p.brandId === brandFilter)
    : packages;

  // ---------- Add Package Modal State ----------
  const [openModal, setOpenModal] = useState(false);

  // Open/close the AddPackageModal
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  // Called after creating a package (e.g., refresh data or reload)
  const handlePackageCreated = () => {
    // For now, we just close the modal
    // but you could do location.reload() or re-fetch packages
  };

  // ---------- DataGrid Columns ----------
  const columns: GridColDef<any>[] = [
    {
      field: "name",
      headerName: "Package Name",
      flex: 1,
      renderCell: (params: any) => (
        <a
          href={`/admin/packages/${params.row.id}`}
          style={{ color: "#007bff", textDecoration: "underline" }}
        >
          {params.value}
        </a>
      ),
    },
    {
      field: "brandName",
      headerName: "Brand",
      flex: 1,
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header Row */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" sx={{ alignSelf: "center" }}>
          Packages
        </Typography>

        {/* Brand Filter + Add Button */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Brand</InputLabel>
            <Select
              value={brandFilter}
              label="Filter by Brand"
              onChange={handleBrandFilterChange}
            >
              <MenuItem value="">All Brands</MenuItem>
              {allBrands.map((brand) => (
                <MenuItem key={brand.id} value={brand.id}>
                  {brand.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="contained" color="primary" onClick={handleOpenModal}>
            + Add Package
          </Button>
        </Box>
      </Box>

      {/* DataGrid with no pagination */}
      <DataGrid
        rows={filteredPackages}
        columns={columns}
        autoHeight
        hideFooterPagination
      />

      {/* AddPackageModal with 4 fields (Name, Brand, Description, Price) */}
      <AddPackageModal
        open={openModal}
        onClose={handleCloseModal}
        onSuccess={handlePackageCreated}
        allBrands={allBrands}
      />
    </Box>
  );
}