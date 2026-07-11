"use client";

import { useRef, useEffect, useState } from "react";

interface RadarDataset {
  label: string;
  data: number[];
  backgroundColor: string;
  borderColor: string;
  pointBackgroundColor: string;
  pointBorderColor: string;
  pointHoverBackgroundColor: string;
  pointHoverBorderColor: string;
}

function RadarChart({
  labels,
  datasets,
  size = 260,
}: {
  labels: string[];
  datasets: RadarDataset[];
  size?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const n = labels.length;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 40;
  const levels = 5;

  function getPoint(i: number, r: number) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  const gridPolygons = Array.from({ length: levels }, (_, l) => {
    const r = (radius * (l + 1)) / levels;
    return labels.map((_, i) => { const p = getPoint(i, r); return `${p.x},${p.y}`; }).join(" ");
  });

  const axisLines = labels.map((_, i) => {
    const p = getPoint(i, radius);
    return { x1: cx, y1: cy, x2: p.x, y2: p.y };
  });

  const labelPositions = labels.map((label, i) => {
    const p = getPoint(i, radius + 24);
    return { x: p.x, y: p.y, text: label.replace(/_/g, " ") };
  });

  return (
    <svg ref={svgRef} width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
      {/* Grid */}
      {gridPolygons.map((points, i) => (
        <polygon key={`grid-${i}`} points={points} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      ))}

      {/* Axes */}
      {axisLines.map((line, i) => (
        <line key={`axis-${i}`} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      ))}

      {/* Dataset areas + points */}
      {datasets.map((ds, di) => {
        const points = ds.data.map((val, i) => {
          const p = getPoint(i, radius * (val / 100));
          return `${p.x},${p.y}`;
        }).join(" ");

        return (
          <g key={`ds-${di}`}>
            <polygon
              points={points}
              fill={ds.backgroundColor}
              stroke={ds.borderColor}
              strokeWidth="2"
              style={{ transition: "all 0.3s ease" }}
            />
            {ds.data.map((val, i) => {
              const p = getPoint(i, radius * (val / 100));
              return (
                <circle
                  key={`pt-${di}-${i}`}
                  cx={p.x}
                  cy={p.y}
                  r={hovered === i ? 6 : 4}
                  fill={ds.pointBackgroundColor}
                  stroke={ds.pointBorderColor}
                  strokeWidth="2"
                  style={{ cursor: "pointer", transition: "r 0.2s ease" }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                />
              );
            })}
          </g>
        );
      })}

      {/* Labels */}
      {labelPositions.map((label, i) => (
        <text
          key={`label-${i}`}
          x={label.x}
          y={label.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={hovered === i ? "#f0f0f0" : "var(--text-soft)"}
          fontSize="11"
          fontFamily="var(--font-mono)"
          style={{ transition: "fill 0.2s ease" }}
        >
          {label.text}
        </text>
      ))}

      {/* Hover tooltip */}
      {hovered !== null && (
        <g>
          {datasets.map((ds, di) => {
            const p = getPoint(hovered, radius * (ds.data[hovered] / 100));
            return (
              <g key={`tip-${di}`}>
                <rect
                  x={p.x - 36}
                  y={p.y - 28}
                  width="72"
                  height="22"
                  rx="4"
                  fill="rgba(0,0,0,0.8)"
                  stroke={ds.borderColor}
                  strokeWidth="1"
                />
                <text
                  x={p.x}
                  y={p.y - 14}
                  textAnchor="middle"
                  fill={ds.borderColor}
                  fontSize="11"
                  fontFamily="var(--font-mono)"
                  fontWeight="600"
                >
                  {ds.label}: {ds.data[hovered]}%
                </text>
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
}

export function ScoreDisplay({
  score,
  sectionScores,
}: {
  score: number;
  sectionScores: Record<string, number> | null;
}) {
  const percentage = Math.round(score * 100);

  const labels = sectionScores ? Object.keys(sectionScores) : [];
  const values = sectionScores ? Object.values(sectionScores).map((v) => Math.round(v * 100)) : [];

  const datasets: RadarDataset[] = sectionScores
    ? [
        {
          label: "Your Match",
          data: values,
          backgroundColor: "rgba(201, 169, 98, 0.15)",
          borderColor: "rgb(201, 169, 98)",
          pointBackgroundColor: "rgb(201, 169, 98)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgb(201, 169, 98)",
        },
        {
          label: "Benchmark",
          data: labels.map(() => 70),
          backgroundColor: "rgba(255, 255, 255, 0.04)",
          borderColor: "rgba(255, 255, 255, 0.2)",
          pointBackgroundColor: "rgba(255, 255, 255, 0.3)",
          pointBorderColor: "rgba(255, 255, 255, 0.5)",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(255, 255, 255, 0.5)",
        },
      ]
    : [];

  return (
    <div style={{ position: "relative" }}>
      {/* Score badge — top right */}
      <div
        style={{
          position: "absolute",
          top: "-4px",
          right: "-4px",
          background: "rgba(201, 169, 98, 0.10)",
          border: "1px solid rgba(201, 169, 98, 0.25)",
          borderRadius: "var(--radius-md)",
          padding: "8px 14px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 5,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "22px",
            fontWeight: 600,
            color: "var(--color-gold-light)",
            lineHeight: 1,
          }}
        >
          {percentage}%
        </span>
        <span style={{ fontSize: "9px", color: "var(--text-faint)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
          overall
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "36px",
        }}
      >
        {/* Radar */}
        <div style={{ flexShrink: 0, paddingLeft: "16px", paddingRight: "8px" }}>
          {sectionScores ? (
            <RadarChart labels={labels} datasets={datasets} size={280} />
          ) : (
            <div
              style={{
                width: "280px",
                height: "280px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "48px", fontFamily: "var(--font-display)", color: "var(--color-gold-light)" }}>
                {percentage}%
              </span>
            </div>
          )}
        </div>

        {/* Legend + bars */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "14px",
              color: "var(--text)",
              marginBottom: "18px",
            }}
          >
            Score breakdown
          </h4>

          {/* Legend */}
          <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
            {datasets.map((ds, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "12px", height: "3px", borderRadius: "2px", background: ds.borderColor }} />
                <span style={{ fontSize: "11px", color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
                  {ds.label}
                </span>
              </div>
            ))}
          </div>

          {sectionScores ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {Object.entries(sectionScores).map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "100px 1fr 40px",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "13px", color: "var(--text-soft)" }}>
                    {key.replace(/_/g, " ")}
                  </span>
                  <div
                    style={{
                      height: "6px",
                      background: "var(--surface-sunken)",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.round(value * 100)}%`,
                        background: "linear-gradient(90deg, var(--color-gold), var(--color-gold-light))",
                        borderRadius: "4px",
                        transition: "width 0.6s ease",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "12px",
                      color: "var(--color-gold)",
                      textAlign: "right",
                    }}
                  >
                    {Math.round(value * 100)}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: "13px", color: "var(--text-faint)" }}>No section scores available</p>
          )}
        </div>
      </div>
    </div>
  );
}
