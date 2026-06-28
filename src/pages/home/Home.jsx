import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// ─── tiny hook: scroll position ───────────────────────────────────────────────
const useScrollY = () => {
  const [y, setY] = useState(0);
  useEffect(() => {
    const fn = () => setY(window.scrollY);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return y;
};

// ─── design tokens (aligned with manager/user dashboard) ─────────────────────
const T = {
  primary:       '#0D5CA4',
  primaryDark:   '#07518D',
  primaryHover:  '#0b4e8a',
  primaryTint:   '#07518D12',
  primaryBorder: 'rgba(7, 81, 141, 0.22)',
  pageBg:        '#F5F6FA',
  panelBg:       '#07518D12',
  white:         '#ffffff',
  slate900:      '#0f172a',
  slate700:      '#334155',
  slate500:      '#64748b',
  slate200:      '#e2e8f0',
  slate100:      '#f1f5f9',
  rose:          '#EF4444',
  roseBg:        '#FEE2E2',
};

// ─── shared styles ─────────────────────────────────────────────────────────────
const btn = {
  primary: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: T.primary, color: '#fff', fontWeight: 600,
    fontSize: 15, padding: '12px 28px', borderRadius: 10,
    border: 'none', cursor: 'pointer', textDecoration: 'none',
    transition: 'background .18s, transform .14s',
  },
  outline: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: 'transparent', color: T.primary, fontWeight: 600,
    fontSize: 15, padding: '11px 26px', borderRadius: 10,
    border: `1.5px solid ${T.primary}`, cursor: 'pointer',
    textDecoration: 'none', transition: 'background .18s, color .18s',
  },
  ghost: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: 'transparent', color: T.slate700, fontWeight: 500,
    fontSize: 15, padding: '10px 20px', borderRadius: 10,
    border: 'none', cursor: 'pointer', textDecoration: 'none',
    transition: 'color .15s',
  },
};

// ─── icons (inline svg, no extra deps) ────────────────────────────────────────
const Icon = ({ name, size = 20, color = 'currentColor' }) => {
  const paths = {
    wifi:        'M1 6.5C7.1 0.8 16.9 0.8 23 6.5M5 10.5C9.1 6.8 14.9 6.8 19 10.5M9 14.5c1.9-1.7 5.1-1.7 7 0M12 18h.01',
    cpu:         'M9 3H5a2 2 0 0 0-2 2v4m6-6h6m-6 0v18m6-18h4a2 2 0 0 1 2 2v4m-6-6v18M3 9v6m18-6v6M3 15h6m12 0h-6M9 21H5a2 2 0 0 1-2-2v-4m6 6h6m-6 0V3m6 18h4a2 2 0 0 0 2-2v-4m-6 6V3',
    bar:         'M3 3v18h18M7 16v-5M11 16v-9M15 16v-3',
    bell:        'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
    shield:      'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    zap:         'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    check:       'M20 6L9 17l-5-5',
    arrowRight:  'M5 12h14M12 5l7 7-7 7',
    building:    'M3 21h18M3 7v14M21 7v14M9 21V7M15 21V7M3 7l9-4 9 4',
    thermometer: 'M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z',
    wind:        'M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2M9.6 4.6A2 2 0 1 1 11 8H2M12.6 19.4A2 2 0 1 0 14 16H2',
    plug:        'M12 22V12M12 12L8 8m4 4l4-4M8 2v4m8-4v4M2 10h20',
    users:       'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    globe:       'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
    menu:        'M3 12h18M3 6h18M3 18h18',
    x:           'M18 6L6 18M6 6l12 12',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      {paths[name] && <path d={paths[name]} />}
    </svg>
  );
};

