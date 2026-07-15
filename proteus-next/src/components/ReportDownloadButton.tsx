"use client";

import { useState } from "react";
import { FiDownload } from "react-icons/fi";
import { generateAnalysisReportPDF, downloadBlob } from "@/lib/pdf/generate";
import type { AnalysisReportData } from "@/lib/pdf/AnalysisReportPDF";

export function ReportDownloadButton({ data, filename }: { data: AnalysisReportData; filename: string }) {
  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const blob = await generateAnalysisReportPDF(data);
      downloadBlob(blob, `${filename}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={generating}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        background: generating ? "var(--surface-sunken)" : "rgba(201, 169, 98, 0.10)",
        border: "1px solid rgba(201, 169, 98, 0.2)",
        borderRadius: "var(--radius-md)",
        color: "var(--color-gold)",
        padding: "6px 14px",
        fontSize: "12px",
        fontFamily: "var(--font-sans)",
        fontWeight: 500,
        cursor: generating ? "not-allowed" : "pointer",
        transition: "all .15s ease",
        opacity: generating ? 0.7 : 1,
      }}
    >
      <FiDownload size={14} />
      <span>{generating ? "Generating..." : "Download Report"}</span>
    </button>
  );
}
