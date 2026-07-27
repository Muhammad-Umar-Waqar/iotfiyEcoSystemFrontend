import React from "react";
import { Skeleton } from "@mui/material";

/**
 * Management list row skeletons.
 * variant:
 *  - "default" — name + actions (Organization / Venue)
 *  - "device"  — name + type chip/category + actions
 *  - "user"    — name (+ mobile email) + email + permission chip + actions
 */
const TableSkeleton = ({ rows = 5, variant = "default", status = false, role }) => {
  const items = Array.from({ length: rows });

  if (variant === "device") {
    return (
      <>
        {items.map((_, i) => (
          <tr key={i} className="border-b border-gray-200">
            <td className="py-2 sm:py-3 px-2 sm:px-4 max-w-0">
              <Skeleton variant="text" width="70%" height={20} />
            </td>
            <td className="py-2 sm:py-3 px-1 sm:px-4 text-center max-w-0">
              <div className="flex flex-col gap-1 items-center w-full">
                <Skeleton variant="rounded" width={88} height={26} sx={{ borderRadius: 16 }} />
                <Skeleton variant="text" width={64} height={14} />
              </div>
            </td>
            <td className="py-2 sm:py-3 px-1 sm:px-4">
              <div className="flex justify-center gap-1.5 sm:gap-3">
                <Skeleton variant="circular" width={28} height={28} />
                <Skeleton variant="circular" width={28} height={28} />
              </div>
            </td>
          </tr>
        ))}
      </>
    );
  }

  if (variant === "user") {
    return (
      <>
        {items.map((_, i) => (
          <tr key={i} className="border-b border-gray-100">
            <td className="py-2.5 px-2 sm:px-4 align-middle">
              <div className="flex flex-col gap-0.5 min-w-0">
                <Skeleton variant="text" width="75%" height={18} />
                <Skeleton
                  variant="text"
                  width="90%"
                  height={14}
                  className="sm:hidden"
                />
              </div>
            </td>
            <td className="hidden sm:table-cell py-2.5 px-4 align-middle min-w-0">
              <Skeleton variant="text" width="85%" height={18} />
            </td>
            <td className="py-2.5 px-2 sm:px-4 text-center align-middle">
              <div className="flex justify-center">
                <Skeleton variant="rounded" width={72} height={24} sx={{ borderRadius: 16 }} />
              </div>
            </td>
            <td className="py-2.5 px-2 sm:px-4 align-middle">
              <div className="flex justify-center gap-2">
                <Skeleton variant="circular" width={30} height={30} />
                <Skeleton variant="circular" width={30} height={30} />
              </div>
            </td>
          </tr>
        ))}
      </>
    );
  }

  // default — Organization / Venue (name + actions)
  return (
    <>
      {items.map((_, i) => (
        <tr key={i} className="border-b border-gray-200">
          <td className="py-2 sm:py-3 px-2 sm:px-4">
            <div className="flex items-center gap-3">
              <div style={{ flex: 1 }}>
                <Skeleton variant="text" width="55%" height={18} />
              </div>
            </div>
          </td>

          {status && role === "admin" && (
            <td className="py-2 px-4 ml-10">
              <Skeleton variant="rounded" width={80} height={24} />
            </td>
          )}

          <td className="py-2 sm:py-3 px-2 sm:px-4">
            <div className="flex justify-center gap-2 sm:gap-3">
              <Skeleton variant="circular" width={36} height={36} />
              <Skeleton variant="circular" width={36} height={36} />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
};

export default React.memo(TableSkeleton);
