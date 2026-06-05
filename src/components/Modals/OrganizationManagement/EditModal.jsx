// src/components/Modals/OrganizationManagement/EditModal.jsx
import React from "react";
import { Box, Button, Typography, Modal, Stack } from "@mui/material";
import InputField from "../../Inputs/InputField";

export default function OrganizationEditModal({
  open,
  handleClose,
  organizationName = "",
  handleEdit,
  organizationId,
}) {
  const [orgName, setOrgName] = React.useState(organizationName || "");

  // Sync when modal opens or organizationName changes
  React.useEffect(() => {
    if (open) setOrgName(organizationName || "");
  }, [open, organizationName]);

  const onUpdate = () => {
    const trimmed = (orgName || "").trim();
    if (!trimmed) {
      // optionally show a nicer toast
      return;
    }
    handleEdit && handleEdit(organizationId, trimmed);
  };

  return (
    <Modal open={!!open} onClose={handleClose} aria-labelledby="edit-org-title">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          // responsive width: nearly full on phones, fixed on larger screens
          width: { xs: "90%", sm: 500 },
          maxWidth: "95%",
          maxHeight: "90vh",
          overflowY: "auto",
          bgcolor: "background.paper",
          borderRadius: "8px",
          boxShadow: 24,
          // responsive padding
          p: { xs: 2, sm: 4 },
          outline: "none",
        }}
      >
        <Typography id="edit-org-title" variant="h6" fontWeight="bold" mb={2}>
          Edit Organization
        </Typography>

        <InputField
          label="Organization Name"
          id="organization_name"
          name="organization_name"
          type="text"
          value={orgName}
          onchange={(e) => setOrgName(e.target.value)}
          placeholder="Organization Name"
          icon={<Box size={18} className="text-gray-400" />}
        />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="flex-end"
          mt={3}
        >
          <Button
            onClick={handleClose}
            variant="outlined"
            fullWidth={{ xs: true, sm: false }}
          >
            Cancel
          </Button>
          <Button
            onClick={onUpdate}
            variant="contained"
            color="primary"
            fullWidth={{ xs: true, sm: false }}
          >
            Update
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
