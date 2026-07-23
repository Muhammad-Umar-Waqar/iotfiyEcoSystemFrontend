import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchOrganizationsByOwner } from "../../../slices/OrganizationSlice";
import { fetchSubUsers } from "../../../slices/UserSlice";
import {
  Building2,
  MapPin,
  Cpu,
  Users,
  Calendar,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";


// --- Donut Ring SVG Component ---
const DonutRing = ({ percentage, color, size = 88 }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const trackColor = "#E2E8F0";

  return (
    <svg width={size} height={size} viewBox="0 0 88 88" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="44" cy="44" r={radius} fill="none" stroke={trackColor} strokeWidth="8" />
      <circle
        cx="44"
        cy="44"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }}
      />
    </svg>
  );
};

// --- Status Badge ---
const StatusBadge = ({ isActive }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      padding: "3px 10px",
      borderRadius: "999px",
      fontSize: "11px",
      fontWeight: 600,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      background: isActive ? "rgba(16,185,129,0.15)" : "rgba(244,63,94,0.15)",
      color: isActive ? "#059669" : "#E11D48",
    }}
  >
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: isActive ? "#10B981" : "#F43F5E",
        display: "inline-block",
      }}
    />
    {isActive ? "Active" : "Inactive"}
  </span>
);

// --- Metric Card ---
const MetricCard = ({ icon: Icon, label, used, total, remaining, accentColor, ringColor }) => {
  const percentage = total > 0 ? Math.min((used / total) * 100, 100) : 0;

  const getStatusInfo = (pct) => {
    if (pct >= 90) return { color: "#F43F5E", label: "Near limit", icon: AlertTriangle };
    if (pct >= 70) return { color: "#F59E0B", label: "High usage", icon: AlertTriangle };
    return { color: "#10B981", label: "Healthy", icon: CheckCircle2 };
  };

  const status = getStatusInfo(percentage);
  const StatusIcon = status.icon;

  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: "20px",
        padding: "24px",
        border: "1px solid #E5EBF2",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        boxShadow: "0 2px 10px rgba(7,81,141,0.06)",
        transition: "box-shadow 0.2s",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow =
          "0 4px 16px rgba(7,81,141,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 10px rgba(7,81,141,0.06)";
      }}
    >
      {/* Subtle background accent */}
      <div
        style={{
          position: "absolute",
          top: -24,
          right: -24,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: accentColor,
          opacity: 0.07,
          pointerEvents: "none",
        }}
      />

      {/* Top row: icon + donut */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "12px",
            background: accentColor + "18",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={20} color={accentColor} strokeWidth={2} />
        </div>

        {/* Donut with center text */}
        <div style={{ position: "relative", width: 64, height: 64 }}>
          <div style={{ position: "absolute", inset: 0 }}>
            <DonutRing percentage={percentage} color={ringColor} size={64} />
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#1E293B", lineHeight: 1 }}>
              {Math.round(percentage)}%
            </span>
          </div>
        </div>
      </div>

      {/* Middle: counts */}
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "2px" }}>
          <span style={{ fontSize: "28px", fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>
            {used}
          </span>
          <span style={{ fontSize: "14px", fontWeight: 500, color: "#94A3B8" }}>/ {total}</span>
        </div>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748B", letterSpacing: "0.01em" }}>
          {label}
        </span>
      </div>

      {/* Bottom: remaining + status */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "12px",
          borderTop: "1px solid #F1F5F9",
        }}
      >
        <span style={{ fontSize: "12px", color: "#94A3B8" }}>
          <span style={{ fontWeight: 700, color: "#475569" }}>{remaining}</span> remaining
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "11px",
            fontWeight: 600,
            color: status.color,
          }}
        >
          <StatusIcon size={12} strokeWidth={2.5} />
          {status.label}
        </span>
      </div>
    </div>
  );
};

