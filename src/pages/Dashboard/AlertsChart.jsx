// src/components/AlertsChart.jsx

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

/**
 * Props:
 *  - venues: normalized venues array from alerts slice
 *    each item shape: { venueId, venueName, odourAlertCount, humidityAlertCount, temperatureAlertCount, ... }
 *  - defaultMode: "odour" | "humidity" | "temperature"
 */
export default function AlertsChart({ venues = [], defaultMode = "odour" }) {
  const [mode, setMode] = useState(defaultMode ?? "odour");

  const data = useMemo(() => {
    return (venues || []).map((v) => ({
      // keep name for internal use but we won't show it on X axis
      name: v.venueName || v.venueId || "Unknown",
      value:
        mode === "odour"
          ? Number(v.odourAlertCount || 0)
          : mode === "humidity"
          ? Number(v.humidityAlertCount || 0)
          : Number(v.temperatureAlertCount || 0),
      venueId: v.venueId,
    }));
  }, [venues, mode]);

  return (
    <div className="w-full bg-white rounded-xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-end mb-3">
        {/* Mode Selector */}
        <div className="flex items-center gap-2">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Select alert type"
          >
            <option value="odour">Odour</option>
            <option value="humidity">Humidity</option>
            <option value="temperature">Temperature</option>
          </select>
        </div>
      </div>

      {/* E. Analytics Chart (new design) */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            // tiny remount trick so Recharts updates reliably when mode changes
            key={`alerts-chart-${mode}`}
            data={data}
            margin={{
              top: 5,
              right: 10,
              left: 0,
              bottom: 5,
            }}
          >
            {/* hide X axis labels (no venue name/number under bars) */}
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              // hide tick labels
              tick={false}
            />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: "rgba(37, 99, 235, 0.1)" }}
              contentStyle={{
                backgroundColor: "transparent",
                border: "none",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="100%" stopColor="#2563EB" />
              </linearGradient>
            </defs>
            <Bar
              dataKey="value"
              radius={[32, 32, 32, 32]}
              barSize={30}
              fill="url(#barGradient)"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
