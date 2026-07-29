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
  Divider,
  Tooltip,
  Chip,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

const UNIT_OPTIONS = [
  { label: "Minutes", value: "m" },
  { label: "Hours", value: "h" },
  { label: "Days", value: "d" },
];

/**
 * UI field configs. Fields without Mongo data stay in the table (empty).
 * `mongoKey` maps a display field onto a Mongo column when names differ.
 */
const DEVICE_FIELDS_CONFIG = {
  OD: {
    temperature: { label: "Temperature (°C)", unit: "°C" },
    humidity: { label: "Humidity (%)", unit: "%" },
    NH3: { label: "NH₃ (ppm)", unit: "ppm" },
    H2S: { label: "H₂S (ppm)", unit: "ppm" },
    odor: { label: "Odor (%)", unit: "%", mongoKey: "odour" },
  },
  GLD: {
    leakage: { label: "Gas Leakage", unit: "boolean" },
    gass: { label: "Gas Level", unit: "" },
    temperature: { label: "Temperature (°C)", unit: "°C" },
    humidity: { label: "Humidity (%)", unit: "%" },
  },
  GD: {
    leakage: { label: "Gas Leakage", unit: "boolean" },
    gass: { label: "Gas Level", unit: "" },
    temperature: { label: "Temperature (°C)", unit: "°C" },
    humidity: { label: "Humidity (%)", unit: "%" },
  },
  THD: {
    temperature: { label: "Temperature (°C)", unit: "°C" },
    humidity: { label: "Humidity (%)", unit: "%" },
  },
  TD: {
    temperature: { label: "Temperature (°C)", unit: "°C" },
    humidity: { label: "Humidity (%)", unit: "%" },
  },
  AQID: {
    AQI: { label: "Air Quality Index", unit: "AQI" },
    temperature: { label: "Temperature (°C)", unit: "°C" },
    humidity: { label: "Humidity (%)", unit: "%" },
    PM1: { label: "PM1.0 (ug/m³)", unit: "ug/m³" },
    PM25: { label: "PM2.5 (ug/m³)", unit: "ug/m³" },
    PM10: { label: "PM10 (ug/m³)", unit: "ug/m³" },
    Status: { label: "Status", unit: "", computed: true },
  },
  SMD: {
    smoke: { label: "Smoke (%)", unit: "%" },
  },
  WLD: {
    waterLeak: { label: "Water Leak", unit: "" },
  },
  ED: {
    voltage: { label: "Voltage (V)", unit: "V" },
    current: { label: "Current (A)", unit: "A" },
    power: { label: "Power (W)", unit: "W", computed: true },
    humidity: { label: "Humidity (%)", unit: "%" },
    temperature: { label: "Temperature (°C)", unit: "°C" },
  },
  AC: {
    temperature: { label: "Set Temperature (°C)", unit: "°C" },
    current: { label: "Current (A)", unit: "A" },
    voltage: { label: "Power / Voltage", unit: "" },
  },
};

const AVG_FIELDS = ["voltage", "current", "humidity", "temperature"];