// --- Main Component ---
const SubscriptionAnalytics = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const isManager = user?.role === "manager";

  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isManager || !user?.id) return;

    const fetchData = async () => {
      try {
        await dispatch(fetchOrganizationsByOwner(user.id));
        await dispatch(fetchSubUsers(user.id));

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/subscription/usage`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        console.log("Fetched subscription data:", data);
        setSubscriptionData(data);
      } catch (err) {
        console.error("Failed to fetch subscription data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, user, isManager]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          background: "#F8FAFC",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              border: "3px solid #E2E8F0",
              borderTopColor: "#6366F1",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "#64748B", fontSize: "14px" }}>Loading subscription data…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const sub = subscriptionData?.subscription;
  const usage = subscriptionData?.usage;
  const overallOk = subscriptionData?.overallStatus?.isWithinLimit;

  const startDate = sub?.startDate ? new Date(sub.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;
  const endDate = sub?.endDate ? new Date(sub.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;

  // Days remaining
  const daysLeft = sub?.endDate
    ? Math.max(0, Math.ceil((new Date(sub.endDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  const metrics = [
    {
      icon: Building2,
      label: "Organizations",
      ...(usage?.organizations || { used: 0, total: 0, remaining: 0 }),
      accentColor: "#6366F1",
      ringColor: "#6366F1",
    },
    {
      icon: MapPin,
      label: "Venues",
      ...(usage?.venues || { used: 0, total: 0, remaining: 0 }),
      accentColor: "#8B5CF6",
      ringColor: "#8B5CF6",
    },
    {
      icon: Cpu,
      label: "Devices",
      ...(usage?.devices || { used: 0, total: 0, remaining: 0 }),
      accentColor: "#0EA5E9",
      ringColor: "#0EA5E9",
    },
    {
      icon: Users,
      label: "Users",
      ...(usage?.users || { used: 0, total: 0, remaining: 0 }),
      accentColor: "#10B981",
      ringColor: "#10B981",
    },
  ];

  // Determine worst status across all metrics
  const hasNearLimit = metrics.some(
    (m) => m.total > 0 && (m.used / m.total) * 100 >= 90
  );
  const hasHighUsage = metrics.some(
    (m) => m.total > 0 && (m.used / m.total) * 100 >= 70
  );

  return (
    <div
      style={{
        background: "#F8FAFC",
        minHeight: "100%",
        padding: "32px",
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        overflowY: "auto",
      }}
    >
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>

        {/* Page Header */}
        <div style={{ marginBottom: "28px" }}>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "#0F172A",
              margin: 0,
              marginBottom: "4px",
              letterSpacing: "-0.02em",
            }}
          >
            Subscription Analytics
          </h1>
          <p style={{ fontSize: "14px", color: "#94A3B8", margin: 0 }}>
            Track your plan usage and resource limits at a glance
          </p>
        </div>

        {/* Plan Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #064995 0%, #0759B0 50%, #0292FF 100%)",
            borderRadius: "24px",
            padding: "28px 32px",
            marginBottom: "24px",
            color: "#fff",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(2,146,255,0.22)",
          }}
        >
          {/* Decorative circles */}
          <div
            style={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 160,
              height: 160,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -20,
              right: 80,
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.05)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Left: Plan details */}
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(255,255,255,0.12)",
                  borderRadius: "8px",
                  padding: "4px 10px",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: "10px",
                  color: "#C7D2FE",
                }}
              >
                <Sparkles size={11} />
                {sub?.planType || "Plan"}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <h2
                  style={{
                    fontSize: "26px",
                    fontWeight: 800,
                    margin: 0,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {sub?.planName || "—"}
                </h2>
                <StatusBadge isActive={sub?.isActive} />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                  flexWrap: "wrap",
                }}
              >
                {startDate && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Calendar size={13} color="#A5B4FC" />
                    <span style={{ fontSize: "12px", color: "#A5B4FC" }}>
                      Started {startDate}
                    </span>
                  </div>
                )}
                {endDate && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Calendar size={13} color="#A5B4FC" />
                    <span style={{ fontSize: "12px", color: "#A5B4FC" }}>
                      Expires {endDate}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Days remaining pill */}
            {daysLeft !== null && (
              <div
                style={{
                  background: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "16px",
                  padding: "16px 24px",
                  textAlign: "center",
                  minWidth: "100px",
                }}
              >
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: 800,
                    lineHeight: 1,
                    color: daysLeft <= 3 ? "#FCA5A5" : "#FFFFFF",
                    marginBottom: "4px",
                  }}
                >
                  {daysLeft}
                </div>
                <div style={{ fontSize: "11px", color: "#A5B4FC", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Days Left
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Overall status banner */}
        {(hasNearLimit || hasHighUsage) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: hasNearLimit ? "#FFF1F2" : "#FFFBEB",
              border: `1px solid ${hasNearLimit ? "#FECDD3" : "#FDE68A"}`,
              borderRadius: "12px",
              padding: "12px 16px",
              marginBottom: "20px",
              fontSize: "13px",
              color: hasNearLimit ? "#BE123C" : "#92400E",
              fontWeight: 500,
            }}
          >
            <AlertTriangle
              size={16}
              color={hasNearLimit ? "#E11D48" : "#D97706"}
              strokeWidth={2.5}
            />
            {hasNearLimit
              ? "One or more resources are near their limit. Consider upgrading your plan."
              : "Some resources have high usage. Keep an eye on your limits."}
          </div>
        )}

        {/* Metric Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          {metrics.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>

        {/* Summary Footer */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "16px",
            padding: "20px 24px",
            border: "1px solid #E5EBF2",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            boxShadow: "0 2px 10px rgba(7,81,141,0.06)",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: overallOk ? "#ECFDF5" : "#FFF1F2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {overallOk ? (
              <ShieldCheck size={18} color="#10B981" />
            ) : (
              <AlertCircle size={18} color="#E11D48" />
            )}
          </div>
          <div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#0F172A",
                marginBottom: "2px",
              }}
            >
              {overallOk ? "All resources within limits" : "Limits exceeded"}
            </div>
            <div style={{ fontSize: "12px", color: "#94A3B8" }}>
              {overallOk
                ? "Your subscription is operating normally. No action required."
                : "You have exceeded one or more resource limits. Please review your usage."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionAnalytics;