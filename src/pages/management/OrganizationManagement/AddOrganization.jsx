// src/pages/management/OrganizationManagement/AddOrganization.jsx
import { Box } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import InputField from "../../../components/Inputs/InputField";
import Swal from "sweetalert2";
import { createOrganization, fetchOrganizationsByOwner, fetchOrganizationsByUser } from "../../../slices/OrganizationSlice";
import { canManage } from "../../../utils/permissions";
import "../../../styles/pages/management-pages.css";


const AddOrganization = () => {

  const [formData, setFormData] = useState({
    organization_name: ""
  });
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const hasManagePermission = canManage(user);

  const [loadingformSubmit, setLoadingformSubmit] = useState(false);

  const onchange = (e) => {
    if (!hasManagePermission) return;
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasManagePermission) {
      Swal.fire({
        icon: "warning",
        title: "Permission Denied",
        text: "You don't have permission to create organizations."
      });
      return;
    }

    const name = (formData.organization_name || "").trim();
    if (!name) {
      Swal.fire({ icon: "warning", title: "Missing field", text: "Organization name is required." });
      return;
    }
    
    // ✅ NEW VALIDATION (min length = 4)
  if (name.length <= 3) {
    Swal.fire({
      icon: "warning",
      title: "Invalid Name",
      text: "Organization name must be more than 3 characters."
    });
    return;
  }


    setLoadingformSubmit(true);

    try {
      // create organization via thunk (thunk reads token from localStorage)
      const created = await dispatch(createOrganization(name)).unwrap();

      Swal.fire({
        icon: "success",
        title: "Organization created",
        text: `Organization "${created?.name || name}" added successfully.`,
      });

      // Clear form
      setFormData({ organization_name: ""});

      // Refresh organization list based on role
      if (user?.id) {
        if (user.role === "manager") {
          dispatch(fetchOrganizationsByOwner(user.id));
        } else if (user.role === "user") {
          dispatch(fetchOrganizationsByUser());
        }
      }

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Create failed",
        text: err || "Unable to create organization.",
      });
      console.error("create organization error:", err);
    } finally{
      setLoadingformSubmit(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center eco-mgmt-add rounded-xl shadow-sm w-full md:flex flex-col justify-center">
      
    <div className="  AddingPage organization-add-container w-full">
      {/* Desktop only (≥768px) — theme illustration above title */}
      <div className="hidden md:flex justify-center mb-4" aria-hidden="true">
        <img
          src="/organization-add-hero.svg"
          alt=""
          className="h-[120px] w-auto select-none pointer-events-none"
        />
      </div>

      <h2 className="organization-add-title font-semibold mb-1 text-center eco-mgmt-title">Add Organization</h2>
      <p className="organization-add-subtitle eco-mgmt-muted mb-6 text-center">
        {hasManagePermission
          ? "Welcome back! Select method to add organization"
          : "View Only Mode - Forms are disabled"
        }
      </p>

      <div className={`organization-add-form space-y-4 mx-auto  md:w-[70%] ${!hasManagePermission ? 'opacity-60 pointer-events-none' : ''}`}>
        <InputField
          id="organization_name"
          name="organization_name"
          label="Organization Name"
          type="text"
          value={formData.organization_name}
          onchange={onchange}
          placeholder="Organization Name"
          icon={<Box size={20} />}
          disabled={!hasManagePermission}
        />

        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loadingformSubmit || !hasManagePermission}
          className={`w-full eco-btn-primary text-white font-semibold py-2.5 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--eco-primary)] focus:ring-offset-2 ${
            (loadingformSubmit || !hasManagePermission) ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          {loadingformSubmit ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
    </div>
  );
};

export default AddOrganization;
