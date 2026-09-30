"use client";

import { useEffect, useRef, useState } from "react";
import { FiDownload } from "react-icons/fi";
import { applyRewrites, buildResumeFilename, type RewriteCandidate } from "@/lib/resume-export";

type Format = "txt" | "docx" | "pdf";

const FORMATS: Array<{ id: Format; label: string }> = [
  { id: "txt", label: "Plain text (.txt)" },
  { id: "docx", label: "Word (.docx)" },
  { id: "pdf", label: "PDF" },
];

export function TailoredResumeDownload({
  resumeText,
  accepted,
  candidateLabel,
}: {
  resumeText: string;
  accepted: RewriteCandidate[];
  candidateLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<Format | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const download = async (format: Format) => {
    setBusy(format);
    setError(null);
    try {
      const { text } = applyRewrites(resumeText, accepted);
      const { parseAtsResume } = await import("@/lib/resume-ats");
      const ats = parseAtsResume(text);
      const filename = buildResumeFilename(candidateLabel);

      if (format === "txt") {
        const { renderResumeTxt, downloadBlob } = await import("@/lib/resume-render");
        downloadBlob(renderResumeTxt(ats), `${filename}.txt`);
      } else if (format === "docx") {
        const { renderResumeDocx, downloadBlob } = await import("@/lib/resume-render");
        downloadBlob(await renderResumeDocx(ats), `${filename}.docx`);
      } else {
        const { renderResumePdf, downloadBlob } = await import("@/lib/resume-render");
        downloadBlob(await renderResumePdf(ats), `${filename}.pdf`);
      }
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(!open)}
        disabled={busy !== null}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          background: "var(--surface-sunken)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          color: "var(--text-soft)",
          padding: "6px 12px",
          fontSize: "12px",
          fontFamily: "var(--font-sans)",
          cursor: busy ? "wait" : "pointer",
          opacity: busy ? 0.6 : 1,
          transition: "all .15s ease",
        }}
      >
        <FiDownload size={14} />
        <span>{busy ? "Exporting..." : "Tailored resume"}</span>
      </button>

      {error && (
        <span style={{ position: "absolute", top: "100%", right: 0, marginTop: "6px", fontSize: "11px", color: "#ff6b6b", whiteSpace: "nowrap" }}>
          {error}
        </span>
      )}

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "6px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            zIndex: 20,
            minWidth: "170px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          {FORMATS.map((f, i) => (
            <button
              key={f.id}
              onClick={() => download(f.id)}
              style={{
                display: "block",
                width: "100%",
                padding: "10px 16px",
                background: "transparent",
                border: "none",
                borderTop: i === 0 ? "none" : "1px solid var(--border)",
                color: "var(--text)",
                fontSize: "13px",
                fontFamily: "var(--font-sans)",
                textAlign: "left",
                cursor: "pointer",
                transition: "background .15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-sunken)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
