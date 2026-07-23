import { createElement } from "react";

/** MUI Drawer props — eco page bg, full-height, scroll inside (scrollbar hidden). */
export const managementDrawerPaperProps = {
  sx: {
    width: "100%",
    height: "100%",
    maxHeight: "100dvh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "var(--eco-page-bg-solid)",
    background: "var(--eco-page-bg) !important",
    borderLeft: "1px solid var(--eco-panel-border)",
    boxShadow: "none",
    /* hide native scrollbar chrome on Paper itself */
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    "&::-webkit-scrollbar": {
      display: "none",
      width: 0,
      height: 0,
    },
  },
};

export const managementDrawerUserPaperProps = {
  sx: {
    width: "100%",
    maxWidth: 440,
    height: "100%",
    maxHeight: "100dvh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "var(--eco-page-bg-solid)",
    background: "var(--eco-page-bg) !important",
    borderLeft: "1px solid var(--eco-panel-border)",
    boxShadow: "none",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    "&::-webkit-scrollbar": {
      display: "none",
      width: 0,
      height: 0,
    },
  },
};

export function ManagementDrawerBody({ children, className = "" }) {
  return createElement(
    "div",
    {
      className: `eco-mgmt-drawer-body flex h-full min-h-0 flex-col overflow-hidden ${className}`.trim(),
    },
    children
  );
}
