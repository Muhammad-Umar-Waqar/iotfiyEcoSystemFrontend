// Above code is same I am implementing the functionality of persistant selection of organization and venue here below
import React, { useEffect, useState } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import "../styles/components/Sidebar.css"
import { useDispatch, useSelector } from "react-redux"
import { logoutUser } from "../slices/authSlice"
import { persistor } from "../store/store"
import Tooltip from "@mui/material/Tooltip";
import LogoutDialog from "./Modals/LogoutDialog"
import { useMediaQuery, Skeleton } from "@mui/material"

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5050"

const Icon = ({ src, alt, size = 24, className = "", ...props }) => (
  <img
    src={src}
    alt={alt}
    width={size}
    height={size}
    className={`imageClassForActiveandHover ${className}`.trim()}
    onError={(e) => { e.currentTarget.src = "/sidebar-images/placeholder.png" }}
    {...props}
  />
)

// replace the MobDashMenu declaration with this version
const MobDashMenu = ({ items = [], onItemClick, activePath = "/", openLogout, activeVenue = null, loading = false, skeletonCount = 3 }) => {
  // helper to render a skeleton icon
  const renderSkeletonItem = (key) => (
    <span key={key} style={{ display: "inline-block" }}>
      <div
        className="h-[45px] w-[45px] flex items-center justify-center sidebar-icon"
        title="Loading"
        aria-hidden="true"
      >
        <Skeleton variant="circular" width={28} height={28} />
      </div>
    </span>
  );

  return (
    <div
      className="bg-[#E8EDF2] left-1/2 transform -translate-x-1/2 px-3 flex items-center justify-around rounded-t-[35px] fixed bottom-0 z-30 pt-1 w-full max-w-[500px]"
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
      {loading
        ? // show skeletons while loading
        Array.from({ length: skeletonCount }).map((_, i) => renderSkeletonItem(`mob-skel-${i}`))
        : // normal items
        items.map((it, idx) => {
          const isVenueItem = !!it.venueId;

          const isActive = isVenueItem
            ? String(activeVenue) === String(it.venueId)
            : (() => {
              const path = String(activePath || "").replace(/\/+$/, "");
              const link = String(it.link || "").replace(/\/+$/, "");
              if (it.key === "home" && path === "/management") return true;
              if (it.key === "home") return path === link;
              return path === link || (link && path.startsWith(link));
            })();

          const venueNumber = isVenueItem
            ? items.slice(0, idx + 1).filter(x => !!x.venueId).length
            : null;

          return (
            <Tooltip key={it.key} title={it.label} placement="top">
              <span style={{ display: "inline-block" }}>
                <NavLink
                  to={it.link || "#"}
                  onClick={(e) => {
                    if (onItemClick) {
                      const prevent = onItemClick(it);
                      if (prevent === true) e.preventDefault();
                    }
                  }}
                  key={it.key}
                  end
                  className={() => `h-[45px] w-[45px] flex items-center justify-center sidebar-icon ${isActive ? "active" : ""}`}
                  aria-label={it.label}
                  aria-current={isActive ? "page" : undefined}
                  title={it.label}
                >
                  <Icon src={it.icon} alt={it.label} size={20} className="imageClassForActiveandHover " />
                  <div className="relative">
                    {isVenueItem && (
                      <p className="absolute text-xs top-[-11px] right-[-8px]" aria-hidden="true">
                        {String(venueNumber).padStart(2, "0")}
                      </p>
                    )}
                  </div>
                </NavLink>
              </span>
            </Tooltip>
          );
        })}
      <button onClick={openLogout} aria-label="Logout" title="Logout" className="p-2 rounded-full bg-white/10">
        <img src="/sidebar-images/8.png" alt="Logout" width={28} height={28} />
      </button>
    </div>
  );
};



