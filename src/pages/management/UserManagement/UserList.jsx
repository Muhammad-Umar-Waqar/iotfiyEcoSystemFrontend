// src/pages/management/UserManagement/UserList.jsx
import { useEffect, useState } from "react";
import { Pencil, Trash, Menu } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { fetchSubUsers, deleteSubUser } from "../../../slices/UserSlice";
import { canManage } from "../../../utils/permissions";
import Swal from "sweetalert2";
import EditUserModal from "../../../components/Modals/UserManagement/EditUserModal";
import "../../../styles/pages/management-pages.css";
import { Drawer, IconButton, useMediaQuery, Chip } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import TableSkeleton from "../../../components/skeletons/TableSkeleton";

const UserList = ({ onUserSelect, selectedUser }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { subUsers = [], isLoading, error } = useSelector((state) => state.User || {});
  const hasManagePermission = canManage(user);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [working, setWorking] = useState(false);
  const isDesktop = useMediaQuery("(min-width:768px)");
  const isMobile = !isDesktop;

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  // Only managers can access user management
  const isManager = user?.role === "manager";

  // Fetch sub-users on mount
  useEffect(() => {
    if (isManager && user?.id) {
      dispatch(fetchSubUsers(user.id));
    }
  }, [dispatch, isManager, user]);

  const handleRowClick = (user, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    onUserSelect?.(user);
    if (isMobile) setDrawerOpen(false);
  };

  const handleEdit = (user, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!hasManagePermission) return;

    setEditingUserId(user._id);
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setEditingUserId(null);
  };

  const handleDelete = async (userToDelete, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!hasManagePermission) return;

    const result = await Swal.fire({
      title: `Delete "${userToDelete.name}"?`,
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      setWorking(true);
      await dispatch(deleteSubUser(userToDelete._id)).unwrap();

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "User has been deleted.",
        timer: 1500,
        showConfirmButton: false,
      });

      if (isMobile) setDrawerOpen(false);
    } catch (err) {
      console.error("Delete user error:", err);
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: err?.message || String(err) || "Failed to delete user",
      });
    } finally {
      setWorking(false);
    }
  };

  // If not manager, show access denied
  if (!isManager) {
    return (
      <div className="ListPage user-list-container bg-white rounded-xl shadow-sm w-full h-full border border-[#E5E7EB] p-5 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only managers can access User Management.</p>
        </div>
      </div>
    );
  }

  const renderListMarkup = () => (
    <div className="ListPage user-list-container bg-white rounded-xl shadow-sm w-full h-full border border-[#E5E7EB] p-5">
      {isDesktop ? (
        <h1 className="organization-list-title font-semibold text-gray-800 mb-4">User Management</h1>
      ) : (
        <div className="flex justify-end">
          <IconButton onClick={() => setDrawerOpen(false)} edge="start" aria-label="close-details" size="small">
            <CloseIcon />
          </IconButton>
        </div>
      )}

      <div className="mb-4">
        <h2 className="user-list-header text-center font-semibold text-gray-800">User List</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="user-table-header py-2 px-4 font-bold text-gray-800">Name</th>
              {/* <th className="user-table-header py-2 px-4 font-bold text-gray-800 hidden sm:table-cell">Email</th> */}
              <th className="user-table-header py-2 px-4 text-center">Permission</th>
              <th className="user-table-header py-2 px-4 text-center">Actions</th>
            </tr>
          </thead>
        </table>

        <div className="user-table-scroll overflow-y-auto pr-1 h-[63vh] sm:h-[58vh]">
          <table className="w-full table-auto text-left">
            <tbody>
              {isLoading && <TableSkeleton rows={5} />}

              {!isLoading && subUsers.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-500">
                    No users found. Add one to get started.
                  </td>
                </tr>
              )}

              {!isLoading && subUsers.map((userItem, index) => {
                const id = userItem._id || index;
                const userName = userItem.name || "Unknown";
                const userEmail = userItem.email || "N/A";
                const permission = userItem.permission || "view";

                return (
                  <tr
                    key={id}
                    className={`border-b border-gray-200 cursor-pointer transition-colors hover:bg-blue-50/60 ${
                      selectedUser?._id === id ? "bg-blue-50 border-blue-300" : ""
                    }`}
                    onClick={(e) => handleRowClick(userItem, e)}
                  >
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{userName}</span>
                        <span className="text-xs text-gray-500 sm:hidden">{userEmail}</span>
                      </div>
                    </td>
                    {/* <td className="py-2 sm:py-3 px-2 sm:px-4 text-sm text-gray-600 hidden sm:table-cell">
                      {userEmail}
                    </td> */}
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-center">
                      <Chip
                        label={permission.toUpperCase()}
                        size="small"
                        color={permission === "manage" ? "success" : "primary"}
                      />
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <div className="flex justify-center gap-2 sm:gap-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleEdit(userItem, e)}
                          disabled={!hasManagePermission || working}
                          className={`rounded-full border border-green-500/50 bg-white flex items-center justify-center hover:bg-green-50 p-2 ${
                            !hasManagePermission || working ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                          title="Edit user"
                        >
                          <Pencil className="text-green-600" size={16} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(userItem, e)}
                          disabled={!hasManagePermission || working}
                          className={`rounded-full border border-red-500/50 bg-white flex items-center justify-center hover:bg-red-50 p-2 ${
                            !hasManagePermission || working ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                          title="Delete user"
                        >
                          <Trash className="text-red-600" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {isDesktop ? (
        renderListMarkup()
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <img src="/logo-half.png" className="w-auto h-[30px]"/>
            <h1 className="user-list-title font-semibold text-gray-800">User Management</h1>
            <div>
              <IconButton aria-label="Open users" size="small" onClick={() => setDrawerOpen(true)}>
                <Menu size={20} />
              </IconButton>
            </div>
          </div>

          <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            PaperProps={{ style: { width: "100%" } }}
          >
            <div className="p-4">{renderListMarkup()}</div>
          </Drawer>
        </>
      )}

      {/* Edit User Modal */}
      {editModalOpen && (
        <EditUserModal
          open={editModalOpen}
          onClose={handleEditModalClose}
          userId={editingUserId}
        />
      )}
    </>
  );
};

export default UserList;
