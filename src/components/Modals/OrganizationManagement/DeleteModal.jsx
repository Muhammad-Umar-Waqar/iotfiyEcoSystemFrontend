import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Stack from "@mui/material/Stack";
import { Building2 } from "lucide-react";
import InputField from "../../Inputs/InputField";

export default function OrganizationDeleteModal({
  open,
  handleClose,
  handleDelete,
  organizationName,
  organizationId,
}) {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="delete-org-title"
      aria-describedby="delete-org-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: 420 },
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
        <Typography id="delete-org-title" variant="h6" fontWeight="bold">
          Confirm Delete
        </Typography>

        <Typography id="delete-org-description" variant="body2" color="text.secondary">
          Are you sure you want to delete this organization?
        </Typography>

        <InputField
          label="Organization Name"
          id="organization_name"
          name="organization_name"
          type="text"
          value={organizationName}
          placeholder="Organization Name"
          disabled
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
          <Button
            onClick={() => handleDelete(organizationId)}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
