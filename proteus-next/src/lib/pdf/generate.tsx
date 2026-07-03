"use client";

import { pdf } from "@react-pdf/renderer";
import { CoverLetterPDF, CoverLetterData } from "./CoverLetterPDF";
import { TextDocumentPDF, TextDocumentData } from "./TextDocumentPDF";

export async function generateCoverLetterPDF(data: CoverLetterData): Promise<Blob> {
  const doc = <CoverLetterPDF data={data} />;
  return await pdf(doc).toBlob();
}

export async function generateTextPDF(data: TextDocumentData): Promise<Blob> {
  const doc = <TextDocumentPDF data={data} />;
  return await pdf(doc).toBlob();
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
