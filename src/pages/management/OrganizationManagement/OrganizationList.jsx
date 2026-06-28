// src/pages/management/OrganizationManagement/OrganizationList.jsx
import { Pencil, Trash, Menu} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import {
  updateOrganization,
  deleteOrganization,
  fetchOrganizationsByOwner,
  fetchOrganizationsByUser,
} from "../../../slices/OrganizationSlice";
import OrganizationDeleteModal from "../../../components/Modals/OrganizationManagement/DeleteModal";
import OrganizationEditModal from "../../../components/Modals/OrganizationManagement/EditModal";
import { canManage } from "../../../utils/permissions";
import SubscriptionUsageIndicator from "../../../components/SubscriptionUsageIndicator";

import "../../../styles/pages/management-pages.css";
import TableSkeleton from "../../../components/skeletons/TableSkeleton";
import CloseIcon from '@mui/icons-material/Close';
import { Drawer, IconButton, useMediaQuery } from "@mui/material";
import { managementDrawerPaperProps, ManagementDrawerBody } from "../../../utils/managementDrawer";

const OrganizationList = ({ onOrganizationSelect, selectedOrganization }) => {
  const dispatch = useDispatch();
  const { Organizations, isLoading, error } = useSelector((state) => state.Organization || {});
  const { user } = useSelector((state) => state.auth);
  const hasManagePermission = canManage(user);
  
  console.log('user>', user);

  const [DeleteOpen, setDeleteOpen] = useState(false);
  const [EditOpen, setEditOpen] = useState(false);
  const [organizationName, setOrganizationName] = useState("");
  const [OrganizationId, setOrganizationId] = useState(null);

  // drawer state for mobile
  const [drawerOpen, setDrawerOpen] = useState(false);
  // isDesktop = screens >= 768px
  const isDesktop = useMediaQuery("(min-width:768px)");
  const isMobile = !isDesktop;

  useEffect(() => {
  if (!user?.id) return;

  console.log('Fetching organizations for user role:', user.role, 'userId:', user.id);

  if (user.role === "manager") {
    dispatch(fetchOrganizationsByOwner(user.id));
  } else if (user.role === "user") {
    dispatch(fetchOrganizationsByUser());
  }
}, [dispatch, user]);



  useEffect(() => {
    if (error) console.error("Organization error:", error);
  }, [error]);

  const handleDeleteOpen = (name, id) => {
    if (!hasManagePermission) return;
    setDeleteOpen(true);
    setOrganizationName(name);
    setOrganizationId(id);
  };
  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setOrganizationId(null);
    setOrganizationName("");
  };
  const handleEditOpen = (name, id) => {
    if (!hasManagePermission) return;
    setEditOpen(true);
    setOrganizationId(id);
    setOrganizationName(name);
  };
  const handleEditClose = () => {
    setEditOpen(false);
    setOrganizationId(null);
    setOrganizationName("");
  };

  const handleChange = (e) => {
    setOrganizationName(e.target.value);
  };

  // Delete
  const handleDelete = async (id) => {
    if (!hasManagePermission) return;
    try {
      await dispatch(deleteOrganization(id)).unwrap();
      Swal.fire({ icon: "success", title: "Deleted", text: "Organization deleted." });
      handleDeleteClose();
    } catch (err) {
      console.error("Delete error:", err);
      Swal.fire({ icon: "error", title: "Delete failed", text: err || "Something went wrong" });
    }
  };

  // Update receives (orgId, newName)
  const handleEdit = async (orgId, newName) => {
    if (!hasManagePermission) return;
    try {
      await dispatch(updateOrganization({ id: orgId, name: newName })).unwrap();
      Swal.fire({ icon: "success", title: "Updated", text: "Organization updated." });

          // 🔥 force sync from backend (IMPORTANT FIX)
    if (user.role === "manager") {
      dispatch(fetchOrganizationsByOwner(user.id));
    } else {
      dispatch(fetchOrganizationsByUser());
    }

      handleEditClose();
    } catch (err) {
      console.error("Update error:", err);
      Swal.fire({ icon: "error", title: "Update failed", text: err || "Something went wrong" });
    }
  };

  const displayOrganizations = Array.isArray(Organizations) ? Organizations : [];

  // shared handler - when selecting from list (desktop or drawer)
  const handleRowClick = (organization, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    onOrganizationSelect?.(organization);
    // if mobile, close drawer after selection
    if (isMobile) setDrawerOpen(false);
  };

  // render the list markup (keeps your classes unchanged)
  const renderListMarkup = () => (
<div className="bg-white rounded-xl shadow-sm w-full border border-[#E5E7EB] p-5 flex flex-col h-full min-h-0 overflow-hidden">

        {
      isDesktop ?
      <h1 className="organization-list-title font-semibold text-gray-800 mb-4">Organization Management</h1>
    :
    <>
    <div className="flex justify-end">
          <IconButton
            onClick={() => setDrawerOpen(false)}
            edge="start"
            aria-label="close-details"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </div>
    </>
    }

      <div className="mb-4">
        <h2 className="organization-list-header text-center font-semibold text-gray-800">Organization List</h2>
      </div>

    <div className="organization-table-scroll overflow-y-auto flex-1 min-h-0 pr-1 overscroll-contain">
  <table className="w-full table-auto text-left">
    <thead className="sticky top-0 z-10 bg-white">
      <tr className="bg-gray-100">
        <th className="text-lg py-5 px-4 font-semibold text-gray-800">
          Organization Name
        </th>
        <th className="text-lg font-semibold py-5 px-4 text-center text-gray-800" >
          Actions
        </th>
      </tr>
    </thead>

    <tbody>
      {isLoading && <TableSkeleton rows={4} />}

      {!isLoading &&
        displayOrganizations.map((org, index) => {
          const id = org._id ?? org.id ?? index;
          const displayName =
            org.name ??
            org.organization_name ??
            `Organization ${index + 1}`;

          return (
            <tr
              key={id}
              className={`border-b border-gray-200 cursor-pointer transition-colors hover:bg-blue-50/60 ${
                selectedOrganization?._id === id ||
                selectedOrganization?.id === id
                  ? "bg-blue-50 border-blue-300"
                  : ""
              }`}
              onClick={(e) => handleRowClick(org, e)}
            >
              <td className="organization-table-cell py-2 sm:py-3 px-2 sm:px-4">
                {index + 1}. {displayName}
              </td>

              <td className="organization-table-cell py-2 sm:py-3 px-2 sm:px-4">
                <div
                  className="flex justify-center gap-2 sm:gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleEditOpen(displayName, id)}
                    disabled={!hasManagePermission}
                    className={`organization-action-btn rounded-full border border-green-500/50 bg-white flex items-center justify-center hover:bg-green-50 p-[4px] ${
                      !hasManagePermission
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    <Pencil
                      className="text-green-600 organization-action-icon"
                      size={16}
                    />
                  </button>

                  <button
                    onClick={() => handleDeleteOpen(displayName, id)}
                    disabled={!hasManagePermission}
                    className={`organization-action-btn rounded-full border border-red-500/50 bg-white flex items-center justify-center hover:bg-red-50 p-[4px] ${
                      !hasManagePermission
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    <Trash
                      className="text-red-600 organization-action-icon"
                      size={16}
                    />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}

      {!isLoading && displayOrganizations.length === 0 && (
        <tr>
          <td
            colSpan={2}
            className="p-4 text-center text-gray-500"
          >
            No organizations found.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
    </div>
  );

  return (
    <>
      {isDesktop ? (
        // Desktop: render list in-place exactly as before
        renderListMarkup()
      ) : (
        // Mobile: show a minimal header with hamburger. List only appears inside Drawer.
        <>
          <div className="flex items-center justify-between mb-4">

            <img src="/logo-half.png" className="w-auto h-[30px]"/>
            <h1 className="organization-list-title font-semibold text-gray-800">Organization Management</h1>

            <div>
              <IconButton aria-label="Open organizations" size="small" onClick={() => setDrawerOpen(true)}>
                <Menu size={20} />
              </IconButton>
            </div>
          </div>

          <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            PaperProps={managementDrawerPaperProps}
          >
            <ManagementDrawerBody>
              {renderListMarkup()}
            </ManagementDrawerBody>
          </Drawer>
        </>
      )}

      {DeleteOpen && hasManagePermission && (
        <OrganizationDeleteModal
          open={DeleteOpen}
          handleClose={handleDeleteClose}
          handleDelete={() => handleDelete(OrganizationId)}
          organizationId={OrganizationId}
          organizationName={organizationName}
        />
      )}

      {EditOpen && hasManagePermission && (
        <OrganizationEditModal
          open={EditOpen}
          handleClose={handleEditClose}
          handleEdit={handleEdit}
          organizationId={OrganizationId}
          organizationName={organizationName}
        />
      )}
    </>
  );
};

export default OrganizationList;
