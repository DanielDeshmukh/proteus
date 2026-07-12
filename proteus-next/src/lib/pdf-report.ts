import jsPDF from "jspdf";

// ─── PROTEUS Theme ──────────────────────────────────────

const THEME = {
  bg: [17, 19, 21] as [number, number, number],
  surface: [26, 29, 33] as [number, number, number],
  gold: [201, 169, 98] as [number, number, number],
  goldLight: [224, 200, 122] as [number, number, number],
  text: [240, 240, 240] as [number, number, number],
  textSoft: [156, 163, 175] as [number, number, number],
  textFaint: [107, 114, 128] as [number, number, number],
  green: [34, 197, 94] as [number, number, number],
  red: [239, 68, 68] as [number, number, number],
  amber: [245, 158, 11] as [number, number, number],
};

// ─── Types ──────────────────────────────────────────────

interface ReportData {
  runId: number;
  createdAt: string;
  jdText: string | null;
  jdSource: string | null;
  resumeText: string | null;
  resumeSource: string | null;
  overallScore: number | null;
  sectionScores: Record<string, number> | null;
  gapAnalysis: {
    gaps: Array<{
      requirement: string;
      status: string;
      similarity_score: number;
      category: string;
      matched_evidence: string | null;
    }>;
    matched_count: number;
    partial_count: number;
    missing_count: number;
    total_requirements: number;
  } | null;
  rewriteSuggestions: {
    suggestions: Array<{
      original_bullet: string;
      suggested_rewrite: string;
      rationale: string;
      target_requirement: string;
      impact_score: number;
    }>;
  } | null;
  coverLetter: {
    full_letter: string;
    word_count: number;
    tone: string;
  } | null;
  actionList: Array<{
    priority: number;
    action: string;
    impact: string;
    category: string;
  }> | null;
}

// ─── Helpers ────────────────────────────────────────────

function setFont(doc: jsPDF, style: "normal" | "bold" | "italic" = "normal", size: number = 10) {
  doc.setFont("helvetica", style === "italic" ? "italic" : style);
  doc.setFontSize(size);
}

function ensurePage(doc: jsPDF, currentY: number, needed: number = 20): number {
  if (currentY > 297 - needed - 17) {
    doc.addPage();
    doc.setFillColor(...THEME.bg);
    doc.rect(0, 0, 210, 297, "F");
    return 20;
  }
  return currentY;
}

function drawHeader(doc: jsPDF, y: number): number {
  // Gold accent line
  doc.setFillColor(...THEME.gold);
  doc.rect(0, 0, 210, 3, "F");

  // Title
  setFont(doc, "bold", 22);
  doc.setTextColor(...THEME.gold);
  doc.text("PROTEUS", 20, y);

  // Subtitle
  setFont(doc, "normal", 9);
  doc.setTextColor(...THEME.textFaint);
  doc.text("AI RESUME ANALYSIS REPORT", 20, y + 6);

  // Right side - date
  setFont(doc, "normal", 8);
  doc.setTextColor(...THEME.textFaint);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, 200, y, { align: "right" });

  // Divider
  doc.setDrawColor(...THEME.gold);
  doc.setLineWidth(0.3);
  doc.line(20, y + 10, 190, y + 10);

  return y + 18;
}

function drawSectionTitle(doc: jsPDF, y: number, title: string): number {
  // Gold bullet
  doc.setFillColor(...THEME.gold);
  doc.circle(24, y - 1, 1.5, "F");

  setFont(doc, "bold", 12);
  doc.setTextColor(...THEME.gold);
  doc.text(title, 30, y);

  // Underline
  doc.setDrawColor(...THEME.gold);
  doc.setLineWidth(0.2);
  doc.line(30, y + 2, 190, y + 2);

  return y + 8;
}

function drawScoreCircle(doc: jsPDF, x: number, y: number, score: number, label: string) {
  const color = score >= 75 ? THEME.green : score >= 50 ? THEME.gold : THEME.red;

  // Circle background
  doc.setFillColor(...THEME.surface);
  doc.setDrawColor(...color);
  doc.setLineWidth(0.8);
  doc.circle(x, y, 12, "FD");

  // Score text
  setFont(doc, "bold", 14);
  doc.setTextColor(...color);
  doc.text(`${score}`, x, y + 1, { align: "center" });

  // Label
  setFont(doc, "normal", 7);
  doc.setTextColor(...THEME.textFaint);
  doc.text(label, x, y + 16, { align: "center" });
}

