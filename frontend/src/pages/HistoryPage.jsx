import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Spinner } from "../components/Spinner";
import { apiGet, apiDelete } from "../api";

export function HistoryPage() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRun, setSelectedRun] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await apiGet("/api/history?limit=50");
      setRuns(data.runs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (runId, e) => {
    e.stopPropagation();
    if (!confirm("Delete this run?")) return;
    try {
      await apiDelete(`/api/history/${runId}`);
      setRuns(runs.filter((r) => r.id !== runId));
      if (selectedRun?.id === runId) setSelectedRun(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredRuns = runs.filter((run) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (run.jd_text && run.jd_text.toLowerCase().includes(q)) ||
      (run.jd_source && run.jd_source.toLowerCase().includes(q))
    );
  });

  const getScoreColor = (score) => {
    if (score === null || score === undefined) return "var(--text-faint)";
    if (score >= 0.75) return "var(--color-gold-light)";
    if (score >= 0.5) return "var(--color-gold)";
    return "var(--color-silver)";
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: {
        background: "rgba(201, 169, 98, 0.10)",
        color: "var(--color-gold)",
        border: "1px solid rgba(201, 169, 98, 0.25)",
      },
      partial: {
        background: "rgba(232, 213, 163, 0.14)",
        color: "var(--color-gold-light)",
        border: "1px solid rgba(232, 213, 163, 0.3)",
      },
      running: {
        background: "rgba(125, 138, 150, 0.10)",
        color: "var(--color-silver)",
        border: "1px solid rgba(125, 138, 150, 0.22)",
      },
      failed: {
        background: "rgba(220, 53, 69, 0.15)",
        color: "#ff6b6b",
        border: "1px solid rgba(220, 53, 69, 0.3)",
      },
      pending: {
        background: "rgba(125, 138, 150, 0.05)",
        color: "var(--text-faint)",
        border: "1px solid var(--border)",
      },
    };
    return styles[status] || styles.pending;
  };

  return (
    <Layout>
      {/* History header */}
      <section style={{ marginTop: "48px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "22px",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "22px",
              color: "var(--text)",
            }}
          >
            Application history
          </h2>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11.5px",
              color: "var(--text-faint)",
            }}
          >
            {runs.length} runs
          </span>
        </div>

        {/* Search */}
        <input
          type="text"
          style={{
            width: "100%",
            background: "var(--surface-sunken)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            color: "var(--text)",
            fontFamily: "var(--font-sans)",
            fontSize: "13.5px",
            padding: "12px 16px",
            marginBottom: "24px",
          }}
          placeholder="Search by JD text or source..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {error && (
          <div
            style={{
              padding: "12px 16px",
              background: "rgba(220, 53, 69, 0.15)",
              border: "1px solid rgba(220, 53, 69, 0.3)",
              borderRadius: "var(--radius-md)",
              fontSize: "13px",
              color: "#ff6b6b",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
            <Spinner size="lg" />
          </div>
        ) : filteredRuns.length === 0 ? (
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "48px 26px",
              textAlign: "center",
            }}
          >
            <p style={{ color: "var(--text-soft)", fontSize: "15.5px" }}>No analysis runs yet</p>
            <p style={{ color: "var(--text-faint)", fontSize: "13px", marginTop: "4px" }}>
              {search
                ? "No results match your search"
                : "Run your first analysis to see history here"}
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Role", "Match", "Date", "Status"].map((header) => (
                  <th
                    key={header}
                    style={{
                      textAlign: header === "Match" ? "right" : "left",
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--text-faint)",
                      padding: "0 0 14px",
                      borderBottom: "1px solid var(--border)",
                      fontWeight: 400,
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRuns.map((run) => (
                <tr
                  key={run.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedRun(selectedRun?.id === run.id ? null : run)}
                >
                  <td style={{ padding: "18px 0", borderBottom: "1px solid var(--border)" }}>
                    <div>
                      <strong
                        style={{
                          display: "block",
                          fontWeight: 600,
                          marginBottom: "3px",
                          color: "var(--text)",
                          fontSize: "13.5px",
                        }}
                      >
                        {run.jd_text ? run.jd_text.substring(0, 60) + "..." : "No JD text"}
                      </strong>
                      <span style={{ color: "var(--text-faint)", fontSize: "12px" }}>
                        {run.jd_source || "Unknown"}
                      </span>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "18px 0",
                      borderBottom: "1px solid var(--border)",
                      textAlign: "right",
                      fontFamily: "var(--font-mono)",
                      color: getScoreColor(run.overall_score),
                      fontWeight: 500,
                      fontSize: "13.5px",
                    }}
                  >
                    {run.overall_score !== null ? `${Math.round(run.overall_score * 100)}%` : "—"}
                  </td>
                  <td
                    style={{
                      padding: "18px 0",
                      borderBottom: "1px solid var(--border)",
                      fontSize: "13.5px",
                      color: "var(--text-soft)",
                    }}
                  >
                    {new Date(run.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "18px 0", borderBottom: "1px solid var(--border)" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        padding: "5px 12px",
                        borderRadius: "100px",
                        display: "inline-block",
                        ...getStatusBadge(run.status),
                      }}
                    >
                      {run.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </Layout>
  );
}
