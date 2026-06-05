import React from "react";
import { Skeleton } from "@mui/material";

const TableSkeleton = ({ rows = 5, status=false, role }) => {
  const items = Array.from({ length: rows });

  return (
    <>
      {items.map((_, i) => (
        <tr key={i} className="border-b border-gray-200">
          {/* Organization Name cell */}
          <td className="py-2 sm:py-3 px-2 sm:px-4">
            <div className="flex items-center gap-3">
              {/* one-line text */}
              <div style={{ flex: 1 }}>
                <Skeleton variant="text" width="55%" height={18} />
              </div>
            </div>
          </td>

          {(status && role === "admin") && (
            <td className="py-2 px-4 ml-10">
              <Skeleton variant="rounded" width={80} height={24} />
            </td>
          )}
          

          {/* Actions cell */}
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









