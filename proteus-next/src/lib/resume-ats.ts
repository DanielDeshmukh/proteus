// src/lib/resume-ats.ts
// Detects the contact block, section headings, and work-experience entries in
// plain resume text so exports can be rendered in an ATS-safe layout.
//
// Pure: no React, no DOM, no LLM.

export interface AtsEntry {
  title: string;
  company: string | null;
  location: string | null;
  dates: string | null;
  body: string[]; // raw lines (marker preserved) under this entry
}

export interface AtsSection {
  heading: string; // canonical ALL-CAPS heading, "" when unknown
  lines: string[]; // raw lines under the heading (blanks kept as separators)
  entries: AtsEntry[] | null; // populated only for experience sections
}

export interface AtsResume {
  name: string;
  contact: string[];
  sections: AtsSection[];
}

// ATS "trigger words" → canonical section titles
const HEADING_MAP: Record<string, string> = {
  summary: "PROFESSIONAL SUMMARY",
  "professional summary": "PROFESSIONAL SUMMARY",
  "career summary": "PROFESSIONAL SUMMARY",
  "about me": "PROFESSIONAL SUMMARY",
  objective: "PROFESSIONAL SUMMARY",
  "career objective": "PROFESSIONAL SUMMARY",
  profile: "PROFESSIONAL SUMMARY",
  experience: "WORK EXPERIENCE",
  "work experience": "WORK EXPERIENCE",
  "professional experience": "WORK EXPERIENCE",
  employment: "WORK EXPERIENCE",
  "employment history": "WORK EXPERIENCE",
  "work history": "WORK EXPERIENCE",
  "career history": "WORK EXPERIENCE",
  "career journey": "WORK EXPERIENCE",
  "where i've been": "WORK EXPERIENCE",
  education: "EDUCATION",
  "academic history": "EDUCATION",
  "academic background": "EDUCATION",
  "education and training": "EDUCATION",
  skills: "SKILLS",
  "core competencies": "SKILLS",
  "technical skills": "SKILLS",
  "key skills": "SKILLS",
  "tools i use": "SKILLS",
  "skills and tools": "SKILLS",
  projects: "PROJECTS",
  "personal projects": "PROJECTS",
  "key projects": "PROJECTS",
  certifications: "CERTIFICATIONS",
  certificates: "CERTIFICATIONS",
  licenses: "CERTIFICATIONS",
  "licenses and certifications": "CERTIFICATIONS",
  achievements: "ACHIEVEMENTS",
  awards: "ACHIEVEMENTS",
  activities: "ACTIVITIES",
  languages: "LANGUAGES",
  volunteer: "VOLUNTEER EXPERIENCE",
  "volunteer experience": "VOLUNTEER EXPERIENCE",
  references: "REFERENCES",
};

const BULLET_RE = /^(\s*)([-*•–—▪◦>]|\d+[.)]|[a-zA-Z][.)])(\s+)/;

const MONTHY = String.raw`(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}`;
const DATE_SIDE = String.raw`(?:${MONTHY}|\d{1,2}/\d{4}|\d{4}|present|current|now)`;
const DATE_LINE_RE = new RegExp(String.raw`^\s*${DATE_SIDE}\s*[–—-]\s*${DATE_SIDE}\.?\s*$`, "i");
// Trailing dates fused onto an entry line: "…, Mumbai Aug 2026 – Present"
const TAIL_DATE_RANGE = new RegExp(String.raw`\s+(${DATE_SIDE}\s*[–—-]\s*${DATE_SIDE})\s*$`, "i");
const TAIL_SINGLE_DATE = new RegExp(String.raw`\s+(${MONTHY})\s*$`, "i");

// A `Label:` line starts its own block ("Certifications: …", "Skills: …").
const LABEL_LINE_RE = /^[A-Za-z][A-Za-z0-9 /&+().'-]{0,40}:\s+\S/;

const CONTACT_RE =
  /@|https?:\/\/|\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}|\b\d{3}-\d{4}\b|\blinkedin\b|\bgithub\b/i;

/** True when the line reads as a finished sentence/bullet. */
function hasTerminalPunct(s: string): boolean {
  return /[.!?;:][)"'”’\]]*$/.test(s.trim());
}

/** Split fused trailing dates off an entry line's last segment. */
function stripTrailingDates(text: string): { text: string; dates: string | null } {
  const range = text.match(TAIL_DATE_RANGE);
  if (range?.index !== undefined) {
    return { text: text.slice(0, range.index).trim(), dates: range[1].trim() };
  }
  const single = text.match(TAIL_SINGLE_DATE);
  if (single?.index !== undefined) {
    return { text: text.slice(0, single.index).trim(), dates: single[1].trim() };
  }
  return { text, dates: null };
}

