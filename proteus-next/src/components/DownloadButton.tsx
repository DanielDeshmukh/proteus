"use client";

import { useState, useRef, useEffect } from "react";
import { FiDownload } from "react-icons/fi";

export function DownloadButton({ content, filename, isCoverLetter = false, candidateName, jobTitle }: { content: string; filename: string; isCoverLetter?: boolean; candidateName?: string; jobTitle?: string }) {
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
      const { generateCoverLetterPDF, generateTextPDF, downloadBlob } = await import("@/lib/pdf/generate");

      if (isCoverLetter) {
        const blob = await generateCoverLetterPDF({ content });
        downloadBlob(blob, `${filename}.pdf`);
      } else {
        const blob = await generateTextPDF({ title: filename, content });
        downloadBlob(blob, `${filename}.pdf`);
      }
    } else {
      const docx = await import("docx");
      const { Document: DocxDoc, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = docx;

      if (isCoverLetter) {
        // LLM content already has greeting, body, closing — render as-is
        const children = [];

        // Header — dynamic name + role
        const displayName = candidateName || "Candidate";
        const displayRole = jobTitle || "";
        children.push(
          new Paragraph({
            children: [new TextRun({ text: displayName, bold: true, size: 28, font: "Calibri" })],
            spacing: { after: 40 },
          })
        );
        if (displayRole) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: displayRole.toUpperCase(), bold: true, size: 18, font: "Calibri", color: "C9A962" })],
              spacing: { after: 80 },
            })
          );
        }

        // Date
        children.push(
          new Paragraph({
            children: [new TextRun({ text: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), size: 18, font: "Calibri", color: "666666" })],
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
          })
        );

        // Body — raw LLM content (includes greeting, paragraphs, closing)
        const paragraphs = content.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
        for (const para of paragraphs) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: para.trim(), size: 22, font: "Calibri" })],
              spacing: { after: 160 },
            })
          );
        }

        const doc = new DocxDoc({
          sections: [{
            children,
            properties: {
              page: {
                margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 },
              },
            },
          }],
        });

        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}.docx`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Generic text DOCX
        const paragraphs = content.split("\n").map(
          (line) => new Paragraph({
            children: [new TextRun({ text: line, font: "Calibri", size: 22 })],
            spacing: { after: 80 },
          })
        );
        const doc = new DocxDoc({ sections: [{ children: paragraphs }] });
        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}.docx`;
        a.click();
        URL.revokeObjectURL(url);
      }
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
