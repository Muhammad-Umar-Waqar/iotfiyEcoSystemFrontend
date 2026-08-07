// src/components/Modals/OrganizationManagement/EditModal.jsx
import React from "react";
import { Box, Button, Typography, Modal, Stack } from "@mui/material";
import { Building2 } from "lucide-react";
import InputField from "../../Inputs/InputField";

export default function OrganizationEditModal({
  open,
  handleClose,
  organizationName = "",
  handleEdit,
  organizationId,
}) {
  const [orgName, setOrgName] = React.useState(organizationName || "");

  React.useEffect(() => {
    if (open) setOrgName(organizationName || "");
  }, [open, organizationName]);

  const onUpdate = () => {
    const trimmed = (orgName || "").trim();
    if (!trimmed) return;
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
          width: { xs: "90%", sm: 480 },
          maxWidth: "95%",
          bgcolor: "background.paper",
          borderRadius: "8px",
          boxShadow: 24,
          p: { xs: 2.5, sm: 3 },
          outline: "none",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography id="edit-org-title" variant="h6" fontWeight="bold">
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
          icon={<Building2 size={18} className="text-gray-400" />}
        />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          justifyContent="flex-end"
          sx={{ pt: 0.5 }}
        >
          <Button onClick={handleClose} variant="outlined">
            Cancel
          </Button>
          <Button onClick={onUpdate} variant="contained" color="primary">
            Update
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
