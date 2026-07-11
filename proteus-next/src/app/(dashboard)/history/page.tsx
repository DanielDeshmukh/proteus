"use client";

import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/Card";
import { Spinner } from "@/components/Spinner";
import { Toast } from "@/components/Toast";
import { HistoryDetail } from "@/components/HistoryDetail";
import { apiGet, apiDelete } from "@/lib/api";

interface Run {
  id: number;
  created_at: string;
  jd_text: string | null;
  jd_source: string | null;
  overall_score: number | null;
  status: string;
}

export default function HistoryPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  async function fetchHistory() {
    setLoading(true);
    setFetchFailed(false);
    try {
      const data = await apiGet("/api/history?limit=50");
      setRuns(data.runs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
      setFetchFailed(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (e: React.MouseEvent, runId: number) => {
    e.stopPropagation();
    if (!confirm("Delete this run?")) return;
    try {
      await apiDelete(`/api/history/${runId}`);
      setRuns((prev) => prev.filter((r) => r.id !== runId));
      if (selectedId === runId) setSelectedId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const filteredRuns = runs.filter((run) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      run.jd_text?.toLowerCase().includes(q) ||
      run.jd_source?.toLowerCase().includes(q)
    );
  });

  const getScoreColor = (score: number) => {
    if (score >= 0.75) return "var(--color-gold-light)";
    if (score >= 0.5) return "var(--color-gold)";
    return "var(--text-faint)";
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; color: string; border: string }> = {
      completed: { bg: "rgba(201, 169, 98, 0.10)", color: "var(--color-gold)", border: "rgba(201, 169, 98, 0.2)" },
      partial: { bg: "rgba(201, 169, 98, 0.08)", color: "var(--color-gold)", border: "rgba(201, 169, 98, 0.15)" },
      running: { bg: "rgba(59, 130, 246, 0.10)", color: "#60a5fa", border: "rgba(59, 130, 246, 0.2)" },
      failed: { bg: "rgba(220, 53, 69, 0.10)", color: "#ff6b6b", border: "rgba(220, 53, 69, 0.2)" },
      pending: { bg: "rgba(156, 163, 175, 0.10)", color: "#9ca3af", border: "rgba(156, 163, 175, 0.2)" },
    };
    return badges[status] || badges.pending;
  };

  // Detail view
  if (selectedId !== null) {
    return (
      <Layout>
        <HistoryDetail runId={selectedId} onClose={() => setSelectedId(null)} />
      </Layout>
    );
  }

  // List view
  return (
    <Layout>
      <section style={{ padding: "48px 0 32px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "28px", color: "var(--text)", marginBottom: "8px" }}>
          History
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-soft)" }}>
          Click any run to view full results
        </p>
      </section>

      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}

      <div style={{ marginBottom: "24px" }}>
        <input
          type="text"
          placeholder="Search runs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            background: "var(--surface-sunken)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            color: "var(--text)",
            fontFamily: "var(--font-sans)",
            fontSize: "13.5px",
            padding: "12px 16px",
          }}
        />
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "48px" }}>
          <Spinner size="lg" />
        </div>
      ) : filteredRuns.length === 0 ? (
        <Card>
          <div style={{ textAlign: "center", padding: "32px" }}>
            <p style={{ color: "var(--text-faint)" }}>
              {fetchFailed ? "Failed to load history" : search ? "No runs match your search" : "No analysis runs yet"}
            </p>
            {fetchFailed && (
              <button
                onClick={() => { setFetchFailed(false); fetchHistory(); }}
                style={{
                  marginTop: "12px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "13px",
                  color: "var(--color-gold)",
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: "8px 20px",
                  cursor: "pointer",
                }}
              >
                Retry
              </button>
            )}
          </div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredRuns.map((run) => {
            const badge = getStatusBadge(run.status);
            return (
              <Card key={run.id}>
                <div
                  onClick={() => setSelectedId(run.id)}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "11px",
                          padding: "2px 8px",
                          borderRadius: "100px",
                          background: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                        }}
                      >
                        {run.status}
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-faint)" }}>
                        #{run.id}
                      </span>
                    </div>
                    <p style={{ fontSize: "14px", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {run.jd_text?.substring(0, 80) || "No JD text"}
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--text-faint)", marginTop: "4px" }}>
                      {new Date(run.created_at).toLocaleDateString()} &middot; {run.jd_source}
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginLeft: "16px" }}>
                    {run.overall_score != null && (
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "14px",
                          fontWeight: 600,
                          color: getScoreColor(run.overall_score),
                        }}
                      >
                        {Math.round(run.overall_score * 100)}%
                      </span>
                    )}
                    <button
                      onClick={(e) => handleDelete(e, run.id)}
                      style={{
                        background: "var(--surface-sunken)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-md)",
                        color: "var(--text-soft)",
                        padding: "6px 14px",
                        fontSize: "12px",
                        fontFamily: "var(--font-sans)",
                        cursor: "pointer",
                        transition: "all .15s ease",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
