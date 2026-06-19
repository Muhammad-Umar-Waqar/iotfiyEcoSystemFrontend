import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../slices/authSlice';
import { persistor } from '../store/store';
import {
  Building2, MapPin, Users, Cpu, ChevronDown, ChevronRight,
  Activity, LogOut, Settings, Menu
} from 'lucide-react';
import { Box, Drawer, useMediaQuery } from '@mui/material';
import LogoutDialog from './Modals/LogoutDialog';
import { useIsMobile } from '../hooks/responsiveQuery';

/* ============================================================
   DESIGN TOKENS
   ============================================================ */

const C = {
  accent: '#4f46e5',
  accentMid: '#6366f1',
  accentSoft: '#eef2ff',
  accentBorder: '#c7d2fe',

  bg: '#f8fafc',
  surface: '#ffffff',
  surfaceHov: '#f8fafc',

  border: '#e2e8f0',
  borderMid: '#cbd5e1',

  text: '#0f172a',
  textMid: '#475569',
  textSoft: '#94a3b8',
};

/* ============================================================
   ADMIN SIDEBAR COMPONENT
   ============================================================ */

const AdminSidebar = ({ activeTab, onTabChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [managementExpanded, setManagementExpanded] = useState(true);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

  // Management sub-items (these are tabs, not routes)
  const managementSubItems = [
    { key: 'managers', label: 'Managers', icon: Users },
    { key: 'orgs', label: 'Organizations', icon: Building2 },
    { key: 'venues', label: 'Venues', icon: MapPin },
    { key: 'devices', label: 'Devices', icon: Cpu },
  ];

  // Top-level navigation items (these are routes)
  const topLevelItems = [
    { key: 'ota', label: 'OTA Management', route: '/admin/management/ota', icon: Settings },
    { key: 'plans', label: 'Plan Management', route: '/admin/management/plans', icon: Activity },
  ];

  const handleConfirmLogout = async () => {
    try {
      setLoading(true);
      await dispatch(logoutUser()).unwrap();
      await persistor.purge();
      navigate('/login');
    } catch (error) {
      await persistor.purge();
      navigate('/login');
    } finally {
      setLoading(false);
      setLogoutOpen(false);
    }
  };

  // Check if we're on the admin management home page
  const isManagementPage = location.pathname === '/admin/management';
  const currentRoute = location.pathname;

  // Handle navigation item click (for mobile drawer)
  const handleNavClick = (callback) => {
    callback();
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  // Sidebar content component (shared between desktop and mobile drawer)
  const SidebarContent = () => (
    <>
      {/* Nav items */}
      <nav style={{ padding: '12px 10px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: C.textSoft, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 8px 8px' }}>
          Platform
        </div>

        {/* Management Section - Expandable */}
        <div style={{ marginBottom: 4 }}>
          <button
            onClick={() => {
              // Just toggle expansion, don't close drawer or navigate
              setManagementExpanded(!managementExpanded);
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              background: isManagementPage && !managementExpanded ? C.accentSoft : 'transparent',
              color: isManagementPage && !managementExpanded ? C.accent : C.textMid,
              fontWeight: isManagementPage && !managementExpanded ? 600 : 500,
              fontSize: 13,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              if (!(isManagementPage && !managementExpanded)) {
                e.currentTarget.style.background = C.surfaceHov;
              }
            }}
            onMouseLeave={e => {
              if (!(isManagementPage && !managementExpanded)) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <Activity size={16} />
            <span style={{ flex: 1, textAlign: 'left' }}>Management</span>
            {managementExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {/* Sub-items */}
          {managementExpanded && (
            <div style={{ paddingLeft: 8, marginTop: 4 }}>
              {managementSubItems.map(({ key, label, icon: Icon }) => {
                const isActive = isManagementPage && activeTab === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleNavClick(() => {
                      navigate('/admin/management');
                      onTabChange(key);
                    })}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '7px 10px 7px 20px',
                      borderRadius: 8,
                      border: 'none',
                      cursor: 'pointer',
                      marginBottom: 2,
                      background: isActive ? C.accentSoft : 'transparent',
                      color: isActive ? C.accent : C.textMid,
                      fontWeight: isActive ? 600 : 400,
                      fontSize: 13,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) e.currentTarget.style.background = C.surfaceHov;
                    }}
                    onMouseLeave={e => {
                      if (!isActive) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <Icon size={15} />
                    <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Top-level route items */}
        {topLevelItems.map(({ key, label, route, icon: Icon }) => {
          const isActive = currentRoute === route;
          return (
            <NavLink
              key={key}
              to={route}
              onClick={() => isMobile && setDrawerOpen(false)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 8,
                marginBottom: 2,
                background: isActive ? C.accentSoft : 'transparent',
                color: isActive ? C.accent : C.textMid,
                fontWeight: isActive ? 600 : 400,
                fontSize: 13,
                transition: 'all 0.15s',
                textDecoration: 'none',
              }}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.background = C.surfaceHov;
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <Icon size={16} />
              <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom admin card */}
      <div style={{
        padding: '12px 16px',
        borderTop: `1px solid ${C.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: C.accent + '18',
          color: C.accent,
          border: `1.5px solid ${C.accent}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 600,
          flexShrink: 0,
        }}>
          SA
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>Super Admin</div>
          <div style={{ fontSize: 10, color: C.textSoft }}>admin@iotify.io</div>
        </div>
        <button
          onClick={() => {
            setLogoutOpen(true);
            if (isMobile) setDrawerOpen(false);
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 6,
          }}
          onMouseEnter={e => e.currentTarget.style.background = C.surfaceHov}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <LogOut size={15} color={C.textSoft} />
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside style={{
          width: 240,
          flexShrink: 0,
          background: C.surface,
          borderRight: `1px solid ${C.border}`,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
        }}>
          {/* Logo */}
          <div style={{
            padding: '20px 20px 16px',
            borderBottom: `1px solid ${C.border}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: C.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Activity size={18} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: '-0.02em' }}>IOTIFY</div>
                <div style={{ fontSize: 10, color: C.textSoft, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Admin console</div>
              </div>
            </div>
          </div>

          <SidebarContent />
        </aside>
      )}

      {/* Mobile Top Bar */}
      {isMobile && (
        <div style={{
          width: '100%',
          background: C.surface,
          borderBottom: `1px solid ${C.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: C.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Activity size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: '-0.02em' }}>IOTIFY</div>
              <div style={{ fontSize: 10, color: C.textSoft, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Admin console</div>
            </div>
          </div>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setDrawerOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
            }}
            onMouseEnter={e => e.currentTarget.style.background = C.surfaceHov}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
            aria-label="Open menu"
          >
            <Menu size={24} color={C.text} />
          </button>
        </div>
      )}

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            background: C.surface,
          },
        }}
      >
        <Box
          sx={{ width: 250, height: '100%', display: 'flex', flexDirection: 'column', background: C.surface }}
        >
          {/* Drawer Header */}
          <div style={{
            padding: '20px 20px 16px',
            borderBottom: `1px solid ${C.border}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: C.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Activity size={18} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: '-0.02em' }}>IOTIFY</div>
                <div style={{ fontSize: 10, color: C.textSoft, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Admin console</div>
              </div>
            </div>
          </div>

          <SidebarContent />
        </Box>
      </Drawer>

      <LogoutDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleConfirmLogout}
        loading={loading}
        title="Confirm sign out"
        description="You are about to sign out. Are you sure you want to continue?"
      />
    </>
  );
};

export default AdminSidebar;
