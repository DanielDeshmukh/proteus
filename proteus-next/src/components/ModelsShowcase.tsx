"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/Card";
import { Spinner } from "@/components/Spinner";

interface ModelStep {
  step: number;
  agent: string;
  role: string;
  task: string;
  work: string;
  icon: string;
  model: string;
}

export function ModelsShowcase() {
  const [models, setModels] = useState<ModelStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/models")
      .then((r) => r.json())
      .then((data) => {
        setModels(data.models || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "48px" }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <p style={{ textAlign: "center", color: "var(--text-faint)", padding: "24px" }}>
          Failed to load models: {error}
        </p>
      </Card>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
      {models.map((m, i) => (
        <div key={m.step} style={{ display: "flex", gap: "0" }}>
          {/* Vertical line + step number */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "48px",
              flexShrink: 0,
            }}
          >
            {/* Step circle */}
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(201, 169, 98, 0.12)",
                border: "1px solid rgba(201, 169, 98, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--color-gold)",
                flexShrink: 0,
              }}
            >
              {m.icon}
            </div>
            {/* Connecting line */}
            {i < models.length - 1 && (
              <div
                style={{
                  width: "1px",
                  flex: 1,
                  background: "rgba(201, 169, 98, 0.15)",
                  minHeight: "24px",
                }}
              />
            )}
          </div>

          {/* Content card */}
          <div style={{ flex: 1, paddingBottom: i < models.length - 1 ? "24px" : "0" }}>
            <Card>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {/* Agent name + task */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "var(--text)",
                    }}
                  >
                    {m.agent}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--text-faint)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {m.task}
                  </span>
                </div>

                {/* Model name badge */}
                <div>
                  <span
                    style={{
                      display: "inline-block",
                      fontFamily: "var(--font-mono)",
                      fontSize: "12px",
                      padding: "3px 10px",
                      borderRadius: "100px",
                      background: "rgba(201, 169, 98, 0.08)",
                      border: "1px solid rgba(201, 169, 98, 0.2)",
                      color: "var(--color-gold)",
                    }}
                  >
                    {m.model}
                  </span>
                </div>

                {/* What it does */}
                <p
                  style={{
                    fontSize: "13px",
                    lineHeight: "1.6",
                    color: "var(--text-soft)",
                    margin: 0,
                  }}
                >
                  {m.work}
                </p>
              </div>
            </Card>
          </div>
        </div>
      ))}
    </div>
  );
}
