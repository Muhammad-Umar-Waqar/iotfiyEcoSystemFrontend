
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import InputField from "../../Inputs/InputField";
import { useSelector } from "react-redux";
import { useTheme, useMediaQuery } from "@mui/material";

export default function UserDeleteModal({ handleClose, handleDelete, userEmail }) {
  const { ManagerDeleteModalOpen } = useSelector((state) => state.Manager);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: isMobile ? "90%" : 400,
    maxWidth: 400,
    bgcolor: "background.paper",
    borderRadius: "8px",
    boxShadow: 24,
    p: 4,
  };

  return (
    <Modal open={ManagerDeleteModalOpen} onClose={handleClose} aria-labelledby="delete-user-title">
      <Box sx={modalStyle}>
        <Typography id="delete-user-title" variant="h6" fontWeight="bold" mb={2}>
          Are you sure you want to delete this user?
        </Typography>

        <InputField
          label="User Email"
          id="email"
          name="email"
          type="email"
          value={userEmail}
          placeholder="User Email"
          disabled
        />

        <Box mt={3} display="flex" gap={2} justifyContent="flex-end" flexDirection={isMobile ? "column" : "row"}>
          <Button onClick={handleClose} variant="outlined" fullWidth={isMobile}>
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error" fullWidth={isMobile}>
            Delete
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