/** Drop the trailing "|" of a contact line so joins never show "| |". */
function cleanContactLine(t: string): string {
  return t.replace(/\s*\|\s*$/, "").trim();
}

export function isBulletLine(line: string): boolean {
  return BULLET_RE.test(line);
}

export function isDateLine(line: string): boolean {
  return DATE_LINE_RE.test(line);
}

export function stripBullet(line: string): string {
  const m = BULLET_RE.exec(line);
  return m ? line.slice(m[0].length) : line;
}

export type AtsBlockKind = "bullet" | "record" | "prose";

export interface AtsBlock {
  text: string; // merged paragraph text (marker preserved on bullets)
  kind: AtsBlockKind;
}

/** A pipe-separated record line: project title, link row, entry-style line. */
function isRecordLine(t: string): boolean {
  const pipes = (t.match(/\|/g) || []).length;
  if (pipes < 2) return false;
  const first = t.split("|")[0].trim();
  return first.length > 0 && first.length <= 40;
}

/**
 * Merge wrapped lines into blocks. A new block starts on a blank line, a
 * bullet marker, a record line (project titles) or a `Label:` line — so each
 * project and skill category stays a separate, readable unit.
 */
export function splitBlocks(lines: string[]): AtsBlock[] {
  const out: AtsBlock[] = [];
  let buf: string[] = [];
  let kind: AtsBlockKind = "prose";

  const flush = (): void => {
    if (buf.length) out.push({ text: buf.join(" "), kind });
    buf = [];
    kind = "prose";
  };

  for (const line of lines) {
    const t = line.trim();
    if (!t) {
      flush();
      continue;
    }
    if (isBulletLine(t)) {
      flush();
      kind = "bullet";
      buf = [t];
      continue;
    }
    if (isRecordLine(t)) {
      flush();
      kind = "record";
      buf = [t];
      continue;
    }
    if (LABEL_LINE_RE.test(t)) {
      flush();
      kind = "prose";
      buf = [t];
      continue;
    }
    buf.push(t);
  }
  flush();
  return out;
}

/**
 * Returns the canonical heading for a line, or null if it is not a heading.
 * Headings never contain digits, which keeps phone numbers, dates and
 * "Class of 2019" style contact lines out of the heading slot.
 */
export function detectHeading(line: string): string | null {
  const t = line.trim();
  if (!t || t.length > 45) return null;
  if (isBulletLine(t)) return null;
  if (/\d/.test(t)) return null;
  if (/[.!?]$/.test(t) && !/:$/.test(t)) return null;

  const key = t.toLowerCase().replace(/[:.\s]+$/, "").replace(/\s+/g, " ").trim();
  const mapped = HEADING_MAP[key];
  if (mapped) return mapped;

  const letters = t.replace(/[^A-Za-z]/g, "");
  if (letters.length >= 3 && letters === letters.toUpperCase()) {
    return t.replace(/[:.]+$/, "").toUpperCase();
  }
  if (/:$/.test(t)) return t.replace(/:$/, "").toUpperCase();
  return null;
}

function isExperienceHeading(heading: string): boolean {
  return /EXPERIENCE|EMPLOYMENT/i.test(heading);
}

// "Senior Engineer — Meta (2021-2024)" → title + trailing dates
function extractInlineDates(title: string): { title: string; dates: string | null } {
  const m = title.match(
    /^(.*?)[\s(]*((?:19|20)\d{2}\s*[–—-]\s*(?:(?:19|20)\d{2}|present|current))\)?$/i
  );
  if (!m || !m[1].trim()) return { title, dates: null };
  return { title: m[1].trim(), dates: m[2].trim() };
}