const SidebarRebuilt = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, token } = useSelector((state) => state.auth)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const openLogout = () => setLogoutOpen(true)
  const closeLogout = () => setLogoutOpen(false)
  const isMobile = useMediaQuery("(max-width:759px)")

  // Admin navigation items
  const Adminitems = [
    { key: "home", label: "Home", link: "/admin/management", icon: "/sidebar-images/1.png", blueIcon: "/sidebar-images-blue/1.svg" },
    // { key: "users-management", label: "Users Management", link: "/admin/management/users", icon: "/sidebar-images/7.png", blueIcon: "/sidebar-images-blue/7.png" },
    { key: "plan-management", label: "Plan Management", link: "/admin/management/plans", icon: "/sidebar-images/9.png", blueIcon: "/sidebar-images-blue/9.png" },
    { key: "ota-management", label: "OTA Management", link: "/admin/management/ota", icon: "/sidebar-images/9.png", blueIcon: "/sidebar-images-blue/9.png" },
  ]

  // Manager and User navigation items (same for both)
  const ManagerUserItems = [
    { key: "home", label: "Home", link: "/management", icon: "/sidebar-images/1.png", blueIcon: "/sidebar-images-blue/1.svg" },
    { key: "organization-management", label: "Organization Management", link: "/management/organization", icon: "/sidebar-images/2.png", blueIcon: "/sidebar-images-blue/2.png" },
    { key: "venue-management", label: "Venue Management", link: "/management/venue", icon: "/sidebar-images/4.png", blueIcon: "/sidebar-images-blue/4.png" },
    { key: "device-management", label: "Device Management", link: "/management/device", icon: "/sidebar-images/3.png", blueIcon: "/sidebar-images-blue/3.png" },
  ]

  // Manager-only items
  const ManagerOnlyItems = [
    { key: "users-management", label: "Users Management", link: "/management/users", icon: "/sidebar-images/7.png", blueIcon: "/sidebar-images-blue/7.png" },
    { key: "subscription-analytics", label: "Subscription Analytics", link: "/management/subscription", icon: "/sidebar-images/9.png", blueIcon: "/sidebar-images-blue/9.png" },
  ]


  const handleConfirmLogout = async () => {
    try {
      setLoading(true)
      // Dispatch logout action (clears Redux state + localStorage)
      await dispatch(logoutUser()).unwrap()
      // Purge redux-persist storage
      await persistor.purge()
      // Navigate to login
      navigate("/login")
    } catch (error) {
      // Even if logout API fails, still clear everything and navigate
      await persistor.purge()
      navigate("/login")
    } finally {
      setLoading(false)
      closeLogout()
    }
  }

  // Get navigation items based on role
  const getNavigationItems = () => {
    if (user?.role === "admin") {
      return Adminitems;
    }
    // Manager gets all items including User Management
    if (user?.role === "manager") {
      return [...ManagerUserItems, ...ManagerOnlyItems];
    }
    // Regular users don't see User Management
    return ManagerUserItems;
  }

  const navigationItems = getNavigationItems();
  const activePath = location.pathname;

  return (
    <>
      {/* Desktop sidebar */}
      {!isMobile && (
        <div className="sidebar">
          <div className="sidebar-top">
            <img src="/logo-half.png" alt="logo" width={48} height={48} />
          </div>

          <nav className="sidebar-nav">
            <div className="sidebar-track">
              {navigationItems.map((item) => {
                const active = location.pathname === item.link ||
                  (item.key === "home" && (
                    (user?.role === "admin" && location.pathname === "/admin/management") ||
                    (user?.role !== "admin" && location.pathname === "/management")
                  ))
                return (
                  <Tooltip key={item.key} title={item.label} placement="right">
                    <span style={{ display: "inline-block" }}>
                      <NavLink
                        to={item.link}
                        end
                        className={`sidebar-icon ${active ? "active" : ""}`}
                        data-tooltip={item.label}
                        aria-label={item.label}
                      >
                        <Icon src={item.blueIcon} alt={item.label} className="imageClassForActiveandHover" />
                      </NavLink>
                    </span>
                  </Tooltip>
                )
              })}
            </div>
          </nav>

          <div className="sidebar-bottom">
            <div className="sidebar-track">
              <button
                onClick={openLogout}
                type="button"
                aria-label="Logout"
                className={`sidebar-icon cursor-pointer`}
                data-tooltip="Logout"
              >
                <Icon src="/sidebar-images/8.png" alt="Logout" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      {isMobile && (
        <MobDashMenu
          items={navigationItems.map(it => ({
            key: it.key,
            label: it.label,
            link: it.link,
            icon: it.blueIcon
          }))}
          onItemClick={() => false}
          activePath={activePath}
          openLogout={openLogout}
          activeVenue={null}
          loading={false}
          skeletonCount={0}
        />
      )}

      <LogoutDialog
        open={logoutOpen}
        onClose={closeLogout}
        onConfirm={handleConfirmLogout}
        loading={loading}
        title="Confirm sign out"
        description="You are about to sign out. Are you sure you want to continue?"
      />
    </>
  )
}

export default SidebarRebuilt
