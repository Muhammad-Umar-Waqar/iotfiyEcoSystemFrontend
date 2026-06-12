
import React from 'react';
import {
  GaugeContainer,
  GaugeValueArc,
  GaugeReferenceArc,
  GaugeValueText,
  useGaugeState,
  gaugeClasses,
} from '@mui/x-charts/Gauge';



const AQI_SEGMENTS = [
  { min: 0,   max: 50,  color: '#00E676', label: 'Good' },
  { min: 51,  max: 100, color: '#FFD600', label: 'Moderate' },
  { min: 101, max: 150, color: '#FF9100', label: 'Unhealthy for Sensitive' },
  { min: 151, max: 200, color: '#FF5252', label: 'Unhealthy' },
  { min: 201, max: 300, color: '#D500F9', label: 'Very Unhealthy' },
  { min: 301, max: 500, color: '#B71C1C', label: 'Hazardous' },
];


function polarToCartesian(cx, cy, r, angle) {
  // angle in radians, 0 = up. Matches useGaugeState semantics.
  const x = cx + r * Math.sin(angle);
  const y = cy - r * Math.cos(angle);
  return { x, y };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0;
  // sweep = 1 (clockwise) fits Gauge coordinate system
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}


function GaugeSegments({ segments = AQI_SEGMENTS }) {
  const {
    startAngle,
    endAngle,
    valueMin,
    valueMax,
    innerRadius,
    outerRadius,
    cx,
    cy,
  } = useGaugeState();

  const sweep = endAngle - startAngle;

  const borderColor = '#1b5e1fd4'; // dark AQI green
  const borderWidth = 2;

  const midRadius = (innerRadius + outerRadius) / 2;
  const fillThickness = outerRadius - innerRadius - borderWidth * 2;

  return (
    <g>
      {segments.map((s, i) => {
        const segStart = Math.max(valueMin, s.min);
        const segEnd = Math.min(valueMax, s.max);
        if (segEnd <= segStart) return null;

        const f0 = (segStart - valueMin) / (valueMax - valueMin);
        const f1 = (segEnd - valueMin) / (valueMax - valueMin);

        const a0 = startAngle + f0 * sweep;
        const a1 = startAngle + f1 * sweep;

        // Paths
        const fillPath = describeArc(cx, cy, midRadius, a0, a1);
        const outerPath = describeArc(cx, cy, outerRadius, a0, a1);
        const innerPath = describeArc(cx, cy, innerRadius, a0, a1);

        // Divider lines
        const dividerOuter = polarToCartesian(cx, cy, outerRadius, a0);
        const dividerInner = polarToCartesian(cx, cy, innerRadius, a0);

        return (
          <g key={i}>
            {/* Colored fill */}
            <path
              d={fillPath}
              fill="none"
              stroke={s.color}
              strokeWidth={fillThickness}
            />

            {/* Outer green border */}
            <path
              d={outerPath}
              fill="none"
              stroke={borderColor}
              strokeWidth={borderWidth}
            />

            {/* Inner green border */}
            <path
              d={innerPath}
              fill="none"
              stroke={borderColor}
              strokeWidth={borderWidth}
            />

            {/* Segment divider */}
            <line
              x1={dividerInner.x}
              y1={dividerInner.y}
              x2={dividerOuter.x}
              y2={dividerOuter.y}
              stroke={borderColor}
              // strokeWidth={borderWidth}
            />
          </g>
        );
      })}
    </g>
  );
}



function GaugePointer() {
  const { valueAngle, outerRadius, innerRadius, cx, cy, value } = useGaugeState();
  if (valueAngle === null) return null;

  // Needle geometry
  const needleLength = outerRadius * 0.88;
  const needleWidth = innerRadius * 0.12;

  const tip = polarToCartesian(cx, cy, needleLength, valueAngle);
  const left = polarToCartesian(cx, cy, needleWidth, valueAngle - Math.PI / 2);
  const right = polarToCartesian(cx, cy, needleWidth, valueAngle + Math.PI / 2);

  // Color based on AQI range
  const seg =
    AQI_SEGMENTS.find((s) => value >= s.min && value <= s.max) ||
    AQI_SEGMENTS[0];

  return (
    <g>
      {/* Needle body (triangle) */}
      <path
        d={`
          M ${left.x} ${left.y}
          L ${tip.x} ${tip.y}
          L ${right.x} ${right.y}
          Z
        `}
        // fill={seg.color}
        fill="#1b5e1fd4"
        opacity={0.95}
      />

      {/* Center hub outer */}
      <circle
        cx={cx}
        cy={cy}
        r={innerRadius * 0.18}
        fill="#1b5e1f"
      />

      {/* Center hub inner */}
      <circle
        cx={cx}
        cy={cy}
        r={innerRadius * 0.10}
        fill={seg.color}
      />
    </g>
  );
}



export default function AQIGauge({ value = 0, width = 90, height = 65 }) {
  return (
    <GaugeContainer
      width={width}
      height={height}
      startAngle={-110}
      endAngle={110}
      value={value}
      valueMin={0}
      valueMax={500}
      innerRadius="68%"
      outerRadius="100%"
    >
      {/* background reference arc (subtle) */}
      <GaugeReferenceArc />

      {/* our colored segments */}
      <GaugeSegments />

      {/* value arc (fills from left to value) */}
      {/* <GaugeValueArc skipAnimation={false} /> */}

      {/* pointer, labels, etc */}
      <GaugePointer />

      {/* center text can be further customized via GaugeValueText if preferred */}
    </GaugeContainer>
  );
}

