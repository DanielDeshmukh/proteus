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

const CONTACT_RE =
  /@|https?:\/\/|\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}|\b\d{3}-\d{4}\b|\blinkedin\b|\bgithub\b/i;

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

/** Merge wrapped lines into paragraphs, split on blank lines. */
export function splitParagraphs(lines: string[]): string[] {
  const out: string[] = [];
  let buf: string[] = [];
  for (const line of lines) {
    if (line.trim()) {
      buf.push(line.trim());
    } else if (buf.length) {
      out.push(buf.join(" "));
      buf = [];
    }
  }
  if (buf.length) out.push(buf.join(" "));
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
      current = {
        title: inline.title,
        company: parts[1] ?? null,
        location: parts[2] ?? null,
        dates: inline.dates,
        body: [],
      };
      entries.push(current);
      continue;
    }

    if (current) {
      // Indented, unmarked lines are continuations of the previous bullet
      if (/^\s/.test(raw) && !bullet && current.body.length > 0) {
        current.body[current.body.length - 1] = `${current.body[current.body.length - 1].trimEnd()} ${t}`;
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
      if (t && CONTACT_RE.test(t)) contact.push(t);
      else body.push(line);
    }
    sections.push(buildSection("", body));
    return { name, contact, sections };
  }

  for (const chunk of chunks) {
    if (chunk.heading === null) {
      for (const line of chunk.lines) {
        if (line.trim()) contact.push(line.trim());
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
      for (const line of section.lines) out.push(line);
    }
  }
  return out.join("\n");
}