function parseExperience(lines: string[]): AtsEntry[] {
  const entries: AtsEntry[] = [];
  let current: AtsEntry | null = null;

  const nonBlankAfter = (i: number): string => {
    for (let k = i + 1; k < lines.length; k++) {
      const t = lines[k].trim();
      if (t) return t;
    }
    return "";
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const t = raw.trim();
    if (!t) continue;

    if (isDateLine(t) && current) {
      current.dates = t;
      continue;
    }

    const bullet = isBulletLine(t);

    if (!bullet && (t.includes("|") || isDateLine(nonBlankAfter(i)) || current === null)) {
      const parts = t.split("|").map((p) => p.trim()).filter(Boolean);
      const inline = extractInlineDates(parts[0] || t);
      let dates = inline.dates;
      // Dates fused onto the last segment: "Company, Mumbai Aug 2026 – Present"
      if (!dates && parts.length >= 2) {
        const last = parts.length - 1;
        const stripped = stripTrailingDates(parts[last]);
        if (stripped.dates) {
          dates = stripped.dates;
          if (stripped.text) parts[last] = stripped.text;
          else parts.pop();
        }
      }
      current = {
        title: inline.title,
        company: parts[1] ?? null,
        location: parts[2] ?? null,
        dates,
        body: [],
      };
      entries.push(current);
      continue;
    }

    if (current) {
      const prev = current.body.length ? current.body[current.body.length - 1] : "";
      // Unmarked lines continue the previous bullet when it is explicitly
      // indented or still unfinished (wrapped flush-left in the source).
      const continues =
        !bullet &&
        prev !== "" &&
        (/^\s/.test(raw) || (!hasTerminalPunct(prev) && !LABEL_LINE_RE.test(t)));
      if (continues) {
        current.body[current.body.length - 1] = `${prev.trimEnd()} ${t}`;
      } else {
        current.body.push(t);
      }
    } else {
      // stray bullet before any entry — keep it as its own untitled entry
      current = { title: "", company: null, location: null, dates: null, body: [t] };
      entries.push(current);
    }
  }

  return entries;
}

function buildSection(heading: string, lines: string[]): AtsSection {
  const trimmed = [...lines];
  while (trimmed.length && !trimmed[0].trim()) trimmed.shift();
  while (trimmed.length && !trimmed[trimmed.length - 1].trim()) trimmed.pop();

  const meaningful = trimmed.filter((l) => l.trim());
  const entries = isExperienceHeading(heading) && meaningful.length > 0 ? parseExperience(meaningful) : null;

  return { heading, lines: trimmed, entries };
}

export function parseAtsResume(text: string): AtsResume {
  const rawLines = (text || "").split("\n").map((l) => l.replace(/\s+$/, ""));

  let i = 0;
  while (i < rawLines.length && !rawLines[i].trim()) i++;
  const name = (rawLines[i] || "").trim();
  i++;

  const chunks: Array<{ heading: string | null; lines: string[] }> = [{ heading: null, lines: [] }];

  for (; i < rawLines.length; i++) {
    const line = rawLines[i];
    const heading = line.trim() ? detectHeading(line) : null;
    if (heading) {
      chunks.push({ heading, lines: [] });
      continue;
    }
    chunks[chunks.length - 1].lines.push(line);
  }

  const hasHeadings = chunks.some((c) => c.heading !== null);
  const contact: string[] = [];
  const sections: AtsSection[] = [];

  if (!hasHeadings) {
    // No headings at all — split contact-looking lines out of the body
    const body: string[] = [];
    for (const line of chunks[0].lines) {
      const t = line.trim();
      if (t && CONTACT_RE.test(t)) contact.push(cleanContactLine(t));
      else body.push(line);
    }
    sections.push(buildSection("", body));
    return { name, contact, sections };
  }

  for (const chunk of chunks) {
    if (chunk.heading === null) {
      for (const line of chunk.lines) {
        const t = cleanContactLine(line.trim());
        if (t) contact.push(t);
      }
    } else {
      sections.push(buildSection(chunk.heading, chunk.lines));
    }
  }

  return { name, contact, sections };
}

/** "Job Title | Company | City, State" for an experience entry. */
export function entryHead(e: AtsEntry): string {
  return [e.title, e.company, e.location].filter(Boolean).join(" | ");
}

/** Normalise a body line to its rendered form (round bullet or paragraph). */
export function bulletText(line: string): string {
  return isBulletLine(line) ? `• ${stripBullet(line).trim()}` : line;
}

/** Plain-text rendering of the tailored resume (used for the .txt export). */
export function renderAtsText(ats: AtsResume): string {
  const out: string[] = [];
  if (ats.name) out.push(ats.name);
  if (ats.contact.length) out.push(ats.contact.join(" | "));
  for (const section of ats.sections) {
    out.push("");
    if (section.heading) out.push(section.heading);
    if (section.entries) {
      for (const e of section.entries) {
        out.push("");
        const head = entryHead(e);
        if (head) out.push(head);
        if (e.dates) out.push(e.dates);
        for (const line of e.body) out.push(bulletText(line));
      }
    } else {
      for (const block of splitBlocks(section.lines)) {
        if (block.kind === "record" && out[out.length - 1] !== "") out.push("");
        out.push(block.text);
      }
    }
  }
  return out.join("\n");
}