export default function DownloadModal({
  open,
  onClose,
  measurement = null,
  deviceId = null,
  deviceType = "",
}) {
  const resolvedDeviceId = deviceId || measurement;
  const typeKey = String(deviceType || "").toUpperCase();
  const fieldConfig = DEVICE_FIELDS_CONFIG[typeKey] || {};
  const fields = Object.keys(fieldConfig);
  const isED = typeKey === "ED";

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

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [singleDay, setSingleDay] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [totalUnits, setTotalUnits] = useState(null);

  const [intervalValue, setIntervalValue] = useState("");
  const [intervalUnit, setIntervalUnit] = useState("h");
  const [intervalEnabled, setIntervalEnabled] = useState(false);

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

  const intervalSuffix = useMemo(() => {
    if (!intervalEnabled) return null;
    const n = parseInt(intervalValue, 10);
    if (!Number.isInteger(n) || n <= 0) return null;
    return `${n}${intervalUnit}`;
  }, [intervalEnabled, intervalValue, intervalUnit]);

  const intervalLabel = useMemo(() => {
    if (!intervalSuffix) return null;
    const unitObj = UNIT_OPTIONS.find((u) => u.value === intervalUnit);
    return `${intervalValue} ${unitObj?.label ?? intervalUnit}`;
  }, [intervalSuffix, intervalValue, intervalUnit]);

  const formatCell = (field, value) => {
    if (value === undefined || value === null || value === "") return "";
    if (field === "waterLeak") return value === true || value === 1 ? "Leak" : "OK";
    if (field === "leakage") return value === true || value === 1 ? "Yes" : value === false || value === 0 ? "No" : "";
    return value;
  };

  const handleFetch = async () => {
    setError("");
    setRows([]);
    setTotalUnits(null);

    if (!resolvedDeviceId) {
      setError("Device id is missing.");
      return;
    }
    if (!startDate) {
      setError("Please select a start date.");
      return;
    }

    const startDayjs = dayjs(startDate).startOf("day");
    let endDayjs;
    if (!singleDay) {
      if (!endDate) {
        setError("Please select an end date or toggle Single Day.");
        return;
      }
      endDayjs = dayjs(endDate).endOf("day");
    } else {
      endDayjs = dayjs(startDate).endOf("day");
    }

    if (intervalEnabled) {
      const n = parseInt(intervalValue, 10);
      if (!Number.isInteger(n) || n <= 0) {
        setError("Interval value must be a positive integer (e.g. 1, 30).");
        return;
      }
    }

    const apiBase = import.meta.env.VITE_API_URL;
    if (!apiBase) {
      setError("VITE_API_URL is not set.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to download data.");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        start: startDayjs.toISOString(),
        end: endDayjs.toISOString(),
      });
      if (intervalEnabled && intervalSuffix) {
        params.set("intervalValue", String(intervalValue));
        params.set("intervalUnit", intervalUnit);
      }

      const res = await fetch(
        `${apiBase}/device/${encodeURIComponent(resolvedDeviceId)}/sensor-download?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.message || `Request failed (${res.status})`);
      }

      setTotalUnits(json.totalUnits ?? null);

      const mongoRows = Array.isArray(json.rows) ? json.rows : [];
      const normalized = mongoRows.map((r) => {
        const base = { time: r.time };

        for (const f of fields) {
          const cfg = fieldConfig[f];
          if (cfg?.computed) continue;

          const mongoKey = cfg?.mongoKey || f;
          let value = r[mongoKey];
          // Fallback: odor/odour either way
          if ((value === undefined || value === null) && f === "odor") value = r.odour;
          if ((value === undefined || value === null) && mongoKey === "odour") value = r.odor;

          if (value !== undefined && value !== null && value !== "") {
            if (typeof value === "boolean") {
              base[f] = value;
            } else {
              const num = Number(value);
              base[f] = Number.isFinite(num) ? +num.toFixed(2) : value;
            }
          } else {
            base[f] = "";
          }
        }

        if (typeKey === "AQID") {
          base.Status = getAQIStatus(base.AQI ?? r.AQI);
        }

        if (isED) {
          if (r.power != null && r.power !== "") {
            base.power = Number(r.power);
          } else {
            const v = Number(r.voltage);
            const c = Number(r.current);
            base.power =
              Number.isFinite(v) && Number.isFinite(c) ? +(v * c).toFixed(2) : "";
          }
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

  const summary = useMemo(() => {
    if (!rows.length || !isED) return null;
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
  }, [rows, totalUnits, isED]);

  const downloadCsv = () => {
    if (!rows.length) {
      setError("No data to download. Fetch data first.");
      return;
    }

    const formatTimeForCSV = (v) =>
      v ? dayjs(v).format("YYYY-MM-DD HH:mm:ss") : "";

    const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const intervalHeader = intervalEnabled && intervalSuffix ? ["Interval"] : [];

    const headerRow = [
      "Time (Local)",
      ...intervalHeader,
      ...fields.map((f) => fieldConfig[f]?.label || f),
    ]
      .map(escape)
      .join(",");

    const csvRows = [headerRow];

    for (const r of rows) {
      const line = [
        formatTimeForCSV(r.time),
        ...(intervalEnabled && intervalSuffix ? [intervalLabel] : []),
        ...fields.map((f) => formatCell(f, r[f])),
      ];
      csvRows.push(line.map(escape).join(","));
    }

    if (summary) {
      const summaryLine = [
        "SUMMARY",
        ...(intervalEnabled && intervalSuffix ? [""] : []),
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
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvBody], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    const startPart = startDate ? dayjs(startDate).format("YYYY-MM-DD") : "start";
    const endPart = singleDay
      ? startPart
      : endDate
        ? dayjs(endDate).format("YYYY-MM-DD")
        : "end";

    const intervalFileSuffix =
      intervalEnabled && intervalSuffix ? `_every${intervalSuffix}` : "";
    a.download = `sensor_${resolvedDeviceId}_${startPart}_to_${endPart}${intervalFileSuffix}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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

  return (
    <Dialog
      open={!!open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
        },
      }}
    >
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-1 py-2">
        <DialogTitle sx={{ fontWeight: 700, color: "grey.900", pb: 0.5 }}>
          Export data
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: "0.7rem" }}>
            View & download sensor history.
          </Typography>
        </DialogTitle>
        <img
          src="/logo-half.png"
          alt="IOTFIY Logo"
          className="h-[3rem] md:h-[4rem] w-[5rem] md:w-[6rem] pr-5 opacity-90"
        />
      </div>

      <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box
            sx={{
              // border: "1px solid",
              // borderColor: "divider",
              // borderRadius: 3,
              p: { xs: 1.5, sm: 2 },
              // backgroundColor: "grey.50",
              mb: 2,
              mt: 1,
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
              Date range
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box sx={{ minWidth: 210 }}>
                <DatePicker
                  label="Start date"
                  value={startDate}
                  onChange={(d) => {
                    const sd = d ? d.startOf("day") : null;
                    setStartDate(sd);
                    if (singleDay) setEndDate(sd);
                  }}
                  renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                />
              </Box>

              <Box sx={{ minWidth: 210 }}>
                <DatePicker
                  label="End date"
                  value={endDate}
                  onChange={(d) => setEndDate(d)}
                  disabled={singleDay}
                  renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                />
              </Box>

              <Box sx={{ pl: 0.5 }}>
                <FormControlLabel
                  sx={{ m: 0 }}
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
            </Box>
          </Box>

          <Divider sx={{ mb: 2.5 }} />

          <Box
            sx={{
              // border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              p: { xs: 1.5, sm: 2 },
              backgroundColor: "white",
              mb: 1,
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
              Grouping
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box sx={{ minWidth: 180 }}>
                <FormControlLabel
                  sx={{ m: 0 }}
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
                        <InfoOutlinedIcon
                          sx={{ fontSize: 16, color: "text.secondary", cursor: "help" }}
                        />
                      </Tooltip>
                    </Box>
                  }
                />
              </Box>

              <Box sx={{ minWidth: 110 }}>
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
              </Box>

              <Box sx={{ minWidth: 130 }}>
                <FormControl
                  size="small"
                  disabled={!intervalEnabled}
                  sx={{ minWidth: 130 }}
                >
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
              </Box>

              {intervalEnabled && intervalSuffix && (
                <Chip
                  label={`Avg per ${intervalLabel}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}

              {intervalEnabled && intervalValue && !intervalSuffix && (
                <Typography variant="caption" color="error">
                  Enter a valid positive integer.
                </Typography>
              )}

              <Box flexGrow={1} />
              <Button
                variant="contained"
                onClick={handleFetch}
                disabled={loading}
                sx={{ minWidth: 120, borderRadius: 3, px: 2.5 }}
              >
                Show data
              </Button>
            </Box>
          </Box>
        </LocalizationProvider>

        {error && (
          <Typography
            color="error"
            variant="body2"
            sx={{
              mb: 1.5,
              mt: 0.5,
              px: 1.5,
              py: 1,
              borderRadius: 2.5,
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
            }}
          >
            {error}
          </Typography>
        )}

        <Box mt={2.5}>
          {/* <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            gap={1}
            flexWrap="wrap"
            mb={1.25}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, marginBottom: 1 }}>
              Results ({rows.length})
            </Typography>
            {intervalEnabled && intervalSuffix && rows.length > 0 && (
              <Chip
                label={`Grouped every ${intervalLabel} · mean`}
                size="small"
                color="primary"
                sx={{ fontSize: "0.7rem" }}
                
              />
            )}
          </Box> */}

{/* <Box
  display="flex"
  alignItems="center"
  justifyContent="space-between"
  gap={1}
  flexWrap="nowrap"
  mb={1.25}
> */}
<div className="flex items-center gap-1 flex-wrap mb-1.25">
  
  <Typography
    variant="subtitle2"
    sx={{
      fontWeight: 700,
      mb: 0, // remove bottom margin
    }}
  >
    Results ({rows.length})
  </Typography>

  {intervalEnabled && intervalSuffix && rows.length > 0 && (
    <Chip
      label={`Grouped every ${intervalLabel} · mean`}
      size="small"
      color="primary"
      sx={{ fontSize: "0.7rem" }}
    />
  )}
  
</div>
{/* </Box> */}
          <Box
            sx={{
              maxHeight: 360,
              minHeight: 160,
              overflowY: "auto",
              border: 1,
              borderColor: "divider",
              borderRadius: 3,
              position: "relative",
              backgroundColor: "background.paper",
            }}
          >
            <Table stickyHeader size="small">
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
                    Time
                    {/* {intervalEnabled && intervalSuffix && (
                      <Typography
                        component="div"
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 400 }}
                      >
                        (bucket start)
                      </Typography>
                    )} */}
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
                      {fieldConfig[f]?.label || f}
                      {intervalEnabled && intervalSuffix && !fieldConfig[f]?.computed && (
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

              <TableBody>
                {rows.map((r, idx) => (
                  <TableRow
                    key={idx}
                    sx={{
                      "&:nth-of-type(odd)": { backgroundColor: "grey.100" },
                      "&:hover": { backgroundColor: "grey.200" },
                    }}
                  >
                    <TableCell>{dayjs(r.time).format("YYYY-MM-DD HH:mm:ss")}</TableCell>
                    {fields.map((f) => (
                      <TableCell key={f} align="right">
                        {formatCell(f, r[f])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {!loading && rows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={fields.length + 1}
                      align="center"
                      sx={{ py: 4, color: "text.secondary" }}
                    >
                      Select a date range and click `Show data` to preview records here.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>

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
                      const isAvg = AVG_FIELDS.includes(f);
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
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "rgba(255,255,255,0.7)",
                  zIndex: 5,
                }}
              >
                <CircularProgress size={32} />
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined" sx={{ borderRadius: 3 }}>
          Close
        </Button>
        <Button
          onClick={downloadCsv}
          disabled={!rows.length || loading}
          variant="contained"
          sx={{ borderRadius: 3, px: 2.5 }}
        >
          Save CSV
        </Button>
      </DialogActions>
    </Dialog>
  );
}
