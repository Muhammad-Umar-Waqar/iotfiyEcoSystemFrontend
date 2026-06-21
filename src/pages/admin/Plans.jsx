





import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllPlans, createPlan } from "../../slices/subscriptionSlice";
import {
  Plus, X, ChevronRight, Zap, Shield, Star, Gift,
  Building2, MapPin, Cpu, Users, Calendar, DollarSign,
  Send, CheckCircle2, AlertCircle, Clock, ArrowRight,
  Sparkles, Crown, Activity, MoreHorizontal,
} from "lucide-react";
import '../AdminDashboard/adminstyle.css'
import { useIsMobile } from "../../hooks/responsiveQuery";

/* ============================================================
   DESIGN TOKENS — matches AdminDashboard exactly
   ============================================================ */
const C = {
  accent:      "#4f46e5",
  accentMid:   "#6366f1",
  accentSoft:  "#eef2ff",
  accentBorder:"#c7d2fe",

  bg:          "#f8fafc",
  surface:     "#ffffff",
  surfaceHov:  "#f8fafc",

  border:      "#e2e8f0",
  borderMid:   "#cbd5e1",

  text:        "#0f172a",
  textMid:     "#475569",
  textSoft:    "#94a3b8",

  green:       "#10b981",
  greenSoft:   "#ecfdf5",
  greenBorder: "#a7f3d0",

  red:         "#ef4444",
  redSoft:     "#fef2f2",
  redBorder:   "#fecaca",

  amber:       "#f59e0b",
  amberSoft:   "#fffbeb",
  amberBorder: "#fde68a",

  blue:        "#3b82f6",
  blueSoft:    "#eff6ff",
  blueBorder:  "#bfdbfe",

  purple:      "#8b5cf6",
  purpleSoft:  "#f5f3ff",
  purpleBorder:"#ddd6fe",

  teal:        "#14b8a6",
  tealSoft:    "#f0fdfa",
  tealBorder:  "#99f6e4",
};

/* ============================================================
   MOCK DATA — REPLACED WITH REAL API DATA FROM REDUX
   ============================================================ */
// const MOCK_PLANS = [
//   {
//     _id: "6a3541beed12c7165c51275e",
//     name: "Free Plan",
//     type: "free",
//     description: "15-day free trial for new accounts",
//     price: 0,
//     durationDays: 15,
//     maxOrganizations: 1,
//     maxVenues: 2,
//     maxDevices: 5,
//     maxUsers: 3,
//     isActive: true,
//     isTrial: true,
//     isCustom: false,
//     assignedToEmail: null,
//     createdAt: "2026-06-19T13:18:54.119Z",
//   },
//   {
//     _id: "6a3541f2ed12c7165c512760",
//     name: "Basic Plan",
//     type: "basic",
//     description: "Great for small teams getting started",
//     price: 1499,
//     durationDays: 30,
//     maxOrganizations: 3,
//     maxVenues: 10,
//     maxDevices: 25,
//     maxUsers: 8,
//     isActive: true,
//     isTrial: false,
//     isCustom: false,
//     assignedToEmail: null,
//     createdAt: "2026-06-19T13:18:00.000Z",
//   },
//   {
//     _id: "6a3541f2ed12c7165c51275f",
//     name: "Premium Plan",
//     type: "premium",
//     description: "Premium subscription plan",
//     price: 4999,
//     durationDays: 30,
//     maxOrganizations: 10,
//     maxVenues: 50,
//     maxDevices: 100,
//     maxUsers: 25,
//     isActive: true,
//     isTrial: false,
//     isCustom: false,
//     assignedToEmail: null,
//     createdAt: "2026-06-19T13:19:46.357Z",
//   },
//   {
//     _id: "6a22d30f8a79fa25e1f978f9",
//     name: "custom faraz test",
//     type: "custom",
//     description: null,
//     price: 100,
//     durationDays: 93,
//     maxOrganizations: 2,
//     maxVenues: 8,
//     maxDevices: 16,
//     maxUsers: 10,
//     isActive: true,
//     isTrial: false,
//     isCustom: true,
//     assignedToEmail: "farazthedev@gmail.com",
//     createdAt: "2026-06-05T13:45:51.233Z",
//   },
// ];