// ─── HEADER ────────────────────────────────────────────────────────────────────
const Header = () => {
  const scrollY = useScrollY();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const elevated = scrollY > 20;

  const dashRoute = user?.role === 'admin' ? '/admin/management' : '/management';

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: elevated ? 'rgba(255,255,255,0.96)' : 'transparent',
      backdropFilter: elevated ? 'blur(12px)' : 'none',
      borderBottom: elevated ? `1px solid ${T.slate200}` : '1px solid transparent',
      transition: 'background .25s, border-color .25s, box-shadow .25s',
      boxShadow: elevated ? '0 1px 16px rgba(0,0,0,0.06)' : 'none',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 24px',
        height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <NavLink
  to="/"
  className="flex items-center gap-2.5 no-underline"
>
  {/* Mobile and small screens */}
  <img
    src="/logo-half.png"
    alt="IoTify"
    className="h-9 block md:hidden"
    onError={(e) => {
      e.target.style.display = "none";
    }}
  />

  {/* Medium screens and above */}
  <img
    src="/logo.png"
    alt="IoTify"
    className="h-9 hidden md:block"
    onError={(e) => {
      e.target.style.display = "none";
    }}
  />
</NavLink>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          <NavLink to="/select-plan" style={{ ...btn.ghost, fontSize: 14 }}>Plans</NavLink>
          <NavLink to="#features" style={{ ...btn.ghost, fontSize: 14 }}
            onClick={e => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}>
            Features
          </NavLink>
          <NavLink to="#how-it-works" style={{ ...btn.ghost, fontSize: 14 }}
            onClick={e => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}>
            How it works
          </NavLink>
        </nav>

        {/* CTA area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isAuthenticated ? (
            <button onClick={() => navigate(dashRoute)} style={{ ...btn.primary, fontSize: 14, padding: '9px 20px' }}>
              Dashboard <Icon name="arrowRight" size={15} color="#fff" />
            </button>
          ) : (
            <>
              <NavLink to="/login" style={{ ...btn.ghost, fontSize: 14 }}>Sign in</NavLink>
              <NavLink to="/login" state={{ register: true }} style={{ ...btn.primary, fontSize: 14, padding: '9px 20px' }}>
                Get started
              </NavLink>
            </>
          )}
          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            style={{ ...btn.ghost, padding: 8, display: 'none' }}
            className="hamburger"
            aria-label="Toggle menu"
          >
            <Icon name={mobileOpen ? 'x' : 'menu'} size={22} color={T.slate700} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{
          background: T.white, borderTop: `1px solid ${T.slate200}`,
          padding: '16px 24px 24px',
        }}>
          {[
            { label: 'Plans', to: '/select-plan' },
            { label: 'Features', to: '#features' },
            { label: 'How it works', to: '#how-it-works' },
          ].map(l => (
            <NavLink key={l.label} to={l.to}
              onClick={() => setMobileOpen(false)}
              style={{ display: 'block', padding: '12px 0', color: T.slate700, fontWeight: 500, textDecoration: 'none', borderBottom: `1px solid ${T.slate100}` }}>
              {l.label}
            </NavLink>
          ))}
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {isAuthenticated
              ? <button onClick={() => navigate(dashRoute)} style={btn.primary}>Dashboard</button>
              : <>
                  <NavLink to="/login" style={btn.outline}>Sign in</NavLink>
                  <NavLink to="/login" state={{ register: true }} style={btn.primary}>Get started</NavLink>
                </>
            }
          </div>
        </div>
      )}
    </header>
  );
};

// ─── HERO ──────────────────────────────────────────────────────────────────────
const Hero = () => {
  const navigate = useNavigate();
  const stats = [
    { val: '10k+', label: 'Active devices' },
    { val: '99.9%', label: 'Uptime SLA' },
    { val: '<1s', label: 'Live updates' },
    { val: '3 roles', label: 'Admin · Manager · User' },
  ];

  return (
    <section
      className="hero-section"
      style={{
        background: `linear-gradient(160deg, ${T.panelBg} 0%, ${T.white} 60%)`,
        paddingTop: 120,
        paddingBottom: 80,
        borderBottom: `1px solid ${T.slate200}`,
      }}
    >
      <div className="hero-inner">
        <div className="hero-grid">

          {/* Left */}
          <div className="hero-copy">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: T.primaryTint, color: T.primaryDark,
              fontSize: 13, fontWeight: 600, padding: '6px 14px', borderRadius: 20,
              border: `1px solid ${T.primaryBorder}`, marginBottom: 24,
            }}>
              <Icon name="wifi" size={14} color={T.primary} />
              IoT Management Platform
            </div>

            <h1 className="hero-title" style={{
              fontWeight: 800, lineHeight: 1.1,
              color: T.slate900, letterSpacing: '-1.5px', margin: '0 0 20px',
            }}>
              Monitor every{' '}
              <span style={{
                color: T.primary,
                borderBottom: `3px solid ${T.primaryBorder}`,
                paddingBottom: 2,
              }}>device</span>
              {' '}in real time
            </h1>

            <p style={{
              fontSize: 18, color: T.slate500, lineHeight: 1.65,
              margin: '0 0 36px', maxWidth: 480,
            }}>
              IoTify gives your team live sensor feeds, smart scheduling, trigger alerts,
              and energy dashboards — all in one platform built for AQI, odour, temperature,
              humidity, and more.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/select-plan')}
                style={btn.primary}
                onMouseEnter={e => e.currentTarget.style.background = T.primaryHover}
                onMouseLeave={e => e.currentTarget.style.background = T.primary}
              >
                View plans <Icon name="arrowRight" size={16} color="#fff" />
              </button>
              <button
                onClick={() => navigate('/login')}
                style={btn.outline}
                onMouseEnter={e => { e.currentTarget.style.background = T.primaryTint; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                Sign in
              </button>
            </div>

            {/* Stats row */}
            <div className="hero-stats">
              {stats.map((s, i) => (
                <div key={i} className="hero-stat-item">
                  <div style={{ fontSize: 26, fontWeight: 800, color: T.primary, letterSpacing: '-0.5px' }}>{s.val}</div>
                  <div style={{ fontSize: 12, color: T.slate500, marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: dashboard preview card */}
          <div className="hero-preview">
            <div className="hero-blob" />

            <div style={{
              position: 'relative', zIndex: 1,
              background: T.white, borderRadius: 20,
              border: `1px solid ${T.slate200}`,
              boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
              overflow: 'hidden',
            }}>
              {/* Fake topbar */}
              <div style={{
                background: T.panelBg, padding: '12px 18px',
                borderBottom: `1px solid ${T.slate200}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.slate700 }}>Live Dashboard — Ven1</span>
                <span style={{
                  background: T.primary, color: '#fff', fontSize: 11,
                  fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                }}>● LIVE</span>
              </div>

              {/* Mini device cards */}
              <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { name: 'TempMonitor', icon: 'thermometer', val: '0°C', sub: 'Humidity 0%', color: '#3b82f6', on: true },
                  { name: 'AQI Trigger', icon: 'wind', val: '--', sub: 'Unknown', color: '#f59e0b', on: false },
                  { name: 'EnergyMon', icon: 'zap', val: '0.00 W', sub: 'Voltage --V', color: T.primary, on: true },
                  { name: 'OdourSensor', icon: 'wifi', val: '86%', sub: 'Temp 33°C', color: '#8b5cf6', on: true },
                ].map((d, i) => (
                  <div key={i} style={{
                    background: T.pageBg, borderRadius: 12,
                    border: `1px solid ${T.slate200}`, padding: '12px 14px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: T.slate500, fontWeight: 500 }}>{d.name}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 6,
                        background: d.on ? '#dcfce7' : '#f1f5f9',
                        color: d.on ? '#16a34a' : T.slate500,
                      }}>{d.on ? 'ON' : 'OFF'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: `${d.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon name={d.icon} size={16} color={d.color} />
                      </div>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: T.slate900 }}>{d.val}</div>
                        <div style={{ fontSize: 11, color: T.slate500 }}>{d.sub}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Alert row */}
              <div style={{
                margin: '0 16px 16px',
                background: '#fefce8', border: '1px solid #fde68a',
                borderRadius: 10, padding: '10px 14px',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <Icon name="bell" size={14} color="#d97706" />
                <span style={{ fontSize: 12, color: '#92400e', fontWeight: 500 }}>
                  TriggerOdourDevice — Odour 86% detected
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

// ─── FEATURES ─────────────────────────────────────────────────────────────────
const Features = () => {
  const features = [
    {
      icon: 'thermometer', color: '#3b82f6',
      title: 'Temperature & Humidity',
      desc: 'Real-time readings from all sensors with threshold alerts and historical trends.',
    },
    {
      icon: 'wind', color: T.primary,
      title: 'AQI & Odour tracking',
      desc: 'Air quality index and odour percentage with colour-coded gauges and trigger logic.',
    },
    {
      icon: 'zap', color: '#f59e0b',
      title: 'Energy monitoring',
      desc: 'Track power (W), voltage (V), and ampere readings per device in live dashboards.',
    },
    {
      icon: 'bell', color: '#8b5cf6',
      title: 'Smart triggers & alerts',
      desc: 'Set threshold conditions that fire instant notifications or automated actions.',
    },
    {
      icon: 'cpu', color: '#ec4899',
      title: 'OTA firmware updates',
      desc: 'Push firmware to entire device fleets from the admin panel without touching hardware.',
    },
    {
      icon: 'bar', color: T.primaryDark,
      title: 'Scheduling engine',
      desc: 'Define recurring ON/OFF schedules per device with start/end times and weekday masks.',
    },
    {
      icon: 'shield', color: '#6366f1',
      title: 'Role-based access',
      desc: 'Admin, Manager, and User roles with granular view/manage permissions per organisation.',
    },
    {
      icon: 'globe', color: '#0ea5e9',
      title: 'Multi-org & venue',
      desc: 'Structure your fleet by organisation → venue → device with plan-level limits enforced.',
    },
  ];

  return (
    <section id="features" style={{ background: T.white, padding: '96px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: T.primaryTint, color: T.primaryDark,
            fontSize: 13, fontWeight: 600, padding: '5px 14px', borderRadius: 20,
            border: `1px solid ${T.primaryBorder}`, marginBottom: 16,
          }}>
            <Icon name="cpu" size={13} color={T.primary} /> Platform capabilities
          </div>
          <h2 style={{
            fontSize: 40, fontWeight: 800, color: T.slate900,
            letterSpacing: '-1px', margin: '0 0 16px',
          }}>
            Everything your team needs
          </h2>
          <p style={{ fontSize: 17, color: T.slate500, maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
            From sensor readings to firmware delivery — all the tools a facility manager needs in one place.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 20,
        }}>
          {features.map((f, i) => (
            <div key={i} style={{
              background: T.pageBg, borderRadius: 16,
              border: `1px solid ${T.slate200}`,
              padding: '24px 24px 28px',
              transition: 'box-shadow .2s, transform .2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${f.color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}>
                <Icon name={f.icon} size={20} color={f.color} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: T.slate900, margin: '0 0 8px' }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: T.slate500, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── HOW IT WORKS ──────────────────────────────────────────────────────────────
const HowItWorks = () => {
  const steps = [
    { icon: 'users', color: '#6366f1', title: 'Register & pick a plan', desc: 'Create your manager account and activate a subscription that fits your fleet size.' },
    { icon: 'building', color: T.primary, title: 'Set up org & venues', desc: 'Structure your deployment — organisations, venues, and assign devices to each location.' },
    { icon: 'cpu', color: '#f59e0b', title: 'Connect your devices', desc: 'Pair IoT hardware, configure categories (monitor / trigger / schedule), and go live.' },
    { icon: 'bar', color: '#ec4899', title: 'Monitor & act', desc: 'Watch live feeds, receive threshold alerts, push OTA updates, and export reports.' },
  ];

  return (
    <section id="how-it-works" style={{ background: T.panelBg, padding: '96px 24px', borderTop: `1px solid ${T.slate200}` }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: T.primaryTint, color: T.primaryDark,
            fontSize: 13, fontWeight: 600, padding: '5px 14px', borderRadius: 20,
            border: `1px solid ${T.primaryBorder}`, marginBottom: 16,
          }}>
            <Icon name="zap" size={13} color={T.primary} /> Getting started
          </div>
          <h2 style={{ fontSize: 40, fontWeight: 800, color: T.slate900, letterSpacing: '-1px', margin: '0 0 16px' }}>
            Up and running in minutes
          </h2>
          <p style={{ fontSize: 17, color: T.slate500, maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
            No hardware engineers needed. IoTify's guided setup gets your first device online fast.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 0 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ position: 'relative', padding: '0 24px 0 0' }}>
              {/* connector line */}
              {i < steps.length - 1 && (
                <div style={{
                  position: 'absolute', top: 28, right: 0,
                  width: '100%', height: 2,
                  background: `linear-gradient(90deg, ${s.color}40, ${steps[i+1].color}40)`,
                  zIndex: 0,
                }} />
              )}
              <div style={{
                background: T.white, borderRadius: 16,
                border: `1px solid ${T.slate200}`, padding: '24px 20px',
                position: 'relative', zIndex: 1,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: `${s.color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <Icon name={s.icon} size={22} color={s.color} />
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: s.color,
                  letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8,
                }}>Step {i + 1}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: T.slate900, margin: '0 0 8px' }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: T.slate500, lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── PRICING CTA ───────────────────────────────────────────────────────────────
const PricingCTA = () => {
  const navigate = useNavigate();
  return (
    <section style={{ background: T.white, padding: '96px 24px', borderTop: `1px solid ${T.slate200}` }}>
      <div style={{
        maxWidth: 780, margin: '0 auto', textAlign: 'center',
        background: `linear-gradient(135deg, ${T.primaryTint} 0%, rgba(7, 81, 141, 0.06) 100%)`,
        borderRadius: 24, border: `1px solid ${T.primaryBorder}`,
        padding: '64px 48px',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16, background: T.primary,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <Icon name="wifi" size={28} color="#fff" />
        </div>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: T.slate900, letterSpacing: '-1px', margin: '0 0 14px' }}>
          Ready to connect your fleet?
        </h2>
        <p style={{ fontSize: 17, color: T.slate500, lineHeight: 1.65, margin: '0 auto 36px', maxWidth: 480 }}>
          Pick a plan that scales with your device count. No hardware lock-in, cancel any time.
          Custom plans available on request.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/select-plan')}
            style={btn.primary}
            onMouseEnter={e => e.currentTarget.style.background = T.primaryHover}
            onMouseLeave={e => e.currentTarget.style.background = T.primary}
          >
            View pricing <Icon name="arrowRight" size={16} color="#fff" />
          </button>
          <button
            onClick={() => navigate('/login', { state: { register: true } })}
            style={btn.outline}
            onMouseEnter={e => e.currentTarget.style.background = T.primaryTint}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Create free account
          </button>
        </div>
      </div>
    </section>
  );
};

// ─── FOOTER ────────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer style={{
    background: T.slate900, color: '#94a3b8',
    padding: '48px 24px 32px',
    borderTop: `1px solid #1e293b`,
  }}>
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 32, marginBottom: 40 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <img src="/logo.png" alt="IoTify" style={{ height: 28, filter: 'brightness(100)' }} onError={e => e.target.style.display='none'} />
            {/* <span style={{ fontWeight: 700, fontSize: 18, color: '#fff' }}>IoTify</span> */}
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 240 }}>
            Real-time IoT management for facilities, energy, air quality, and more.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
          {[
            { title: 'Product', links: ['Features', 'Pricing', 'How it works'] },
            { title: 'Account', links: ['Sign in', 'Register', 'Select plan'] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: 13, marginBottom: 14 }}>{col.title}</div>
              {col.links.map(l => (
                <div key={l} style={{ fontSize: 14, marginBottom: 10, cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                >{l}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div style={{ borderTop: '1px solid #1e293b', paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: 13 }}>© {new Date().getFullYear()} IoTify. All rights reserved.</span>
        <span style={{ fontSize: 13 }}>Built for IoT facility managers.</span>
      </div>
    </div>
  </footer>
);

// ─── RESPONSIVE CSS ────────────────────────────────────────────────────────────
const ResponsiveStyle = () => (
  <style>{`
    .hero-section {
      width: 100%;
      max-width: 100vw;
      overflow-x: clip;
    }
    .hero-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      width: 100%;
      box-sizing: border-box;
    }
    .hero-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 64px;
      align-items: center;
      min-width: 0;
    }
    .hero-copy,
    .hero-preview {
      min-width: 0;
    }
    .hero-title {
      font-size: clamp(2rem, 5vw, 3.25rem);
    }
    .hero-stats {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 0;
      margin-top: 48px;
      border-top: 1px solid ${T.slate200};
      padding-top: 32px;
    }
    .hero-stat-item {
      min-width: 0;
      padding-right: 16px;
      padding-left: 16px;
      border-right: 1px solid ${T.slate200};
    }
    .hero-stat-item:first-child {
      padding-left: 0;
    }
    .hero-stat-item:last-child {
      padding-right: 0;
      border-right: none;
    }
    .hero-preview {
      position: relative;
      overflow: hidden;
    }
    .hero-blob {
      position: absolute;
      width: min(340px, 100%);
      height: min(340px, 100%);
      border-radius: 50%;
      background: radial-gradient(circle, rgba(13, 92, 164, 0.16) 0%, transparent 70%);
      top: -40px;
      right: 0;
      z-index: 0;
      pointer-events: none;
    }
    @media (max-width: 900px) {
      .desktop-nav { display: none !important; }
      .hamburger { display: flex !important; }
    }
    @media (max-width: 760px) {
      .hero-grid {
        grid-template-columns: 1fr;
        gap: 40px;
      }
      .hero-stats {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 20px 12px;
        padding-top: 24px;
        margin-top: 36px;
      }
      .hero-stat-item {
        border-right: none;
        padding-left: 0;
        padding-right: 0;
      }
      .hero-blob {
        top: -24px;
        width: 220px;
        height: 220px;
      }
      h2 { font-size: 28px !important; }
    }
  `}</style>
);

// ─── PAGE ──────────────────────────────────────────────────────────────────────
const HomePage = () => (
  <>
    <ResponsiveStyle />
    <Header />
    <main>
      <Hero />
      <Features />
      <HowItWorks />
      <PricingCTA />
    </main>
    <Footer />
  </>
);

export default HomePage;