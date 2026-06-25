import { createElement } from "react";

/** MUI Drawer props so list content scrolls inside the panel, not the page. */
export const managementDrawerPaperProps = {
  sx: {
    width: "100%",
    height: "100%",
    maxHeight: "100dvh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
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
  },
};

export function ManagementDrawerBody({ children, className = "" }) {
  return createElement(
    "div",
    { className: `flex h-full min-h-0 flex-col overflow-hidden ${className}`.trim() },
    children
  );
}