/* ============================================================
   UTILITIES
   ============================================================ */
function planVisuals(type) {
  switch (type) {
    case "free":
      return { icon: Gift,   color: C.teal,   soft: C.tealSoft,   border: C.tealBorder,   label: "Free",      ring: "#14b8a6" };
    case "basic":
      return { icon: Shield, color: C.blue,   soft: C.blueSoft,   border: C.blueBorder,   label: "Basic",     ring: "#3b82f6" };
    case "premium":
      return { icon: Crown,  color: C.purple, soft: C.purpleSoft, border: C.purpleBorder, label: "Premium",   ring: "#8b5cf6" };
    case "custom":
      return { icon: Sparkles, color: C.amber, soft: C.amberSoft, border: C.amberBorder, label: "Custom",    ring: "#f59e0b" };
    default:
      return { icon: Star,   color: C.accent, soft: C.accentSoft, border: C.accentBorder, label: type,       ring: C.accent  };
  }
}

function formatPrice(price) {
  if (price === 0) return "Free";
  return `PKR ${price.toLocaleString()}`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function Badge({ label, bg, color, border }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 8px", borderRadius: 6,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
      background: bg, color, border: `1px solid ${border}`,
      whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

/* ============================================================
   PLAN CARD
   ============================================================ */
function PlanCard({ plan, onAssign }) {
  const v = planVisuals(plan.type);
  const Icon = v.icon;
  const isCustom = plan.isCustom;
  const isFree = plan.isTrial;

  const limits = [
    { icon: Building2, label: "Orgs",    value: plan.maxOrganizations },
    { icon: MapPin,    label: "Venues",  value: plan.maxVenues        },
    { icon: Cpu,       label: "Devices", value: plan.maxDevices       },
    { icon: Users,     label: "Users",   value: plan.maxUsers         },
  ];

  return (
    <div
      className="group relative flex flex-col rounded-2xl border bg-white transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
      style={{ borderColor: C.border, overflow: "hidden" }}
    >
      {/* Top accent bar */}
      <div style={{ height: 3, background: v.color, flexShrink: 0 }} />

      <div className="flex flex-col flex-1 p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-xl shrink-0"
              style={{ width: 40, height: 40, background: v.soft, border: `1px solid ${v.border}` }}
            >
              <Icon size={18} color={v.color} />
            </div>
            <div>
              <h3 className="text-sm font-semibold leading-tight" style={{ color: C.text }}>
                {plan.name}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: C.textSoft }}>
                {plan.description || (isCustom ? `Assigned to ${plan.assignedToEmail}` : "Standard plan")}
              </p>
            </div>
          </div>
          <Badge
            label={v.label}
            bg={v.soft}
            color={v.color}
            border={v.border}
          />
        </div>

        {/* Price + duration */}
        <div
          className="flex items-end justify-between rounded-xl px-4 py-3 mb-4"
          style={{ background: C.bg, border: `1px solid ${C.border}` }}
        >
          <div>
            <div className="text-xs font-medium mb-0.5" style={{ color: C.textSoft }}>Price</div>
            <div className="text-xl font-bold tracking-tight" style={{ color: isFree ? C.teal : C.text }}>
              {formatPrice(plan.price)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium mb-0.5" style={{ color: C.textSoft }}>Duration</div>
            <div className="flex items-center gap-1">
              <Calendar size={12} color={C.textSoft} />
              <span className="text-sm font-semibold" style={{ color: C.text }}>
                {plan.durationDays} days
              </span>
            </div>
          </div>
        </div>

        {/* Limits grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {limits.map(({ icon: LimitIcon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ background: C.bg, border: `1px solid ${C.border}` }}
            >
              <LimitIcon size={13} color={C.textSoft} />
              <div>
                <div className="text-xs" style={{ color: C.textSoft }}>{label}</div>
                <div className="text-sm font-semibold" style={{ color: C.text }}>{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Assigned email (custom plans) */}
        {isCustom && plan.assignedToEmail && (
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2 mb-4"
            style={{ background: C.amberSoft, border: `1px solid ${C.amberBorder}` }}
          >
            <Users size={12} color={C.amber} />
            <span className="text-xs font-medium" style={{ color: "#92400e" }}>
              {plan.assignedToEmail}
            </span>
          </div>
        )}

        <div className="flex-1" />

        {/* Footer */}
        <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
          <span className="text-xs" style={{ color: C.textSoft }}>
            Created {formatDate(plan.createdAt)}
          </span>
          {!isCustom && (
            <button
              onClick={() => onAssign(plan)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-80"
              style={{ background: C.accentSoft, color: C.accent, border: `1px solid ${C.accentBorder}` }}
            >
              <Send size={11} />
              Assign
            </button>
          )}
          {isCustom && (
            <Badge label="Auto-assigned" bg={C.amberSoft} color="#92400e" border={C.amberBorder} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CREATE PLAN DRAWER
   ============================================================ */
const PLAN_TYPES = [
  { value: "free",     label: "Free",     icon: Gift,     desc: "Trial plan (15 days fixed)" },
  { value: "basic",    label: "Basic",    icon: Shield,   desc: "Entry-level paid plan"       },
  { value: "premium",  label: "Premium",  icon: Crown,    desc: "Full-featured plan"          },
  { value: "custom",   label: "Custom",   icon: Sparkles, desc: "Assigned to specific user"   },
];

const INITIAL_FORM = {
  name: "", type: "basic", description: "", price: "",
  durationDays: "", maxOrganizations: "", maxVenues: "",
  maxDevices: "", maxUsers: "", assignedToEmail: "",
};

function CreatePlanDrawer({ onClose, onCreated }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const isFree   = form.type === "free";
  const isCustom = form.type === "custom";

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim())           e.name = "Plan name is required";
    if (!isFree && form.price === "") e.price = "Price is required";
    if (!isFree && !form.durationDays) e.durationDays = "Duration is required";
    if (!form.maxOrganizations)       e.maxOrganizations = "Required";
    if (!form.maxVenues)              e.maxVenues = "Required";
    if (!form.maxDevices)             e.maxDevices = "Required";
    if (!form.maxUsers)               e.maxUsers = "Required";
    if (isCustom && !form.assignedToEmail.trim()) e.assignedToEmail = "Email is required for custom plans";
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);

    // Construct payload
    const payload = {
      name: form.name.trim(),
      type: form.type,
      description: form.description.trim() || undefined,
      price: isFree ? 0 : Number(form.price),
      durationDays: isFree ? 15 : Number(form.durationDays),
      maxOrganizations: Number(form.maxOrganizations),
      maxVenues: Number(form.maxVenues),
      maxDevices: Number(form.maxDevices),
      maxUsers: Number(form.maxUsers),
    };

    // Add assignedToEmail only for custom plans
    if (isCustom && form.assignedToEmail.trim()) {
      payload.assignedToEmail = form.assignedToEmail.trim();
    }

    try {
      await dispatch(createPlan(payload)).unwrap();
      setSaving(false);
      onCreated();
      onClose();
    } catch (error) {
      setSaving(false);
      // Handle validation errors from API
      if (error.errors && Array.isArray(error.errors)) {
        const apiErrors = {};
        error.errors.forEach(err => {
          apiErrors[err.field] = err.message;
        });
        setErrors(apiErrors);
      } else {
        // General error
        setErrors({ general: error.message || "Failed to create plan" });
      }
    }
  }

  const inputStyle = (field) => ({
    width: "100%",
    padding: "8px 12px",
    border: `1px solid ${errors[field] ? C.red : C.border}`,
    borderRadius: 8,
    fontSize: 13,
    color: C.text,
    background: C.surface,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  });

  const labelStyle = { display: "block", fontSize: 11, fontWeight: 600, color: C.textMid, marginBottom: 5, letterSpacing: "0.02em" };
  const IsMobile = useIsMobile();
  
  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end  `}
      style={{ background: "rgba(15,23,42,0.45)" }}
      onClick={onClose}
    >
      <div
        className={`h-full overflow-y-auto flex flex-col  ${IsMobile && "pt-15" }`}
        style={{ width: "100%", maxWidth: 480, background: C.surface, boxShadow: "-8px 0 40px rgba(0,0,0,0.12)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 sticky top-0 z-10"
          style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}
        >
          <div>
            <h2 className="text-base font-semibold" style={{ color: C.text }}>Create new plan</h2>
            <p className="text-xs mt-0.5" style={{ color: C.textSoft }}>Fill in the details below</p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-lg transition-colors hover:bg-slate-50"
            style={{ width: 32, height: 32, border: `1px solid ${C.border}`, background: C.bg }}
          >
            <X size={15} color={C.textMid} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-5 space-y-5">

          {/* General error message */}
          {errors.general && (
            <div
              className="flex items-start gap-3 rounded-xl p-3"
              style={{ background: C.redSoft, border: `1px solid ${C.redBorder}` }}
            >
              <AlertCircle size={16} color={C.red} style={{ marginTop: 1, flexShrink: 0 }} />
              <div>
                <p className="text-xs font-semibold" style={{ color: C.red }}>Error</p>
                <p className="text-xs mt-0.5" style={{ color: "#991b1b" }}>{errors.general}</p>
              </div>
            </div>
          )}

          {/* Plan type selector */}
          <div>
            <label style={labelStyle}>PLAN TYPE</label>
            <div className="grid grid-cols-2 gap-2">
              {PLAN_TYPES.map(({ value, label, icon: Icon, desc }) => {
                const v = planVisuals(value);
                const active = form.type === value;
                return (
                  <button
                    key={value}
                    onClick={() => set("type", value)}
                    className="text-left rounded-xl p-3 transition-all"
                    style={{
                      border: `1.5px solid ${active ? v.color : C.border}`,
                      background: active ? v.soft : C.bg,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={13} color={active ? v.color : C.textSoft} />
                      <span className="text-xs font-semibold" style={{ color: active ? v.color : C.textMid }}>{label}</span>
                    </div>
                    <p className="text-xs" style={{ color: C.textSoft }}>{desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name */}
          <div>
            <label style={labelStyle}>PLAN NAME</label>
            <input
              value={form.name}
              onChange={e => set("name", e.target.value)}
              placeholder="e.g. Pro Monthly"
              style={inputStyle("name")}
            />
            {errors.name && <p className="text-xs mt-1" style={{ color: C.red }}>{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>DESCRIPTION <span style={{ color: C.textSoft, fontWeight: 400 }}>(optional)</span></label>
            <textarea
              value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="Brief description of this plan..."
              rows={2}
              style={{ ...inputStyle("description"), resize: "vertical", lineHeight: 1.5 }}
            />
          </div>

          {/* Price + Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>PRICE (PKR)</label>
              {isFree ? (
                <div
                  className="flex items-center rounded-lg px-3 py-2"
                  style={{ border: `1px solid ${C.border}`, background: C.bg, height: 36 }}
                >
                  <span className="text-sm font-semibold" style={{ color: C.teal }}>Free</span>
                </div>
              ) : (
                <>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => set("price", e.target.value)}
                    placeholder="0"
                    style={inputStyle("price")}
                  />
                  {errors.price && <p className="text-xs mt-1" style={{ color: C.red }}>{errors.price}</p>}
                </>
              )}
            </div>
            <div>
              <label style={labelStyle}>DURATION (DAYS)</label>
              {isFree ? (
                <div
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2"
                  style={{ border: `1px solid ${C.border}`, background: C.bg, height: 36 }}
                >
                  <Calendar size={12} color={C.textSoft} />
                  <span className="text-sm font-semibold" style={{ color: C.text }}>15 (fixed)</span>
                </div>
              ) : (
                <>
                  <input
                    type="number"
                    value={form.durationDays}
                    onChange={e => set("durationDays", e.target.value)}
                    placeholder="30"
                    style={inputStyle("durationDays")}
                  />
                  {errors.durationDays && <p className="text-xs mt-1" style={{ color: C.red }}>{errors.durationDays}</p>}
                </>
              )}
            </div>
          </div>

          {/* Limits */}
          <div>
            <label style={labelStyle}>PLAN LIMITS</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { field: "maxOrganizations", label: "Max organizations", icon: Building2 },
                { field: "maxVenues",        label: "Max venues",        icon: MapPin    },
                { field: "maxDevices",       label: "Max devices",       icon: Cpu       },
                { field: "maxUsers",         label: "Max users",         icon: Users     },
              ].map(({ field, label, icon: Icon }) => (
                <div key={field}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icon size={11} color={C.textSoft} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: C.textSoft, letterSpacing: "0.03em" }}>
                      {label.toUpperCase()}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={form[field]}
                    onChange={e => set(field, e.target.value)}
                    placeholder="0"
                    style={inputStyle(field)}
                  />
                  {errors[field] && <p className="text-xs mt-1" style={{ color: C.red }}>{errors[field]}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Assigned email (custom only) */}
          {isCustom && (
            <div>
              <label style={labelStyle}>ASSIGN TO EMAIL</label>
              <input
                type="email"
                value={form.assignedToEmail}
                onChange={e => set("assignedToEmail", e.target.value)}
                placeholder="user@example.com"
                style={inputStyle("assignedToEmail")}
              />
              {errors.assignedToEmail && (
                <p className="text-xs mt-1" style={{ color: C.red }}>{errors.assignedToEmail}</p>
              )}
              <p className="text-xs mt-1.5" style={{ color: C.textSoft }}>
                A subscription will be auto-created and assigned to this email.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex gap-3 sticky bottom-0"
          style={{ borderTop: `1px solid ${C.border}`, background: C.surface }}
        >
          <button
            onClick={onClose}
            className="flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors hover:bg-slate-50"
            style={{ border: `1px solid ${C.border}`, color: C.textMid, background: C.bg }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: C.accent, color: "#fff", border: "none" }}
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus size={14} />
                Create plan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ASSIGN PLAN MODAL
   ============================================================ */
function AssignPlanModal({ plan, onClose, onAssigned }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const v = planVisuals(plan.type);

  async function handleAssign() {
    if (!email.trim() || !email.includes("@")) {
      setError("Enter a valid email address");
      return;
    }
    setSending(true);

    /* ── Real API call ──────────────────────────────────────
       POST ${import.meta.env.VITE_API_URL}/subscription/create-plan
       Body: { type: "custom", name: `Custom - ${email}`, ...plan limits,
               assignedToEmail: email, price: plan.price,
               durationDays: plan.durationDays }
       Headers: { Authorization: `Bearer ${user?.token}` }
    ─────────────────────────────────────────────────────── */

    await new Promise(r => setTimeout(r, 800));
    setSending(false);
    setSuccess(true);
    setTimeout(() => { onAssigned(); onClose(); }, 1200);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.45)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl"
        style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
        onClick={e => e.stopPropagation()}
      >
        {success ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div
              className="flex items-center justify-center rounded-full mb-4"
              style={{ width: 52, height: 52, background: C.greenSoft, border: `1px solid ${C.greenBorder}` }}
            >
              <CheckCircle2 size={24} color={C.green} />
            </div>
            <h3 className="text-base font-semibold mb-1" style={{ color: C.text }}>Plan assigned!</h3>
            <p className="text-sm" style={{ color: C.textSoft }}>
              <strong style={{ color: C.text }}>{plan.name}</strong> has been assigned to <strong style={{ color: C.text }}>{email}</strong>
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-5" style={{ borderBottom: `1px solid ${C.border}` }}>
              <h3 className="text-base font-semibold" style={{ color: C.text }}>Assign plan</h3>
              <button
                onClick={onClose}
                className="flex items-center justify-center rounded-lg"
                style={{ width: 28, height: 28, background: C.bg, border: `1px solid ${C.border}` }}
              >
                <X size={13} color={C.textMid} />
              </button>
            </div>

            {/* Plan preview */}
            <div className="p-5" style={{ borderBottom: `1px solid ${C.border}` }}>
              <div
                className="flex items-center gap-3 rounded-xl p-3"
                style={{ background: v.soft, border: `1px solid ${v.border}` }}
              >
                <div
                  className="flex items-center justify-center rounded-xl shrink-0"
                  style={{ width: 38, height: 38, background: C.surface, border: `1px solid ${v.border}` }}
                >
                  {React.createElement(v.icon, { size: 17, color: v.color })}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: C.text }}>{plan.name}</div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs" style={{ color: C.textSoft }}>
                      {formatPrice(plan.price)} · {plan.durationDays} days
                    </span>
                  </div>
                </div>
                <Badge label={v.label} bg={v.soft} color={v.color} border={v.border} />
              </div>

              {/* Limit chips */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {[
                  { icon: Building2, label: `${plan.maxOrganizations} orgs`    },
                  { icon: MapPin,    label: `${plan.maxVenues} venues`         },
                  { icon: Cpu,       label: `${plan.maxDevices} devices`       },
                  { icon: Users,     label: `${plan.maxUsers} users`           },
                ].map(({ icon: I, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-1 rounded-lg px-2 py-1"
                    style={{ background: C.bg, border: `1px solid ${C.border}` }}
                  >
                    <I size={10} color={C.textSoft} />
                    <span className="text-xs" style={{ color: C.textMid }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Email input */}
            <div className="p-5">
              <label className="block text-xs font-semibold mb-2" style={{ color: C.textMid, letterSpacing: "0.03em" }}>
                ASSIGN TO USER
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                placeholder="user@example.com"
                className="w-full text-sm rounded-lg px-3 py-2.5 outline-none transition-colors"
                style={{
                  border: `1px solid ${error ? C.red : C.border}`,
                  color: C.text, background: C.bg,
                }}
                onKeyDown={e => e.key === "Enter" && handleAssign()}
              />
              {error && <p className="text-xs mt-1.5" style={{ color: C.red }}>{error}</p>}
              <p className="text-xs mt-2" style={{ color: C.textSoft }}>
                A subscription will be created and linked to this user's account.
              </p>

              <div className="flex gap-2.5 mt-4">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-lg py-2.5 text-sm font-medium"
                  style={{ border: `1px solid ${C.border}`, color: C.textMid, background: C.bg }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={sending}
                  className="flex-1 rounded-lg py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: C.accent, color: "#fff", border: "none" }}
                >
                  {sending ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <Send size={13} />
                      Assign plan
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   FILTER TABS
   ============================================================ */
const FILTERS = [
  { key: "all",     label: "All plans" },
  { key: "free",    label: "Free"      },
  { key: "basic",   label: "Basic"     },
  { key: "premium", label: "Premium"   },
  { key: "custom",  label: "Custom"    },
];

/* ============================================================
   STAT CARD
   ============================================================ */
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl p-4"
      style={{ background: C.surface, border: `1px solid ${C.border}` }}
    >
      <div
        className="flex items-center justify-center rounded-xl shrink-0"
        style={{ width: 38, height: 38, background: color + "18" }}
      >
        <Icon size={16} color={color} />
      </div>
      <div>
        <div className="text-xs font-medium" style={{ color: C.textSoft }}>{label}</div>
        <div className="text-xl font-bold tracking-tight mt-0.5" style={{ color: C.text }}>{value}</div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN PAGE
   ============================================================ */
export default function Plans() {
  const dispatch = useDispatch();
  const { plans, plansLoading, plansError } = useSelector((state) => state.subscription);

  const [filter, setFilter]           = useState("all");
  const [showCreate, setShowCreate]   = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);
  const [toast, setToast]             = useState(null);

  // Fetch plans on component mount
  useEffect(() => {
    dispatch(getAllPlans());
  }, [dispatch]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const filtered = filter === "all" ? plans : plans.filter(p => p.type === filter);

  const counts = {
    total:   plans.length,
    free:    plans.filter(p => p.isTrial).length,
    paid:    plans.filter(p => !p.isTrial && !p.isCustom).length,
    custom:  plans.filter(p => p.isCustom).length,
  };

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ background: C.bg }}>
      <div className="max-w-6xl mx-auto">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
          <div>
            <h1 className="text-xl font-semibold tracking-tight" style={{ color: C.text }}>
              Plan management
            </h1>
            <p className="text-sm mt-1" style={{ color: C.textSoft }}>
              Create, view, and assign subscription plans to users
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-90 shadow-sm shrink-0"
            style={{ background: C.accent, color: "#fff", border: "none" }}
          >
            <Plus size={15} />
            Create plan
          </button>
        </div>

        {/* Loading State */}
        {plansLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mb-4" style={{ borderColor: C.accent, borderTopColor: 'transparent' }}></div>
            <p className="text-sm font-medium" style={{ color: C.textMid }}>Loading plans...</p>
          </div>
        )}

        {/* Error State */}
        {plansError && !plansLoading && (
          <div
            className="flex flex-col items-center justify-center rounded-2xl py-16"
            style={{ background: C.surface, border: `1px solid ${C.redBorder}` }}
          >
            <div
              className="flex items-center justify-center rounded-full mb-4"
              style={{ width: 52, height: 52, background: C.redSoft, border: `1px solid ${C.redBorder}` }}
            >
              <AlertCircle size={22} color={C.red} />
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: C.text }}>Failed to load plans</p>
            <p className="text-xs mb-4" style={{ color: C.textSoft }}>{plansError}</p>
            <button
              onClick={() => dispatch(getAllPlans())}
              className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold"
              style={{ background: C.accentSoft, color: C.accent, border: `1px solid ${C.accentBorder}` }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Success State - Show plans */}
        {!plansLoading && !plansError && (
          <>
            {/* ── Stats strip ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-7">
              <StatCard icon={Activity}  label="Total plans"   value={counts.total}  color={C.accent} />
              <StatCard icon={Gift}      label="Free / Trial"  value={counts.free}   color={C.teal}   />
              <StatCard icon={Crown}     label="Paid plans"    value={counts.paid}   color={C.purple} />
              <StatCard icon={Sparkles}  label="Custom plans"  value={counts.custom} color={C.amber}  />
            </div>


                    {/* Wrapper */}
            <div className="w-full  tabScroll overflow-x-auto mb-6">
              {/* Filter tabs */}
              <div
                className="flex gap-1.5 p-1 rounded-xl min-w-max"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                {FILTERS.map(({ key, label }) => {
                  const active = filter === key;

                  return (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className="cursor-pointer shrink-0 rounded-lg px-4 py-1.5 text-sm font-medium transition-all"
                      style={{
                        background: active ? C.accent : "transparent",
                        color: active ? "#fff" : C.textMid,
                        border: "none",
                        fontWeight: active ? 600 : 400,
                      }}
                    >
                      {label}

                      {key !== "all" && (
                        <span
                          className="ml-1.5 rounded-full px-1.5 py-0.5 text-xs"
                          style={{
                            background: active
                              ? "rgba(255,255,255,0.25)"
                              : C.bg,
                            color: active ? "#fff" : C.textSoft,
                          }}
                        >
                          {
                            plans.filter(p =>
                              key === "custom"
                                ? p.isCustom
                                : p.type === key
                            ).length
                          }
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Plan cards grid ── */}
            {filtered.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center rounded-2xl py-16"
                style={{ background: C.surface, border: `1px solid ${C.border}` }}
              >
                <div
                  className="flex items-center justify-center rounded-full mb-4"
                  style={{ width: 52, height: 52, background: C.accentSoft, border: `1px solid ${C.accentBorder}` }}
                >
                  <Star size={22} color={C.accent} />
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: C.text }}>No plans found</p>
                <p className="text-xs mb-4" style={{ color: C.textSoft }}>No {filter} plans exist yet</p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold"
                  style={{ background: C.accentSoft, color: C.accent, border: `1px solid ${C.accentBorder}` }}
                >
                  <Plus size={13} />
                  Create one
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(plan => (
                  <PlanCard
                    key={plan._id}
                    plan={plan}
                    onAssign={setAssignTarget}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Drawers & modals ── */}
      {showCreate && (
        <CreatePlanDrawer
          onClose={() => setShowCreate(false)}
          onCreated={() => showToast("Plan created successfully")}
        />
      )}

      {assignTarget && (
        <AssignPlanModal
          plan={assignTarget}
          onClose={() => setAssignTarget(null)}
          onAssigned={() => showToast(`${assignTarget.name} assigned successfully`)}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl px-4 py-3 shadow-lg"
          style={{ background: C.text, color: "#fff", maxWidth: 340 }}
        >
          <CheckCircle2 size={16} color={C.green} />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}
    </div>
  );
}