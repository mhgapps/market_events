"use client";

import React, { useState } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";

interface Contract {
  id: number;
  content: string;
  generatedAt: string;
  status: string;
  customerSignature?: string;
  signedAt?: string;
}

interface ContractReviewProps {
  contract: Contract;
}

const ContractReview: React.FC<ContractReviewProps> = ({ contract }) => {
  const [signature, setSignature] = useState("");

  const handleAcceptContract = async () => {
    try {
      const res = await fetch(`/api/contracts/${contract.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerSignature: signature }),
      });
      if (!res.ok) {
        throw new Error("Failed to sign contract");
      }
      alert("Contract accepted successfully!");
      // Optionally, redirect or update UI here.
    } catch (error) {
      console.error("Error signing contract:", error);
      alert("Error signing contract");
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Contract Review
      </Typography>
      <Box
        sx={{
          border: "1px solid #ccc",
          p: 2,
          mb: 2,
          borderRadius: 1,
          maxHeight: "70vh",
          overflowY: "auto",
        }}
        dangerouslySetInnerHTML={{ __html: contract.content }}
      />
      <TextField
        fullWidth
        label="Enter Your Name (Signature)"
        value={signature}
        onChange={(e) => setSignature(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={handleAcceptContract}>
        Accept Contract
      </Button>
    </Box>
  );
};

export default ContractReview;