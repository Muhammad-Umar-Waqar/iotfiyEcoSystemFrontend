// hooks/useResponsiveQuery.js
import { useMediaQuery } from "@mui/material";

export const useIsMobile = () => {
  return useMediaQuery("(max-width:640px)");
};


export const useIsMobileforDashboardAndRightPanel = () => {
  return useMediaQuery("(max-width:1024px)");
};