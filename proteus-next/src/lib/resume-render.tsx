// src/lib/resume-render.tsx
// Renders a parsed ATS resume to .txt / .docx / .pdf. Only imported on demand
// so the docx and react-pdf bundles never load until a download is requested.

import type { AtsResume } from "@/lib/resume-ats";
import { bulletText, entryHead, renderAtsText, splitParagraphs } from "@/lib/resume-ats";

const FONT = "Calibri";
const BODY = "333333";
const HEADING_COLOR = "1F3864";
// docx sizes are half-points: 10.5pt body, 13pt heading, 20pt name
const NAME_SIZE = 40;
const HEADING_SIZE = 26;
const BODY_SIZE = 21;
// 0.75in margins in twips (1440 twips = 1in)
const MARGIN = 1080;

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function renderResumeTxt(ats: AtsResume): Blob {
  return new Blob([renderAtsText(ats)], { type: "text/plain;charset=utf-8" });
}

export async function renderResumeDocx(ats: AtsResume): Promise<Blob> {
  const { Document, Packer, Paragraph, TextRun } = await import("docx");
  const children: InstanceType<typeof Paragraph>[] = [];

  if (ats.name) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: ats.name, bold: true, size: NAME_SIZE, font: FONT, color: "000000" })],
        spacing: { after: 60 },
      })
    );
  }
  if (ats.contact.length) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: ats.contact.join(" | "), size: BODY_SIZE, font: FONT, color: BODY })],
        spacing: { after: 140 },
      })
    );
  }

  for (const section of ats.sections) {
    if (section.heading) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: section.heading, bold: true, size: HEADING_SIZE, font: FONT, color: HEADING_COLOR })],
          spacing: { before: 240, after: 100 },
        })
      );
    }

    if (section.entries) {
      for (const entry of section.entries) {
        const head = entryHead(entry);
        if (head) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: head, bold: true, size: BODY_SIZE, font: FONT, color: "000000" })],
              spacing: { before: 80, after: 20 },
            })
          );
        }
        if (entry.dates) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: entry.dates, italics: true, size: BODY_SIZE, font: FONT, color: BODY })],
              spacing: { after: 40 },
            })
          );
        }
        for (const line of entry.body) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: bulletText(line), size: BODY_SIZE, font: FONT, color: BODY })],
              spacing: { after: 40 },
            })
          );
        }
      }
    } else {
      for (const para of splitParagraphs(section.lines)) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: para, size: BODY_SIZE, font: FONT, color: BODY })],
            spacing: { after: 80 },
          })
        );
      }
    }
  }

  const doc = new Document({
    sections: [{ children, properties: { page: { margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN } } } }],
  });
  return await Packer.toBlob(doc);
}

export async function renderResumePdf(ats: AtsResume): Promise<Blob> {
  const { pdf } = await import("@react-pdf/renderer");
  const { ResumePDF } = await import("@/lib/pdf/ResumePDF");
  return await pdf(<ResumePDF ats={ats} />).toBlob();
}
