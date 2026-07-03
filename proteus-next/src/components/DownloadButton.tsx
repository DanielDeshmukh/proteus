"use client";

import { useState, useRef, useEffect } from "react";
import { FiDownload } from "react-icons/fi";

export function DownloadButton({ content, filename }: { content: string; filename: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const download = async (fmt: "pdf" | "docx") => {
    if (fmt === "pdf") {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      const lines = doc.splitTextToSize(content, 180);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      let y = 20;
      for (const line of lines) {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(line, 15, y);
        y += 6;
      }
      doc.save(`${filename}.pdf`);
    } else {
      const docx = await import("docx");
      const { Document, Packer, Paragraph, TextRun } = docx;
      const paragraphs = content.split("\n").map(
        (line) => new Paragraph({
          children: [new TextRun({ text: line, font: "Arial", size: 24 })],
          spacing: { after: 120 },
        })
      );
      const doc = new Document({ sections: [{ children: paragraphs }] });
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(!open)}
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
          cursor: "pointer",
          transition: "all .15s ease",
        }}
      >
        <FiDownload size={14} />
        <span>Download</span>
      </button>

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
            minWidth: "140px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          <button
            onClick={() => download("pdf")}
            style={{
              display: "block",
              width: "100%",
              padding: "10px 16px",
              background: "transparent",
              border: "none",
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
            PDF
          </button>
          <button
            onClick={() => download("docx")}
            style={{
              display: "block",
              width: "100%",
              padding: "10px 16px",
              background: "transparent",
              border: "none",
              borderTop: "1px solid var(--border)",
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
            DOCX
          </button>
        </div>
      )}
    </div>
  );
}
