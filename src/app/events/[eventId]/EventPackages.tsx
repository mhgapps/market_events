"use client";
import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import SettingsSuggestOutlinedIcon from '@mui/icons-material/SettingsSuggestOutlined';

// Dynamically import Quill
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

// Minimal toolbar config: only bold, italic, underline
const toolbarOptions = [
  ["bold", "italic", "underline"],
];

type EventPackage = any; // Replace 'any' with the proper type when available

interface EventPackagesProps {
  eventPackages: EventPackage[];
  guestCount: number;
  onRemovePackage: (packageId: number) => void;
  onOpenItemSelect: (eventPackage: EventPackage) => void;
  onRemoveItem: (packageId: number, eventPackageItemId: number) => void;
  onAddUpcharge: (packageId: number) => void;
  onUpchargeItem: (packageId: number, eventPackageItemId: number) => void;
  onEditNote: (packageId: number, eventPackageItemId: number, note: string) => void;
  onRemoveNote: (packageId: number, eventPackageItemId: number) => void;
}

const EventPackages: React.FC<EventPackagesProps> = ({
  eventPackages,
  guestCount,
  onRemovePackage,
  onOpenItemSelect,
  onRemoveItem,
  onAddUpcharge,
  onUpchargeItem,
  onEditNote,
  onRemoveNote,
}) => {
  // PACKAGE-LEVEL MENU
  const [packageAnchorEl, setPackageAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedPackageId, setSelectedPackageId] = React.useState<number | null>(null);
  const [selectedPackageEp, setSelectedPackageEp] = React.useState<any>(null);

  const handleOpenPackageMenu = (event: React.MouseEvent<HTMLElement>, pkgId: number, ep: any) => {
    setPackageAnchorEl(event.currentTarget);
    setSelectedPackageId(pkgId);
    setSelectedPackageEp(ep);
  };
  const handleClosePackageMenu = () => {
    setPackageAnchorEl(null);
    setSelectedPackageId(null);
    setSelectedPackageEp(null);
  };

  // ITEM-LEVEL MENU
  const [itemAnchorEl, setItemAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedItemActions, setSelectedItemActions] = React.useState<{
    packageId: number;
    item: any;
  } | null>(null);

  const handleOpenItemMenu = (
    event: React.MouseEvent<HTMLElement>,
    packageId: number,
    item: any
  ) => {
    setItemAnchorEl(event.currentTarget);
    setSelectedItemActions({ packageId, item });
  };
  const handleCloseItemMenu = () => {
    setItemAnchorEl(null);
    setSelectedItemActions(null);
  };

  // NOTE-LEVEL MODAL (for editing note on an item)
  const [openNoteDialog, setOpenNoteDialog] = React.useState(false);
  const [noteText, setNoteText] = React.useState("");
  const [notePackageId, setNotePackageId] = React.useState<number | null>(null);
  const [noteItemId, setNoteItemId] = React.useState<number | null>(null);

  function handleOpenNoteDialog(pkgId: number, item: any) {
    setNotePackageId(pkgId);
    setNoteItemId(item.id);
    setNoteText(item.notes || "");
    setOpenNoteDialog(true);
  }
  function handleCloseNoteDialog() {
    setOpenNoteDialog(false);
  }
  function handleSaveNote() {
    if (notePackageId !== null && noteItemId !== null) {
      onEditNote(notePackageId, noteItemId, noteText);
    }
    setOpenNoteDialog(false);
  }

  // Sort packages (example: Appetizers and Salads first)
  const sortedEventPackages = [...eventPackages].sort((a, b) => {
    const nameA = a.package.name;
    const nameB = b.package.name;
    if (nameA === "Appetizers") return -1;
    if (nameB === "Appetizers") return 1;
    if (nameA === "Salads") return -1;
    if (nameB === "Salads") return 1;
    return nameA.localeCompare(nameB);
  });

  return (
    <Box mt={1}>
      {sortedEventPackages.map((ep: any) => {
        const packageUpcharge = ep.upcharge ? Number(ep.upcharge) : 0;
        const itemsUpchargeSum = ep.eventPackageItems.reduce(
          (sum: number, item: any) => sum + (item.finalUpcharge ? Number(item.finalUpcharge) : 0),
          0
        );

        return (
          <Card key={ep.packageId} sx={{ mb: 2, position: "relative" }}>
            <CardContent>
              {/* Package Header */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" component="span" sx={{ mr: 1 }}>
                  {ep.package.name}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => handleOpenPackageMenu(e, ep.packageId, ep)}
                >
                  <SettingsSuggestOutlinedIcon />
                </IconButton>
              </Box>

              {/* Package Description */}
              {ep.package.description && (
                <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                  {ep.package.description}
                </Typography>
              )}
              {ep.priceAtBooking !== 0 && (
                <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                  Price at Booking: ${ep.priceAtBooking.toFixed(2)}
                </Typography>
              )}

              {/* Upcharge Totals */}
              {(packageUpcharge > 0 || itemsUpchargeSum > 0) && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 8,
                    right: 8,
                    textAlign: "right",
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  {packageUpcharge > 0 && (
                    <Box>
                      <Box>
                        <Typography variant="caption" component="div" color="primary">
                          Package Upcharge
                        </Typography>
                      </Box>
                      {ep.upchargeNote && (
                        <Box>
                          <Typography variant="caption" component="div" color="textSecondary">
                            Upcharge Note: {ep.upchargeNote}
                          </Typography>
                        </Box>
                      )}
                      <Box>
                        <Typography variant="caption" component="div" color="primary">
                          Upcharge Total: ${(packageUpcharge * guestCount).toFixed(2)}
                        </Typography>
                      </Box>
                      <Divider sx={{ mt: 1 }} />
                    </Box>
                  )}
                  {itemsUpchargeSum > 0 && (
                    <Box>
                      <Typography variant="caption" component="div" color="primary">
                        Items Upcharge: ${(itemsUpchargeSum * guestCount).toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* Items List */}
              <Box mt={2}>
                <Typography variant="subtitle1" component="div">
                  Selected Items:
                </Typography>
                {ep.eventPackageItems.length > 0 ? (
                  <Box sx={{ mt: 1 }}>
                    {ep.eventPackageItems.map((item: any) => (
                      <Box
                        key={item.id}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                          mb: 1,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="body2" component="span">
                              {item.packageItem?.item?.name || "Item"}
                            </Typography>
                            {Number(item.finalUpcharge) > 0 && (
                              <Box sx={{ display: "flex", flexDirection: "column", ml: 1 }}>
                                {item.upchargeNote ? (
                                  <Typography variant="caption" component="span" color="textSecondary">
                                    {item.upchargeNote}: ${Number(item.finalUpcharge).toFixed(2)}
                                  </Typography>
                                ) : (
                                  <Typography variant="caption" component="span" color="primary">
                                    Upcharge: ${Number(item.finalUpcharge).toFixed(2)}
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </Box>
                          <IconButton
                            size="small"
                            onClick={(e) => handleOpenItemMenu(e, ep.packageId, item)}
                          >
                            <MoreHorizIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        {item.notes && (
                          <Typography
                            variant="caption"
                            component="div"
                            sx={{
                              ml: 2,
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                            }}
                          >
                            <span dangerouslySetInnerHTML={{ __html: item.notes }} />
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" component="div">
                    No items selected.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        );
      })}

      {/* Package Menu */}
      <Menu anchorEl={packageAnchorEl} open={Boolean(packageAnchorEl)} onClose={handleClosePackageMenu}>
        <MenuItem
          onClick={() => {
            if (selectedPackageEp) {
              onOpenItemSelect(selectedPackageEp);
              handleClosePackageMenu();
            }
          }}
        >
          Select Items
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedPackageId !== null) {
              onAddUpcharge(selectedPackageId);
              handleClosePackageMenu();
            }
          }}
        >
          Add Upcharge
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedPackageId !== null) {
              onRemovePackage(selectedPackageId);
              handleClosePackageMenu();
            }
          }}
        >
          Remove Package
        </MenuItem>
      </Menu>

      {/* Item Menu */}
      <Menu anchorEl={itemAnchorEl} open={Boolean(itemAnchorEl)} onClose={handleCloseItemMenu}>
        <MenuItem
          onClick={() => {
            if (selectedItemActions) {
              onRemoveItem(selectedItemActions.packageId, selectedItemActions.item.id);
              handleCloseItemMenu();
            }
          }}
        >
          Remove Item
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedItemActions) {
              onUpchargeItem(selectedItemActions.packageId, selectedItemActions.item.id);
              handleCloseItemMenu();
            }
          }}
        >
          Upcharge Item
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedItemActions) {
              handleOpenNoteDialog(selectedItemActions.packageId, selectedItemActions.item);
              handleCloseItemMenu();
            }
          }}
        >
          Edit/Add Note
        </MenuItem>
        {selectedItemActions?.item?.notes && (
          <MenuItem
            onClick={() => {
              if (selectedItemActions) {
                onRemoveNote(selectedItemActions.packageId, selectedItemActions.item.id);
                handleCloseItemMenu();
              }
            }}
          >
            Remove Note
          </MenuItem>
        )}
      </Menu>

      {/* Note Dialog with Quill Editor */}
      <Dialog open={openNoteDialog} onClose={handleCloseNoteDialog} fullWidth>
        <DialogTitle>Edit Note</DialogTitle>
        <DialogContent>
          <ReactQuill
            theme="snow"
            value={noteText}
            onChange={setNoteText}
            modules={{ toolbar: toolbarOptions }}
            style={{ minHeight: "150px" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNoteDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveNote}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventPackages;