
import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  TextField,
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  InputAdornment,
  Divider,
  Tooltip,
  Chip,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

import { InfluxDB } from "@influxdata/influxdb-client";

// Maps user-friendly unit labels → Flux duration suffixes
const UNIT_OPTIONS = [
  { label: "Minutes", value: "m" },
  { label: "Hours",   value: "h" },
  { label: "Days",    value: "d" },
];

export default function DownloadModal({
  open,
  onClose,
  measurement = null,
  bucket = import.meta.env.VITE_INFLUX_BUCKET,
  deviceType = "",
}) {
  const DEVICE_FIELDS_CONFIG = {
    OMD: {
      temperature: { label: "Temperature (°C)", unit: "°C" },
      humidity:    { label: "Humidity (%)",      unit: "%" },
      NH3:         { label: "NH₃ (ppm)",         unit: "ppm" },
      H2S:         { label: "H₂S (ppm)",         unit: "ppm" },
      odor:        { label: "Odor (%)",           unit: "%" },
    },
    GLMD: {
      leakage:     { label: "Gas Leakage",        unit: "boolean" },
      temperature: { label: "Temperature (°C)",   unit: "°C" },
      humidity:    { label: "Humidity (%)",        unit: "%" },
    },
    TMD: {
      temperature: { label: "Temperature (°C)",   unit: "°C" },
      humidity:    { label: "Humidity (%)",        unit: "%" },
    },
    TSD: {
      temp: { label: "Temperature (°C)", unit: "°C" },
      humi: { label: "Humidity (%)",     unit: "%" },
    },
    AQIMD: {
      AQI:         { label: "Air Quality Index",  unit: "AQI" },
      temperature: { label: "Temperature (°C)",   unit: "°C" },
      humidity:    { label: "Humidity (%)",        unit: "%" },
      PM1:         { label: "PM1.0 (ug/m³)",      unit: "ug/m³" },
      PM25:        { label: "PM2.5 (ug/m³)",      unit: "ug/m³" },
      PM10:        { label: "PM10 (ug/m³)",       unit: "ug/m³" },
      Status:      { label: "Status",             unit: "", computed: true },
    },
    EMD: {
      voltage:     { label: "Voltage (V)",        unit: "V" },
      current:     { label: "Current (A)",        unit: "A" },
      power:       { label: "Power (W)",          unit: "W",   computed: true },
      humidity:    { label: "Humidity (%)",        unit: "%" },
      temperature: { label: "Temperature (°C)",   unit: "°C" },
    },
    ESD: {
      voltage:     { label: "Voltage (V)",        unit: "V" },
      current:     { label: "Current (A)",        unit: "A" },
      power:       { label: "Power (W)",          unit: "W",   computed: true },
      humidity:    { label: "Humidity (%)",        unit: "%" },
      temperature: { label: "Temperature (°C)",   unit: "°C" },
    },
  };

  const isEMD = String(deviceType) === "EMD";

  const fields = Object.keys(DEVICE_FIELDS_CONFIG[deviceType] || {});
  const influxFields = fields.filter(
    (f) => !DEVICE_FIELDS_CONFIG[deviceType]?.[f]?.computed
  );

  const SUM_FIELDS = ["power"];
  const AVG_FIELDS = ["voltage", "current", "humidity", "temperature"];

  // Helper: derive AQI status from numeric AQI value
  const getAQIStatus = (aqi) => {
    const n = Number(aqi);
    if (!Number.isFinite(n)) return "";

    if (n <= 50) return "Good";
    if (n <= 100) return "Moderate";
    if (n <= 150) return "Unhealthy (Sensitive)";
    if (n <= 200) return "Unhealthy";
    if (n <= 300) return "Very Unhealthy";
    return "Hazardous";
  };

  // ── State ──────────────────────────────────────────────────────────────────
  const [startDate,     setStartDate]     = useState(null);
  const [endDate,       setEndDate]       = useState(null);
  const [singleDay,     setSingleDay]     = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [rows,          setRows]          = useState([]);
  const [error,         setError]         = useState("");
  const [totalUnits,    setTotalUnits]    = useState(null);

  const [intervalValue,   setIntervalValue]   = useState("");
  const [intervalUnit,    setIntervalUnit]    = useState("h");
  const [intervalEnabled, setIntervalEnabled] = useState(false);

  const influxUrl   = import.meta.env.VITE_INFLUX_URL;
  const influxToken = import.meta.env.VITE_INFLUX_TOKEN;
  const influxOrg   = import.meta.env.VITE_INFLUX_ORG;

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setSingleDay(true);
      setStartDate(dayjs().startOf("day"));
      setEndDate(null);
      setRows([]);
      setError("");
      setIntervalValue("");
      setIntervalUnit("h");
      setIntervalEnabled(false);
      setTotalUnits(null);
    }
  }, [open]);

  const getDateFrom = (d) => {
    if (!d) return null;
    if (typeof d === "object" && typeof d.toDate === "function") return d.toDate();
    return new Date(d);
  };

  // ── Interval validation helper ─────────────────────────────────────────────
  const intervalFluxSuffix = useMemo(() => {
    if (!intervalEnabled) return null;
    const n = parseInt(intervalValue, 10);
    if (!Number.isInteger(n) || n <= 0) return null;
    return `${n}${intervalUnit}`;
  }, [intervalEnabled, intervalValue, intervalUnit]);

  const intervalLabel = useMemo(() => {
    if (!intervalFluxSuffix) return null;
    const unitObj = UNIT_OPTIONS.find((u) => u.value === intervalUnit);
    return `${intervalValue} ${unitObj?.label ?? intervalUnit}`;
  }, [intervalFluxSuffix, intervalValue, intervalUnit]);

  // ── InfluxDB queries ───────────────────────────────────────────────────────
  const queryInflux = async (startISO, endISO) => {
    if (!influxUrl || !influxToken || !influxOrg) {
      throw new Error("Influx env vars are not set (VITE_INFLUX_URL/TOKEN/ORG).");
    }

    const client   = new InfluxDB({ url: influxUrl, token: influxToken });
    const queryApi = client.getQueryApi(influxOrg);

    const fieldFilter = influxFields
      .map((f) => `r._field == "${f}"`)
      .join(" or ");

    const aggLine = intervalFluxSuffix
      ? `|> aggregateWindow(every: ${intervalFluxSuffix}, fn: mean, createEmpty: false)`
      : "";

    const flux = `
from(bucket: "${bucket}")
  |> range(start: time(v: "${startISO}"), stop: time(v: "${endISO}"))
  |> filter(fn: (r) => r._measurement == "${measurement}" and (${fieldFilter}))
  ${aggLine}
  |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
  |> keep(columns: ["_time", ${influxFields.map((f) => `"${f}"`).join(", ")}])
  |> sort(columns: ["_time"])
`;

    return await queryApi.collectRows(flux);
  };

  const queryEnergy = async (startISO, endISO) => {
    if (!influxUrl || !influxToken || !influxOrg) {
      throw new Error("Influx env vars are not set (VITE_INFLUX_URL/TOKEN/ORG).");
    }

    const client   = new InfluxDB({ url: influxUrl, token: influxToken });
    const queryApi = client.getQueryApi(influxOrg);

    const flux = `
from(bucket: "${bucket}")
  |> range(start: time(v: "${startISO}"), stop: time(v: "${endISO}"))
  |> filter(fn: (r) =>
    r._measurement == "${measurement}" and
    (r._field == "voltage" or r._field == "current")
  )
  |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
  |> map(fn: (r) => ({
    r with
    _value: float(v: r.voltage) * float(v: r.current)
  }))
  |> integral(unit: 1h)
`;

    const rows = await queryApi.collectRows(flux);
    if (!rows.length) return 0;
    return +(rows[0]._value / 1000).toFixed(4);
  };

  // ── Fetch handler ──────────────────────────────────────────────────────────
  const handleFetch = async () => {
    setError("");
    setRows([]);
    setTotalUnits(null);

    if (!startDate) { setError("Please select a start date."); return; }

    // Always derive from local-time dayjs — toISOString() then correctly
    // converts local midnight / local end-of-day into UTC for the query.
    const startDayjs = dayjs(startDate).startOf("day");
    let   endDayjs;

    if (!singleDay) {
      if (!endDate) { setError("Please select an end date or toggle Single Day."); return; }
      endDayjs = dayjs(endDate).endOf("day");   // local 23:59:59.999 → UTC
    } else {
      endDayjs = dayjs(startDate).endOf("day"); // same day, local 23:59:59.999 → UTC
    }

    if (intervalEnabled) {
      const n = parseInt(intervalValue, 10);
      if (!Number.isInteger(n) || n <= 0) {
        setError("Interval value must be a positive integer (e.g. 1, 30).");
        return;
      }
    }

    setLoading(true);
    try {
      const startISO = startDayjs.toISOString();
      const endISO   = endDayjs.toISOString();

      const [data, energy] = await Promise.all([
        queryInflux(startISO, endISO),
        isEMD ? queryEnergy(startISO, endISO) : Promise.resolve(null),
      ]);

      setTotalUnits(energy);

      const normalized = data.map((r) => {
        const base = {
          time: r._time,
          ...influxFields.reduce((acc, f) => {
            const value = r[f];
            if (value !== undefined && value !== null && value !== "") {
              const num = Number(value);
              // Format numeric values to 2 decimal places
              acc[f] = Number.isFinite(num) ? +num.toFixed(2) : value;
            } else {
              acc[f] = "";
            }
            return acc;
          }, {}),
        };

        if (deviceType === "AQIMD") {
          base.Status = getAQIStatus(base.AQI);
        }

        if (isEMD) {
          const v  = Number(r.voltage);
          const c  = Number(r.current);
          const pw = Number.isFinite(v) && Number.isFinite(c) ? v * c : null;
          base.power = pw !== null ? +pw.toFixed(2) : "";
        }

        return base;
      });

      setRows(normalized);
      if (!normalized.length) setError("No data found for the selected range.");
    } catch (err) {
      setError("Failed to fetch data: " + (err.message || err));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Summary (EMD footer) ───────────────────────────────────────────────────
  const summary = useMemo(() => {
    if (!rows.length || !isEMD) return null;
    const result = {};

    const powerVals = rows.map((r) => Number(r.power)).filter(Number.isFinite);
    result.power = powerVals.length
      ? +powerVals.reduce((a, b) => a + b, 0).toFixed(2)
      : "--";

    AVG_FIELDS.forEach((f) => {
      const vals = rows.map((r) => Number(r[f])).filter(Number.isFinite);
      result[f] = vals.length
        ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)
        : "--";
    });

    result.totalUnits = totalUnits !== null ? totalUnits : "--";
    return result;
  }, [rows, totalUnits, isEMD]);

  // ── CSV download ───────────────────────────────────────────────────────────
  const downloadCsv = () => {
    if (!rows.length) { setError("No data to download. Fetch data first."); return; }

    // FIX: dayjs(v) parses the UTC timestamp and formats in the browser's LOCAL
    // timezone — so Pakistani users see PKT (UTC+5), not raw UTC strings.
    const formatTimeForCSV = (v) =>
      v ? dayjs(v).format("YYYY-MM-DD HH:mm:ss") : "";

    const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;

    const intervalHeader = intervalEnabled && intervalFluxSuffix ? ["Interval"] : [];

    const headerRow = [
      "Time (Local)",
      ...intervalHeader,
      ...fields.map((f) => DEVICE_FIELDS_CONFIG[deviceType][f]?.label || f),
    ].map(escape).join(",");

    const csvRows = [headerRow];

    for (const r of rows) {
      const line = [
        formatTimeForCSV(r.time),
        ...(intervalEnabled && intervalFluxSuffix ? [intervalLabel] : []),
        ...fields.map((f) => (r[f] === null || r[f] === undefined ? "" : r[f])),
      ];
      csvRows.push(line.map(escape).join(","));
    }

    if (summary) {
      const summaryLine = [
        "SUMMARY",
        ...(intervalEnabled && intervalFluxSuffix ? [""] : []),
        ...fields.map((f, index) => {
          if (f === "power") return `Total: ${summary.power}`;
          if (AVG_FIELDS.includes(f)) return `Avg: ${summary[f]}`;
          const isLast = index === fields.length - 1;
          if (isLast) return `Total Units: ${summary.totalUnits} kWh`;
          return "";
        }),
      ];
      csvRows.push(summaryLine.map(escape).join(","));
    }

    const csvBody = csvRows.join("\n");
    const BOM     = "\uFEFF";
    const blob    = new Blob([BOM + csvBody], { type: "text/csv;charset=utf-8;" });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement("a");
    a.href        = url;

    const startPart = startDate ? dayjs(startDate).format("YYYY-MM-DD") : "start";
    const endPart   = singleDay
      ? startPart
      : endDate
      ? dayjs(endDate).format("YYYY-MM-DD")
      : "end";

    const intervalSuffix = intervalEnabled && intervalFluxSuffix ? `_every${intervalFluxSuffix}` : "";
    a.download = `influx_${measurement}_${startPart}_to_${endPart}${intervalSuffix}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Close handler ──────────────────────────────────────────────────────────
  const handleClose = () => {
    setRows([]);
    setError("");
    setLoading(false);
    setStartDate(null);
    setEndDate(null);
    setSingleDay(false);
    setIntervalValue("");
    setIntervalUnit("h");
    setIntervalEnabled(false);
    onClose?.();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Dialog open={!!open} onClose={handleClose} maxWidth="lg" fullWidth>
      {/* Header */}
      <div className="flex items-center justify-between py-2">
        <DialogTitle sx={{ fontWeight: "bold", color: "grey.900" }}>
          Export data
        </DialogTitle>
        <img
          src="/logo-half.png"
          alt="IOTFIY Logo"
          className="h-[3rem] md:h-[4rem] w-[5rem] md:w-[6rem] pr-5"
        />
      </div>

      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {/* ── Row 1: date pickers + single day toggle ── */}
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap" mb={2} mt={1}>
            <DatePicker
              label="Start date"
              value={startDate}
              onChange={(d) => {
                const sd = d ? d.startOf("day") : null;
                setStartDate(sd);
                if (singleDay) setEndDate(sd);
              }}
              renderInput={(params) => <TextField {...params} size="small" />}
            />

            <DatePicker
              label="End date"
              value={endDate}
              onChange={(d) => setEndDate(d)}
              disabled={singleDay}
              renderInput={(params) => <TextField {...params} size="small" />}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={singleDay}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSingleDay(checked);
                    if (checked) {
                      if (startDate) {
                        setEndDate(
                          startDate.startOf
                            ? startDate.startOf("day")
                            : dayjs(startDate).startOf("day")
                        );
                      } else {
                        setEndDate(dayjs().startOf("day"));
                        setStartDate(dayjs().startOf("day"));
                      }
                    }
                  }}
                />
              }
              label="Single day"
            />
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* ── Row 2: interval controls ── */}
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap" mb={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={intervalEnabled}
                  onChange={(e) => {
                    setIntervalEnabled(e.target.checked);
                    if (!e.target.checked) {
                      setIntervalValue("");
                      setIntervalUnit("h");
                    }
                  }}
                />
              }
              label={
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Typography variant="body2">Group by interval</Typography>
                  <Tooltip
                    title="Averages all readings within each time bucket. E.g. '1 Hour' on a single day returns 24 rows, each being the mean of that hour's data."
                    placement="top"
                    arrow
                  >
                    <InfoOutlinedIcon sx={{ fontSize: 16, color: "text.secondary", cursor: "help" }} />
                  </Tooltip>
                </Box>
              }
            />

            {/* Number input */}
            <TextField
              label="Interval"
              type="number"
              size="small"
              disabled={!intervalEnabled}
              value={intervalValue}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "" || /^[1-9]\d*$/.test(raw)) setIntervalValue(raw);
              }}
              inputProps={{ min: 1, step: 1 }}
              sx={{ width: 110 }}
              placeholder="e.g. 1"
            />

            {/* Unit dropdown */}
            <FormControl size="small" disabled={!intervalEnabled} sx={{ minWidth: 120 }}>
              <InputLabel>Unit</InputLabel>
              <Select
                label="Unit"
                value={intervalUnit}
                onChange={(e) => setIntervalUnit(e.target.value)}
              >
                {UNIT_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Live preview chip */}
            {intervalEnabled && intervalFluxSuffix && (
              <Chip
                label={`Avg per ${intervalLabel}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}

            {/* invalid interval warning */}
            {intervalEnabled && intervalValue && !intervalFluxSuffix && (
              <Typography variant="caption" color="error">
                Enter a valid positive integer.
              </Typography>
            )}

            <Box flexGrow={1} />
            <Button variant="contained" onClick={handleFetch} disabled={loading}>
              Show data
            </Button>
          </Box>
        </LocalizationProvider>

        {error && (
          <Typography color="error" variant="body2" mb={1}>
            {error}
          </Typography>
        )}

        {/* ── Results table ── */}
        <Box mt={2}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Typography variant="subtitle2">
              Results ({rows.length})
            </Typography>
            {intervalEnabled && intervalFluxSuffix && rows.length > 0 && (
              <Chip
                label={`Grouped every ${intervalLabel} · mean`}
                size="small"
                color="primary"
                sx={{ fontSize: "0.7rem" }}
              />
            )}
          </Box>

          <Box
            sx={{
              maxHeight: 360,
              minHeight: 120,
              overflowY: "auto",
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              position: "relative",
            }}
          >
            <Table stickyHeader size="small">
              {/* Header */}
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      fontWeight: 700,
                      backgroundColor: "grey.100",
                      zIndex: 2,
                    }}
                  >
                    Time (Local)
                    {intervalEnabled && intervalFluxSuffix && (
                      <Typography
                        component="div"
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 400 }}
                      >
                        (window end)
                      </Typography>
                    )}
                  </TableCell>
                  {fields.map((f) => (
                    <TableCell
                      key={f}
                      align="right"
                      sx={{
                        position: "sticky",
                        top: 0,
                        fontWeight: 700,
                        backgroundColor: "grey.100",
                        zIndex: 2,
                      }}
                    >
                      {DEVICE_FIELDS_CONFIG[deviceType][f]?.label || f}
                      {intervalEnabled && intervalFluxSuffix && (
                        <Typography
                          component="div"
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 400 }}
                        >
                          avg
                        </Typography>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              {/* Body */}
              <TableBody>
                {rows.map((r, idx) => (
                  <TableRow
                    key={idx}
                    sx={{
                      "&:nth-of-type(odd)": { backgroundColor: "grey.100" },
                      "&:hover":            { backgroundColor: "grey.200" },
                    }}
                  >
                    {/* FIX: dayjs(r.time) converts UTC → browser local timezone */}
                    <TableCell>{dayjs(r.time).format("YYYY-MM-DD HH:mm:ss")}</TableCell>
                    {fields.map((f) => (
                      <TableCell key={f} align="right">
                        {r[f] !== undefined ? r[f] : ""}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>

              {/* EMD summary footer */}
              {summary && (
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        position: "sticky",
                        bottom: 0,
                        fontWeight: 700,
                        backgroundColor: "#0D5CA4",
                        color: "white",
                        zIndex: 3,
                      }}
                    >
                      <div style={{ fontSize: "0.6rem", opacity: 0.75, marginBottom: 1 }}>
                        Total Units
                      </div>
                      {summary.totalUnits} kWh
                    </TableCell>

                    {fields.map((f) => {
                      const isPower = f === "power";
                      const isAvg   = AVG_FIELDS.includes(f);
                      return (
                        <TableCell
                          key={f}
                          align="right"
                          sx={{
                            position: "sticky",
                            bottom: 0,
                            fontWeight: 700,
                            backgroundColor: "#0D5CA4",
                            color: "white",
                            zIndex: 3,
                          }}
                        >
                          {isPower ? (
                            <>
                              <div style={{ fontSize: "0.6rem", opacity: 0.75, marginBottom: 1 }}>
                                Total
                              </div>
                              {summary.power}
                            </>
                          ) : isAvg ? (
                            <>
                              <div style={{ fontSize: "0.6rem", opacity: 0.75, marginBottom: 1 }}>
                                Avg
                              </div>
                              {summary[f]}
                            </>
                          ) : (
                            "--"
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableHead>
              )}
            </Table>

            {loading && (
              <Box display="flex" justifyContent="center" mt={2} py={1}>
                <CircularProgress />
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={downloadCsv} disabled={!rows.length || loading}>
          Save CSV
        </Button>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}