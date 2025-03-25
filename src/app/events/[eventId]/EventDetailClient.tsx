"use client";

import { useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  IconButton,
  Checkbox,
  FormControlLabel,
  Divider
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import EventPackages from "./EventPackages";
import PaymentSection from "./PaymentSection";
import CustomerInfo from "./CustomerInfo";
import EventDetails from "./EventDetails";
import ContactLog from "./ContactLog";
import AddCardOutlinedIcon from '@mui/icons-material/AddCardOutlined';
import AllergensSection from "./AllergensSection";

/**
 * Produce a local time ISO string instead of UTC
 * e.g. 'YYYY-MM-DDTHH:mm' for the user's current timezone
 */
function localIsoString() {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;
  const localTime = new Date(now.getTime() - offsetMs);
  return localTime.toISOString().slice(0, 16);
}

export default function EventDetailClient({ event, allPackages, allEventTypes, allAllergens }: any) {
  // Diagnostic: log the event id and allergens to ensure they're valid
  console.log("Event ID:", event.id);
  console.log("All Allergen list:", allAllergens);

  // Basic date/time parse
  const dateObj = event.eventDate ? new Date(event.eventDate) : null;
  const timeObj = event.eventTime ? new Date(event.eventTime) : null;

  const [status, setStatus] = useState(event.status || "PENDING");
  const [eventDate, setEventDate] = useState(dateObj ? dateObj.toISOString().slice(0, 10) : "");
  const [eventTime, setEventTime] = useState(timeObj ? timeObj.toTimeString().slice(0, 5) : "");
  const [guestCount, setGuestCount] = useState(event.guestCount || 0);

  const defaultTaxRate = event.location?.taxRate ?? 0;
  const defaultGratuityRate = event.location?.gratuityRate ?? 0;

  const [taxRate] = useState(defaultTaxRate);
  const [gratuityRate, setGratuityRate] = useState(
    event.gratuityRate !== null && event.gratuityRate !== undefined
      ? event.gratuityRate
      : defaultGratuityRate
  );
  const [overrideGratuity, setOverrideGratuity] = useState(
    event.gratuityRate !== null && event.gratuityRate !== undefined
  );

  const [specialRequest, setSpecialRequest] = useState(event.specialRequest || "");

  // Local eventPackages array
  const [localEventPackages, setLocalEventPackages] = useState(event.eventPackages || []);

  // Contact log
  const inquiry = event.inquiry || {};
  const [localContacts, setLocalContacts] = useState(inquiry.inquiryContacts || []);

  // Payment listing
  const [localPayments, setLocalPayments] = useState(event.payments || []);

  // Event Type
  const [openEventTypeDialog, setOpenEventTypeDialog] = useState(false);
  const [eventTypeId, setEventTypeId] = useState(
    inquiry.eventType?.id ? String(inquiry.eventType.id) : ""
  );

  // Gratuity override
  const [openGratuityDialog, setOpenGratuityDialog] = useState(false);
  const [tempGratuityWhole, setTempGratuityWhole] = useState(
    overrideGratuity ? (gratuityRate * 100).toFixed(0) : ""
  );

  // Add package
  const [openPackageDialog, setOpenPackageDialog] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState("");

  // Item selection
  const [openItemSelectDialog, setOpenItemSelectDialog] = useState(false);
  const [itemSelectPackage, setItemSelectPackage] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<{ [key: number]: boolean }>({});

  // Payment
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentType, setPaymentType] = useState("CC");
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentDate, setPaymentDate] = useState(localIsoString());

  // Upcharge - package
  const [openUpchargeDialog, setOpenUpchargeDialog] = useState(false);
  const [upchargePackageId, setUpchargePackageId] = useState<number | null>(null);
  const [upchargeAmount, setUpchargeAmount] = useState("");
  // New state for package upcharge note
  const [upchargeNote, setUpchargeNote] = useState("");

  // Upcharge - item
  const [openItemUpchargeDialog, setOpenItemUpchargeDialog] = useState(false);
  const [itemUpchargePackageId, setItemUpchargePackageId] = useState<number | null>(null);
  const [itemUpchargeItemId, setItemUpchargeItemId] = useState<number | null>(null);
  const [itemUpchargeAmount, setItemUpchargeAmount] = useState("");
  // New state for item upcharge note
  const [itemUpchargeNote, setItemUpchargeNote] = useState("");

  // Status
  const [openStatusModal, setOpenStatusModal] = useState(false);

  ////////////////////////////////////////////////////////////////////////////
  // Edit Note for <EventPackages>
  ////////////////////////////////////////////////////////////////////////////
  async function handleEditNote(packageId: number, eventPackageItemId: number, note: string) {
    try {
      const res = await fetch(
        `/api/events/${event.id}/packages/${packageId}/items/${eventPackageItemId}/note`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note }),
        }
      );
      if (!res.ok) throw new Error("Failed to update note");

      const updatedItem = await res.json();
      setLocalEventPackages((prev: any[]) =>
        prev.map((p: any) => {
          if (p.packageId === packageId) {
            return {
              ...p,
              eventPackageItems: p.eventPackageItems.map((itm: any) =>
                itm.id === updatedItem.id ? updatedItem : itm
              ),
            };
          }
          return p;
        })
      );
    } catch (error) {
      console.error("Error in handleEditNote:", error);
      alert("Error saving note");
    }
  }

  ////////////////////////////////////////////////////////////////////////////
  // CALCULATIONS
  ////////////////////////////////////////////////////////////////////////////

  const subTotal = useMemo(() => {
    let total = 0;
    localEventPackages.forEach((ep: any) => {
      const pkgPrice = ep.package?.pricePerPerson || 0;
      total += pkgPrice * Number(guestCount);
    });
    return total;
  }, [localEventPackages, guestCount]);

  const computedUpchargesTotal = useMemo(() => {
    let totalUpcharges = 0;
    localEventPackages.forEach((ep: any) => {
      const packageUpcharge = ep.upcharge ? Number(ep.upcharge) : 0;
      const itemsUpcharge = ep.eventPackageItems.reduce(
        (sum: number, item: any) => sum + (item.finalUpcharge ? Number(item.finalUpcharge) : 0),
        0
      );
      totalUpcharges += (packageUpcharge + itemsUpcharge) * Number(guestCount);
    });
    return totalUpcharges;
  }, [localEventPackages, guestCount]);

  const baseForTaxAndGratuity = useMemo(
    () => subTotal + computedUpchargesTotal,
    [subTotal, computedUpchargesTotal]
  );

  const actualGratuityRate = overrideGratuity ? gratuityRate : defaultGratuityRate;
  const computedTax = useMemo(
    () => baseForTaxAndGratuity * Number(taxRate),
    [baseForTaxAndGratuity, taxRate]
  );
  const computedGratuity = useMemo(
    () => baseForTaxAndGratuity * Number(actualGratuityRate),
    [baseForTaxAndGratuity, actualGratuityRate]
  );

  const computedTotal = useMemo(
    () => baseForTaxAndGratuity + computedTax + computedGratuity,
    [baseForTaxAndGratuity, computedTax, computedGratuity]
  );

  const totalPaid = useMemo(() => {
    return localPayments.reduce((acc: number, p: any) => acc + (p.amount || 0), 0);
  }, [localPayments]);

  const balanceDue = useMemo(() => computedTotal - totalPaid, [computedTotal, totalPaid]);

  // Payment status color/label
  let paymentStatus = "Unpaid";
  let paymentColor = "red";
  if (localPayments.length > 0) {
    if (balanceDue < 0) {
      paymentStatus = "Refund Needed";
      paymentColor = "purple";
    } else if (balanceDue === 0) {
      paymentStatus = "Paid";
      paymentColor = "green";
    } else {
      paymentStatus = "Partially Paid";
      paymentColor = "orange";
    }
  }

  ////////////////////////////////////////////////////////////////////////////
  // AUTO-STATUS LOGIC
  ////////////////////////////////////////////////////////////////////////////

  useMemo(() => {
    if (status === "PENDING" && totalPaid > 0) {
      setStatus("CONFIRMED");
    }
    if (totalPaid >= computedTotal && computedTotal > 0 && status !== "CLOSED") {
      setStatus("COMPLETED");
    }
  }, [totalPaid, computedTotal, status]);

  ////////////////////////////////////////////////////////////////////////////
  // HANDLERS
  ////////////////////////////////////////////////////////////////////////////

  const handleSaveEvent = async () => {
    if (!confirm("Are you sure you want to save changes to this event?")) return;
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          eventDate,
          eventTime,
          guestCount: Number(guestCount),
          taxRate: Number(taxRate),
          gratuityRate: overrideGratuity ? gratuityRate : null,
          specialRequest,
          subtotal: subTotal,
          taxAmount: computedTax,
          gratuityAmount: computedGratuity,
          totalAmount: computedTotal,
        }),
      });
      if (!res.ok) throw new Error("Failed to update event");
      alert("Event updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Error updating event");
    }
  };

  const handleCancel = () => {
    if (!confirm("Discard changes?")) return;
    window.history.back();
  };

  const handleSaveEventType = async () => {
    if (!inquiry.id) {
      alert("No inquiry linked to this event.");
      return;
    }
    try {
      const res = await fetch(`/api/inquiries/${inquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventTypeId: Number(eventTypeId) || null }),
      });
      if (!res.ok) throw new Error("Failed to update event type");
      alert("Event type updated!");
      setOpenEventTypeDialog(false);
    } catch (error) {
      console.error(error);
      alert("Error updating event type");
    }
  };

  const handleSaveGratuityOverride = () => {
    const val = parseFloat(tempGratuityWhole);
    if (isNaN(val)) {
      alert("Invalid gratuity percentage.");
      return;
    }
    setGratuityRate(val / 100);
    setOverrideGratuity(true);
    setOpenGratuityDialog(false);
  };

  const handleCloseEvent = () => {
    if (!confirm("Close this event?")) return;
    setStatus("CLOSED");
    handleSaveEvent();
  };

  // Add package
  const handleAddPackage = async () => {
    if (!selectedPackageId) return;
    try {
      const res = await fetch(`/api/events/${event.id}/packages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: Number(selectedPackageId) }),
      });
      if (!res.ok) throw new Error("Failed to add package");
      const newPackage = await res.json();
      setLocalEventPackages((prev: any) => [...prev, newPackage]);
      setOpenPackageDialog(false);
      setSelectedPackageId("");
    } catch (error) {
      console.error(error);
      alert("Error adding package");
    }
  };

  const handleRemovePackage = async (pkgId: number) => {
    if (!confirm("Remove this package from event?")) return;
    try {
      const res = await fetch(`/api/events/${event.id}/packages/${pkgId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove package");
      setLocalEventPackages((prev: any) =>
        prev.filter((ep: any) => ep.packageId !== pkgId)
      );
    } catch (error) {
      console.error(error);
      alert("Error removing package");
    }
  };

  // Select Items
  function handleOpenItemSelect(pkgEp: any) {
    console.log("Selecting items for package:", pkgEp);
    setItemSelectPackage(pkgEp);
    const init: { [key: number]: boolean } = {};
    pkgEp.package?.packageItems?.forEach((pi: any) => {
      const isSelected = pkgEp.eventPackageItems?.some((epi: any) => epi.itemId === pi.itemId);
      init[pi.itemId] = !!isSelected;
    });
    setSelectedItems(init);
    setOpenItemSelectDialog(true);
  }

  async function handleSaveItemSelection() {
    if (!itemSelectPackage) return;
    try {
      const chosenIds = Object.keys(selectedItems)
        .filter((id) => selectedItems[Number(id)])
        .map(Number);

      const res = await fetch(
        `/api/events/${event.id}/packages/${itemSelectPackage.packageId}/items`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemIds: chosenIds }),
        }
      );
      if (!res.ok) throw new Error("Failed to update package items");

      const updatedPkg = await res.json();
      console.log("Updated package from server:", updatedPkg);

      setLocalEventPackages((prev: any[]) =>
        prev.map((p: any) => (p.packageId === updatedPkg.packageId ? updatedPkg : p))
      );

      alert("Items updated!");
    } catch (error) {
      console.error("Error saving item selection:", error);
      alert("Error saving item selection");
    }
    setOpenItemSelectDialog(false);
  }

  // Upcharge (Package)
  function handleAddUpcharge(packageId: number) {
    console.log("Add upcharge to package:", packageId);
    setUpchargePackageId(packageId);
    setUpchargeAmount("");
    setUpchargeNote("");
    setOpenUpchargeDialog(true);
  }

  async function handleSaveUpcharge() {
    const amt = parseFloat(upchargeAmount);
    if (isNaN(amt)) {
      alert("Invalid upcharge");
      return;
    }
    if (!upchargePackageId) {
      alert("No package selected");
      return;
    }
    try {
      console.log("Saving package upcharge:", { packageId: upchargePackageId, amt, note: upchargeNote });
      const res = await fetch(
        `/api/events/${event.id}/packages/${upchargePackageId}/upcharge`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ upcharge: amt, note: upchargeNote }),
        }
      );
      if (!res.ok) throw new Error("Failed to add upcharge");

      const updatedPkg = await res.json();
      console.log("Updated package from server:", updatedPkg);

      setLocalEventPackages((prev: any[]) =>
        prev.map((p: any) => (p.packageId === updatedPkg.packageId ? updatedPkg : p))
      );

      setOpenUpchargeDialog(false);
      setUpchargeAmount("");
      setUpchargePackageId(null);
    } catch (error) {
      console.error("Error saving package upcharge:", error);
      alert("Error saving package upcharge");
    }
  }

  // Upcharge (Item)
  function handleUpchargeItem(pkgId: number, itemId: number) {
    console.log("Upcharge item", { pkgId, itemId });
    setItemUpchargePackageId(pkgId);
    setItemUpchargeItemId(itemId);
    setItemUpchargeAmount("");
    setItemUpchargeNote("");
    setOpenItemUpchargeDialog(true);
  }

  async function handleSaveItemUpcharge() {
    const amt = parseFloat(itemUpchargeAmount);
    if (isNaN(amt)) {
      alert("Invalid item upcharge");
      return;
    }
    if (!itemUpchargePackageId || !itemUpchargeItemId) {
      alert("No package/item selected");
      return;
    }
    try {
      console.log("Saving item upcharge:", {
        pkgId: itemUpchargePackageId,
        itemId: itemUpchargeItemId,
        amt,
        note: itemUpchargeNote,
      });
      const res = await fetch(
        `/api/events/${event.id}/packages/${itemUpchargePackageId}/items/${itemUpchargeItemId}/upcharge`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ upcharge: amt, note: itemUpchargeNote }),
        }
      );
      if (!res.ok) throw new Error("Failed to update item upcharge");

      const updatedItem = await res.json();
      console.log("Updated item from server:", updatedItem);

      setLocalEventPackages((prev: any[]) =>
        prev.map((p: any) => {
          if (p.packageId === itemUpchargePackageId) {
            return {
              ...p,
              eventPackageItems: p.eventPackageItems.map((itm: any) =>
                itm.id === updatedItem.id ? updatedItem : itm
              ),
            };
          }
          return p;
        })
      );

      setOpenItemUpchargeDialog(false);
      setItemUpchargeAmount("");
      setItemUpchargePackageId(null);
      setItemUpchargeItemId(null);
    } catch (error) {
      console.error("Error saving item upcharge:", error);
      alert("Error saving item upcharge");
    }
  }

  // Remove item / note
  function handleRemoveItem(pkgId: number, itemId: number) {
    console.log("Removing item", { pkgId, itemId });
    // Implement removal logic here
  }
  function handleRemoveNote(pkgId: number, itemId: number) {
    console.log("Removing note", { pkgId, itemId });
    // Implement note removal logic here
  }

  const handleAddPayment = async () => {
    try {
      const amt = Number(paymentAmount) || 0;
      const res = await fetch(`/api/events/${event.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amt,
          paymentType,
          referenceNumber: paymentRef,
          paymentDate,
        }),
      });
      if (!res.ok) throw new Error("Failed to add payment");
      const newPay = await res.json();
      setLocalPayments((prev: any) => [...prev, newPay]);

      setOpenPaymentDialog(false);
      setPaymentAmount("");
      setPaymentRef("");
      setPaymentType("CC");
      setPaymentDate(localIsoString());
    } catch (error) {
      console.error(error);
      alert("Error adding payment");
    }
  };

  const customer = inquiry.customer;

  const [openContactDialog, setOpenContactDialog] = useState(false);
  const [contactCreatedBy, setContactCreatedBy] = useState("");
  const [contactNote, setContactNote] = useState("");

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {/* Left Card */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 2, height: "100%", display: "flex", flexDirection: "column" }}>
            <CardContent sx={{ flex: "1 1 auto", position: "relative" }}>
              {/* Payment Status label at top-right */}
              <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                <Box
                  sx={{
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    backgroundColor: paymentColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 80,
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#fff" }}>
                    {paymentStatus}
                  </Typography>
                </Box>

                {/* Event Status below the payment status */}
                <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2">{status}</Typography>
                  <IconButton size="small" onClick={() => setOpenStatusModal(true)}>
                    <EditIcon fontSize="inherit" />
                  </IconButton>
                </Box>
              </Box>

              {/* Show location name */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="h5">{event.location?.name || "N/A"}</Typography>
              </Box>

              {/* Show event type separately */}
              <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="h6">{inquiry.eventType?.name || "N/A"}</Typography>
                <IconButton
                  aria-label="edit event type"
                  onClick={() => setOpenEventTypeDialog(true)}
                  size="small"
                >
                  <EditIcon fontSize="inherit" />
                </IconButton>
              </Box>

              <CustomerInfo customer={customer} />

              <EventDetails
                eventDate={eventDate}
                setEventDate={setEventDate}
                eventTime={eventTime}
                setEventTime={setEventTime}
                guestCount={guestCount}
                setGuestCount={setGuestCount}
                specialRequest={specialRequest}
                setSpecialRequest={setSpecialRequest}
                status={""}
                setStatus={function (status: string): void {
                  throw new Error("Function not implemented.");
                }}
              />

              <AllergensSection
                eventId={event.id}
                eventAllergens={event.eventAllergens || []}
                allAllergens={allAllergens || []}
                onAllergensUpdated={(updated) => {
                  console.log("Updated allergens:", updated);
                }}
              />

              <Typography variant="h6" gutterBottom mt={5}>
                Packages
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Button variant="outlined" onClick={() => setOpenPackageDialog(true)}>
                  Add Package
                </Button>
              </Box>

              <EventPackages
                eventPackages={localEventPackages}
                guestCount={guestCount}
                onRemovePackage={handleRemovePackage}
                onOpenItemSelect={handleOpenItemSelect}
                onRemoveItem={handleRemoveItem}
                onAddUpcharge={handleAddUpcharge}
                onUpchargeItem={handleUpchargeItem}
                onRemoveNote={handleRemoveNote}
                onEditNote={handleEditNote}
              />

              {/* Totals */}
              <Box sx={{ mt: 2, textAlign: "right" }}>
                {computedUpchargesTotal > 0 && (
                  <Typography variant="body2">
                    <strong>Upcharges:</strong> ${computedUpchargesTotal.toFixed(2)}
                  </Typography>
                )}
                <Typography variant="body2">
                  <strong>Subtotal:</strong> ${subTotal.toFixed(2)}
                </Typography>
                <Typography variant="body2">
                  <strong>Tax:</strong> ${computedTax.toFixed(2)}
                </Typography>
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
                  <IconButton
                    aria-label="edit gratuity"
                    onClick={() => {
                      setTempGratuityWhole(overrideGratuity ? (gratuityRate * 100).toFixed(0) : "");
                      setOpenGratuityDialog(true);
                    }}
                    size="small"
                  >
                    <EditIcon fontSize="inherit" />
                  </IconButton>
                  <Typography variant="body2">
                    <strong>Gratuity:</strong> ${computedGratuity.toFixed(2)}
                  </Typography>
                </Box>
                <Typography variant="body2">
                  <strong>Total:</strong> ${computedTotal.toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Balance Due:</strong> ${balanceDue.toFixed(2)}
                </Typography>
              </Box>
            </CardContent>

            <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button variant="outlined" color="secondary" onClick={handleCancel}>
                Cancel
              </Button>

              {status === "COMPLETED" && (
                <Button variant="contained" onClick={handleCloseEvent}>
                  Close Event
                </Button>
              )}

              <Button variant="contained" onClick={handleSaveEvent}>
                Save Event
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Right Card: Payment & Contact Log */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <CardContent sx={{ flex: "1 1 auto", position: "relative" }}>
              <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                <IconButton
                  onClick={() => setOpenPaymentDialog(true)}
                  size="small"
                  aria-label="Add Payment"
                >
                  <AddCardOutlinedIcon />
                </IconButton>
              </Box>

              <PaymentSection payments={localPayments} eventId={event.id} />

              <Divider sx={{ my: 2 }} />

              <ContactLog contacts={localContacts} inquiryId={inquiry.id} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog: Add Package */}
      <Dialog open={openPackageDialog} onClose={() => setOpenPackageDialog(false)} fullWidth>
        <DialogTitle>Add Package</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="package-label">Package</InputLabel>
            <Select
              labelId="package-label"
              label="Package"
              value={selectedPackageId}
              onChange={(e) => setSelectedPackageId(e.target.value as string)}
            >
              <MenuItem value="">-- Select --</MenuItem>
              {allPackages.map((pkg: any) => (
                <MenuItem key={pkg.id} value={pkg.id}>
                  {pkg.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPackageDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddPackage}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Select Items */}
      <Dialog open={openItemSelectDialog} onClose={() => setOpenItemSelectDialog(false)} fullWidth>
        <DialogTitle>Select Items</DialogTitle>
        <DialogContent>
          {itemSelectPackage?.package?.packageItems?.length ? (
            itemSelectPackage.package.packageItems.map((pi: any) => (
              <Box key={pi.itemId} sx={{ mb: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!selectedItems[pi.itemId]}
                      onChange={(e) =>
                        setSelectedItems({
                          ...selectedItems,
                          [pi.itemId]: e.target.checked,
                        })
                      }
                    />
                  }
                  label={pi.item?.name || "Item"}
                />
              </Box>
            ))
          ) : (
            <Typography>No items found for this package.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenItemSelectDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveItemSelection}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Log Contact */}
      <Dialog open={openContactDialog} onClose={() => setOpenContactDialog(false)} fullWidth>
        <DialogTitle>Log Contact</DialogTitle>
        <DialogContent>
          <TextField
            label="Created By"
            fullWidth
            sx={{ mt: 2 }}
            value={contactCreatedBy}
            onChange={(e) => setContactCreatedBy(e.target.value)}
          />
          <TextField
            label="Note"
            fullWidth
            multiline
            rows={3}
            sx={{ mt: 2 }}
            value={contactNote}
            onChange={(e) => setContactNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenContactDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={(e) => { /* implement or fetch here */ }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Record Payment */}
      <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} fullWidth>
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          <TextField
            label="Payment Date"
            type="datetime-local"
            fullWidth
            sx={{ mt: 2 }}
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Amount"
            type="number"
            fullWidth
            sx={{ mt: 2 }}
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="payment-type-label">Payment Type</InputLabel>
            <Select
              labelId="payment-type-label"
              label="Payment Type"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value as string)}
            >
              <MenuItem value="CC">Credit Card</MenuItem>
              <MenuItem value="CASH">Cash</MenuItem>
              <MenuItem value="CHECK">Check</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Reference #"
            fullWidth
            sx={{ mt: 2 }}
            value={paymentRef}
            onChange={(e) => setPaymentRef(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPaymentDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddPayment}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Edit Event Type */}
      <Dialog open={openEventTypeDialog} onClose={() => setOpenEventTypeDialog(false)} fullWidth>
        <DialogTitle>Edit Event Type</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="eventType-label">Event Type</InputLabel>
            <Select
              labelId="eventType-label"
              label="Event Type"
              value={eventTypeId}
              onChange={(e) => setEventTypeId(e.target.value as string)}
            >
              <MenuItem value="">-- None --</MenuItem>
              {allEventTypes?.map((et: any) => (
                <MenuItem key={et.id} value={String(et.id)}>
                  {et.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEventTypeDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEventType}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Edit Gratuity */}
      <Dialog open={openGratuityDialog} onClose={() => setOpenGratuityDialog(false)} fullWidth>
        <DialogTitle>Override Gratuity</DialogTitle>
        <DialogContent>
          <TextField
            label="Gratuity % (whole number)"
            type="number"
            fullWidth
            sx={{ mt: 2 }}
            value={tempGratuityWhole}
            onChange={(e) => setTempGratuityWhole(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGratuityDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveGratuityOverride}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Add Upcharge */}
      <Dialog open={openUpchargeDialog} onClose={() => setOpenUpchargeDialog(false)} fullWidth>
        <DialogTitle>Add Upcharge</DialogTitle>
        <DialogContent>
          <TextField
            label="Upcharge Amount"
            type="number"
            fullWidth
            sx={{ mt: 2 }}
            value={upchargeAmount}
            onChange={(e) => setUpchargeAmount(e.target.value)}
          />
          <TextField
            label="Upcharge Note"
            type="text"
            fullWidth
            sx={{ mt: 2 }}
            value={upchargeNote}
            onChange={(e) => setUpchargeNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpchargeDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveUpcharge}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Item Upcharge */}
      <Dialog open={openItemUpchargeDialog} onClose={() => setOpenItemUpchargeDialog(false)} fullWidth>
        <DialogTitle>Item Upcharge</DialogTitle>
        <DialogContent>
          <TextField
            label="Item Upcharge Amount"
            type="number"
            fullWidth
            sx={{ mt: 2 }}
            value={itemUpchargeAmount}
            onChange={(e) => setItemUpchargeAmount(e.target.value)}
          />
          <TextField
            label="Upcharge Note"
            type="text"
            fullWidth
            sx={{ mt: 2 }}
            value={itemUpchargeNote}
            onChange={(e) => setItemUpchargeNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenItemUpchargeDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveItemUpcharge}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Edit Event Status */}
      <Dialog open={openStatusModal} onClose={() => setOpenStatusModal(false)} fullWidth>
        <DialogTitle>Edit Event Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="event-status-label">Status</InputLabel>
            <Select
              labelId="event-status-label"
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as string)}
            >
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="CONFIRMED">Confirmed</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="CLOSED">Closed</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStatusModal(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              setOpenStatusModal(false);
              handleSaveEvent();
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// (removed duplicate default export)