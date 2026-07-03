"use client";

import { useState } from "react";
import { Card } from "@/components/Card";

interface HealthResult {
  step: number;
  agent: string;
  task: string;
  model: string;
  ok: boolean;
  latency: number;
  error?: string;
  errorClass?: string;
  fix?: string;
}

interface HealthResponse {
  status: string;
  healthy: number;
  total: number;
  results: HealthResult[];
  checkedAt: string;
}

export function NimHealthPanel() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/health/nim");
      const json = await res.json();
      if (json.status === "error") throw new Error(json.message);
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: data ? "20px" : "0" }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600, color: "var(--text)", margin: 0 }}>
            NIM Connectivity Check
          </h3>
          <p style={{ fontSize: "12px", color: "var(--text-faint)", margin: "4px 0 0" }}>
            Live test of each pipeline step against NVIDIA NIM API
          </p>
        </div>
        <button
          onClick={check}
          disabled={loading}
          style={{
            padding: "8px 16px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)",
            background: loading ? "var(--surface-sunken)" : "rgba(201, 169, 98, 0.08)",
            color: loading ? "var(--text-faint)" : "var(--color-gold)",
            fontSize: "13px",
            fontFamily: "var(--font-sans)",
            cursor: loading ? "wait" : "pointer",
            fontWeight: 500,
            transition: "all .15s ease",
          }}
        >
          {loading ? "Testing..." : data ? "Re-check" : "Check NIM Health"}
        </button>
      </div>

      {error && (
        <p style={{ fontSize: "13px", color: "var(--color-red)", margin: 0 }}>{error}</p>
      )}

      {data && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Summary bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              background: data.status === "healthy" ? "rgba(34, 197, 94, 0.06)" : "rgba(239, 68, 68, 0.06)",
              border: `1px solid ${data.status === "healthy" ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
            }}
          >
            <span style={{ fontSize: "12px", fontWeight: 600, color: data.status === "healthy" ? "#22c55e" : "#ef4444", textTransform: "uppercase" as const }}>
              {data.status}
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-faint)" }}>
              {data.healthy}/{data.total} pipeline steps responding
            </span>
            <span style={{ fontSize: "11px", color: "var(--text-faint)", marginLeft: "auto", fontFamily: "var(--font-mono)" }}>
              {new Date(data.checkedAt).toLocaleTimeString()}
            </span>
          </div>

          {/* Per-step results */}
          {data.results.map((r) => (
            <div
              key={r.step}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                border: `1px solid ${r.ok ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)"}`,
                background: r.ok ? "transparent" : "rgba(239, 68, 68, 0.03)",
              }}
            >
              {/* Step number */}
              <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-faint)", minWidth: "18px" }}>
                {String(r.step).padStart(2, "0")}
              </span>

              {/* Status dot */}
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: r.ok ? "#22c55e" : "#ef4444", flexShrink: 0 }} />

              {/* Agent name */}
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", minWidth: "130px" }}>
                {r.agent}
              </span>

              {/* Model */}
              <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-soft)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {r.model}
              </span>

              {/* Latency */}
              <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: r.latency < 5000 ? "var(--text-faint)" : "var(--color-gold)", flexShrink: 0, minWidth: "55px", textAlign: "right" as const }}>
                {r.latency}ms
              </span>

              {/* Error badge */}
              {!r.ok && r.errorClass && (
                <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "100px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", fontWeight: 500, flexShrink: 0 }}>
                  {r.errorClass}
                </span>
              )}
            </div>
          ))}

          {/* Troubleshooting */}
          {data.results.filter(r => !r.ok).length > 0 && (
            <div style={{ marginTop: "4px" }}>
              <h4 style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-soft)", margin: "0 0 6px", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
                Troubleshooting
              </h4>
              {data.results.filter(r => !r.ok).map((r) => (
                <div key={r.step} style={{ fontSize: "12px", color: "var(--text-faint)", marginBottom: "6px", lineHeight: "1.5" }}>
                  <strong style={{ color: "var(--text-soft)" }}>Step {r.step} ({r.agent})</strong>: {r.fix}
                  {r.error && <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", display: "block", marginTop: "2px", opacity: 0.7 }}>{r.error}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