function wrapText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, options?: { fontSize?: number; color?: [number, number, number] }): number {
  const fontSize = options?.fontSize || 9;
  const color = options?.color || THEME.textSoft;

  setFont(doc, "normal", fontSize);
  doc.setTextColor(...color);

  const lines = doc.splitTextToSize(text, maxWidth);
  let currentY = y;

  for (const line of lines) {
    if (currentY > 270) {
      doc.addPage();
      doc.setFillColor(...THEME.bg);
      doc.rect(0, 0, 210, 297, "F");
      currentY = 20;
    }
    doc.text(line, x, currentY);
    currentY += fontSize * 0.45;
  }

  return currentY;
}

// ─── Main Generator ─────────────────────────────────────

export function generateReport(data: ReportData): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // Background
  doc.setFillColor(...THEME.bg);
  doc.rect(0, 0, 210, 297, "F");

  let y = 20;

  // Header
  y = drawHeader(doc, y);

  // ─── Score Section ────────────────────────────────────
  if (data.overallScore != null) {
    y = drawSectionTitle(doc, y, "MATCH SCORE");

    const scorePercent = Math.round(data.overallScore * 100);
    drawScoreCircle(doc, 50, y + 14, scorePercent, "Overall");

    // Section scores
    if (data.sectionScores) {
      let sx = 90;
      const entries = Object.entries(data.sectionScores);
      for (const [key, value] of entries.slice(0, 4)) {
        const percent = Math.round(value * 100);
        drawScoreCircle(doc, sx, y + 14, percent, key.substring(0, 8));
        sx += 28;
      }
    }

    y += 38;

    // Score interpretation
    setFont(doc, "normal", 9);
    doc.setTextColor(...THEME.textSoft);
    const interpretation = scorePercent >= 75
      ? "Strong match — your resume aligns well with this role."
      : scorePercent >= 50
        ? "Moderate match — some gaps to address."
        : "Weak match — significant gaps to address.";
    doc.text(interpretation, 20, y);
    y += 10;
  }

  // ─── Gap Analysis ─────────────────────────────────────
  if (data.gapAnalysis) {
    y = drawSectionTitle(doc, y, "GAP ANALYSIS");

    // Summary stats
    const ga = data.gapAnalysis;
    setFont(doc, "bold", 9);
    doc.setTextColor(...THEME.green);
    doc.text(`Matched: ${ga.matched_count}`, 20, y);
    doc.setTextColor(...THEME.gold);
    doc.text(`Partial: ${ga.partial_count}`, 70, y);
    doc.setTextColor(...THEME.red);
    doc.text(`Missing: ${ga.missing_count}`, 120, y);
    doc.setTextColor(...THEME.textFaint);
    doc.text(`/ ${ga.total_requirements} total`, 160, y);
    y += 6;

    // Top gaps
    const sortedGaps = [...ga.gaps].sort((a, b) => a.similarity_score - b.similarity_score);
    const topGaps = sortedGaps.slice(0, 10);

    for (const gap of topGaps) {
      y = ensurePage(doc, y, 15);

      const statusColor = gap.status === "matched" ? THEME.green : gap.status === "partial" ? THEME.gold : THEME.red;

      // Status dot
      doc.setFillColor(...statusColor);
      doc.circle(23, y - 1, 1.2, "F");

      // Requirement
      setFont(doc, "normal", 8);
      doc.setTextColor(...THEME.text);
      const reqLines = doc.splitTextToSize(gap.requirement, 120);
      doc.text(reqLines[0], 27, y);
      y += 3.5;

      // Similarity score
      setFont(doc, "normal", 7);
      doc.setTextColor(...THEME.textFaint);
      doc.text(`${Math.round(gap.similarity_score * 100)}% match · ${gap.category}`, 27, y);
      y += 5;
    }

    y += 5;
  }

  // ─── Rewrite Suggestions ──────────────────────────────
  if (data.rewriteSuggestions && data.rewriteSuggestions.suggestions.length > 0) {
    y = drawSectionTitle(doc, y, "REWRITE SUGGESTIONS");

    const topRewrites = data.rewriteSuggestions.suggestions.slice(0, 5);

    for (const rewrite of topRewrites) {
      y = ensurePage(doc, y, 35);

      // Impact badge
      const impactPercent = Math.round(rewrite.impact_score * 100);
      doc.setFillColor(...THEME.gold);
      doc.roundedRect(20, y - 3, 20, 5, 1, 1, "F");
      setFont(doc, "bold", 7);
      doc.setTextColor(...THEME.bg);
      doc.text(`${impactPercent}% impact`, 30, y, { align: "center" });

      // Target
      setFont(doc, "normal", 7);
      doc.setTextColor(...THEME.textFaint);
      doc.text(rewrite.target_requirement, 45, y);
      y += 5;

      // Original (strikethrough)
      setFont(doc, "normal", 8);
      doc.setTextColor(...THEME.textFaint);
      const origLines = doc.splitTextToSize(`"${rewrite.original_bullet}"`, 155);
      doc.text(origLines[0], 24, y);
      // Strikethrough line
      const textWidth = doc.getTextWidth(origLines[0]);
      doc.setDrawColor(...THEME.textFaint);
      doc.setLineWidth(0.2);
      doc.line(24, y - 0.8, 24 + textWidth, y - 0.8);
      y += 4;

      // Suggested
      setFont(doc, "bold", 8);
      doc.setTextColor(...THEME.goldLight);
      const sugLines = doc.splitTextToSize(`"${rewrite.suggested_rewrite}"`, 155);
      doc.text(sugLines[0], 24, y);
      y += 4;

      // Rationale
      setFont(doc, "normal", 7);
      doc.setTextColor(...THEME.textFaint);
      const ratLines = doc.splitTextToSize(rewrite.rationale, 155);
      doc.text(ratLines[0], 24, y);
      y += 8;
    }
  }

  // ─── Cover Letter ─────────────────────────────────────
  if (data.coverLetter) {
    y = ensurePage(doc, y, 100);

    y = drawSectionTitle(doc, y, "COVER LETTER");

    setFont(doc, "normal", 7);
    doc.setTextColor(...THEME.textFaint);
    doc.text(`${data.coverLetter.word_count} words · ${data.coverLetter.tone} tone`, 20, y);
    y += 6;

    // Letter content in a card
    const letterLines = doc.splitTextToSize(data.coverLetter.full_letter, 155);
    const maxLinesPerPage = 40;
    let lineIndex = 0;

    while (lineIndex < letterLines.length) {
      const remainingLines = letterLines.slice(lineIndex, lineIndex + maxLinesPerPage);
      const cardHeight = Math.min(remainingLines.length * 3.5, 140);

      doc.setFillColor(...THEME.surface);
      doc.setDrawColor(...THEME.gold);
      doc.setLineWidth(0.2);
      doc.roundedRect(20, y - 2, 170, cardHeight + 4, 2, 2, "FD");

      setFont(doc, "normal", 8);
      doc.setTextColor(...THEME.textSoft);

      let ly = y + 2;
      for (const line of remainingLines) {
        doc.text(line, 24, ly);
        ly += 3.5;
      }

      y += cardHeight + 8;
      lineIndex += maxLinesPerPage;

      if (lineIndex < letterLines.length) {
        y = ensurePage(doc, y, 60);
      }
    }
  }

  // ─── Priority Actions ─────────────────────────────────
  if (data.actionList && data.actionList.length > 0) {
    y = ensurePage(doc, y, 60);

    y = drawSectionTitle(doc, y, "PRIORITY ACTIONS");

    for (const action of data.actionList.slice(0, 6)) {
      y = ensurePage(doc, y, 15);

      // Priority badge
      doc.setFillColor(...THEME.gold);
      doc.roundedRect(20, y - 3, 12, 5, 1, 1, "F");
      setFont(doc, "bold", 7);
      doc.setTextColor(...THEME.bg);
      doc.text(`P${action.priority}`, 26, y, { align: "center" });

      // Action text
      setFont(doc, "normal", 8);
      doc.setTextColor(...THEME.text);
      const actLines = doc.splitTextToSize(action.action, 148);
      doc.text(actLines[0], 35, y);
      y += 4;

      // Impact
      setFont(doc, "italic", 7);
      doc.setTextColor(...THEME.textFaint);
      const impLines = doc.splitTextToSize(action.impact, 148);
      doc.text(impLines[0], 35, y);
      y += 6;
    }
  }

  // ─── Footer ───────────────────────────────────────────
  // jsPDF v4: internal.pages is a 2D array, length = page count
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Footer line
    doc.setDrawColor(...THEME.gold);
    doc.setLineWidth(0.2);
    doc.line(20, 280, 190, 280);

    // Footer text
    setFont(doc, "normal", 7);
    doc.setTextColor(...THEME.textFaint);
    doc.text("PROTEUS — AI Resume Analyzer & Cover Letter Generator", 20, 284);
    doc.text(`Run #${data.runId} · Page ${i} of ${pageCount}`, 190, 284, { align: "right" });
    doc.text("proteus-phi.vercel.app", 105, 284, { align: "center" });
  }

  return doc;
}
