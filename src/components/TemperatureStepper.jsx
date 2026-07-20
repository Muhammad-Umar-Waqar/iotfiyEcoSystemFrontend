import { Box, IconButton, Typography } from "@mui/material";
import { Add, Remove } from "@mui/icons-material";

/**
 * Pill-style temperature stepper for AC controls.
 * Parent owns value + API (e.g. AcControlContext.stepTemperature).
 */
const TemperatureStepper = ({
  value,
  onIncrement,
  onDecrement,
  disabledMinus = false,
  disabledPlus = false,
  disabled = false,
  unit = "°C",
  stopPropagation = true,
}) => {
  const wrap =
    (handler) =>
    (e) => {
      if (stopPropagation) e?.stopPropagation?.();
      handler?.(e);
    };

  const minusDisabled = disabled || disabledMinus;
  const plusDisabled = disabled || disabledPlus;

  return (
    <Box
      onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        maxWidth: "100%",
        px: 0.2,
        py: 0.2,
        borderRadius: "999px",
        bgcolor: "white",
        boxShadow: 2,
      }}
    >
      <IconButton
        type="button"
        onClick={wrap(onDecrement)}
        disabled={minusDisabled}
        aria-label="Decrease temperature"
        sx={{
          bgcolor: "#f3f4f6",
          "&:hover": { bgcolor: "#e5e7eb" },
          "&.Mui-disabled": { opacity: 0.4 },
        }}
      >
        <Remove sx={{ fontSize: 15, color: "#0D5CA4", }}/>
      </IconButton>

      {/* <Typography
        component="span"
        fontSize={36}
        fontWeight={600}
        lineHeight={1.1}
        sx={{ userSelect: "none", minWidth: 50, textAlign: "center" }}
      >
        {value}
        {unit ? (
          <Typography
            component="span"
            fontSize={16}
            fontWeight={600}
            color="text.secondary"
            sx={{ ml: 0.25 }}
          >
            {unit}
          </Typography>
        ) : null}
      </Typography> */}


<Typography
  component="div"
  sx={{
    display: "flex",
    alignItems: "baseline",
    justifyContent: "center",
    fontWeight: 600,
    userSelect: "none",
    minWidth: 44,
    paddingX: 0.5,
    paddingY: 0.2,
    lineHeight: 1,
  }}
>
  <Typography
    component="span"
    sx={{
      fontSize: 20,
      fontWeight: 600,
      letterSpacing: "-0.04em",
    }}
  >
    {value}
  </Typography>

  {unit && (
    <Typography
      component="span"
      sx={{
        ml: 0.4,
        fontSize: 15,
        fontWeight: 500,
        color: "text.secondary",
      }}
    >
      {unit}
    </Typography>
  )}
</Typography>


      <IconButton
        type="button"
        onClick={wrap(onIncrement)}
        disabled={plusDisabled}
        aria-label="Increase temperature"
        sx={{
          bgcolor: "#f3f4f6",
          "&:hover": { bgcolor: "#e5e7eb" },
          "&.Mui-disabled": { opacity: 0.4 },
        }}
      >
        <Add sx={{ fontSize: 15, color: "#0D5CA4" }}/>
      </IconButton>
    </Box>
  );
};

export default TemperatureStepper;
