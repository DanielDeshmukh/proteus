// src/lib/resume-export.ts
// Pure helpers that splice accepted rewrite suggestions into the raw resume
// text, plus the filename helpers shared by the analyze and history views.

import { isDateLine } from "@/lib/resume-ats";

export interface RewriteCandidate {
  original_bullet: string;
  suggested_rewrite: string;
}

export interface ApplyResult {
  text: string;
  appliedCount: number;
  unmatched: string[];
}

// Bullet markers recognised at the start of a line: "- ", "* ", "• ", "1. ", "a) "
const MARKER_RE = /^(\s*)([-*•–—▪◦>]+|\d+[.)]|[a-zA-Z][.)])(\s+)/;

interface Split {
  prefix: string;
  body: string;
}

function splitMarker(line: string): Split | null {
  const m = MARKER_RE.exec(line);
  if (!m) return null;
  return { prefix: line.slice(0, m[0].length), body: line.slice(m[0].length) };
}

function stripLeadingMarker(s: string): string {
  const m = MARKER_RE.exec(s);
  return m ? s.slice(m[0].length) : s.replace(/^\s+/, "");
}

function leadingWs(s: string): string {
  return s.slice(0, s.length - s.replace(/^\s+/, "").length);
}

// The LLM often copies resume text with typographic variants (non-breaking
// hyphens U+2011, narrow no-break spaces, ligatures) that must not defeat
// matching — and must not survive into the exported file, where an ATS would
// fail keyword search on them. En/em dashes are kept: they are display
// typography, not word characters.
const OUTPUT_HYPHENS = /[\u2010\u2011\u2012\u2212]/g;

function polishOutput(s: string): string {
  return s
    .normalize("NFKC")
    .replace(OUTPUT_HYPHENS, "-")
    .replace(/[\u200b\u200c\u200d\u2060]/g, "");
}

function normalize(s: string): string {
  return s
    .normalize("NFKC")
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// True when the accumulated bullet text reads as finished (so the next line,
// if any, must be something else).
function hasTerminalPunct(s: string): boolean {
  return /[.!?;:][)"'”’\]]*$/.test(s.trim());
}

// Also drops quotes and trailing punctuation so the LLM re-adding a full stop
// does not defeat an otherwise-exact match.
function looseKey(s: string): string {
  return normalize(s)
    .replace(/["'“”‘’]/g, "")
    .replace(/[.,;:!?]+$/, "");
}

function isSimilar(a: string, b: string, minRatio: number): boolean {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (minRatio >= 1) return false;
  const short = na.length <= nb.length ? na : nb;
  const long = na.length <= nb.length ? nb : na;
  if (!long.includes(short)) return false;
  return short.length / long.length >= minRatio;
}

// A short all-caps line ends a wrapped-bullet group (e.g. "EXPERIENCE")
function isSectionHeader(line: string): boolean {
  const t = line.trim();
  if (!t || t.length > 60) return false;
  if (/[.!?]$/.test(t)) return false;
  const letters = t.replace(/[^A-Za-z]/g, "");
  if (letters.length < 3) return false;
  return letters === letters.toUpperCase();
}

/**
 * Splice accepted rewrites into the raw resume text.
 *
 * `original_bullet` comes from the LLM's structured parse, not verbatim from
 * the text, so per anchor line we try in order:
 *   1. exact match of the full bullet (wrapped continuation lines joined)
 *   2. exact match of this line alone (the pulled tail was not part of it)
 *   3. joined block close enough to the original
 *   4. raw substring (surgical: keeps whatever else is on the line)
 *   5. whole-line containment (only single-line bullets carrying a marker)
 *
 * Wrapped bullets are joined while the text so far lacks terminal
 * punctuation, so a match replaces every physical line of the bullet and
 * never leaves orphaned tail fragments behind. Steps 4-5 stay restricted to
 * single-line bullets so a heading plus its following line can never be
 * swallowed as one bullet. Anything still unmatched is reported, not dropped.
 */
export function applyRewrites(resumeText: string, accepted: RewriteCandidate[]): ApplyResult {
  if (!resumeText || accepted.length === 0) {
    return { text: resumeText ? polishOutput(resumeText) : "", appliedCount: 0, unmatched: [] };
  }

  const lines = resumeText.split("\n");
  const ops: Array<{ start: number; end: number; text: string }> = [];
  const claimed = new Set<number>();
  const unmatched: string[] = [];

  const free = (a: number, b: number): boolean => {
    for (let k = a; k <= b; k++) if (claimed.has(k)) return false;
    return true;
  };
  const claim = (a: number, b: number): void => {
    for (let k = a; k <= b; k++) claimed.add(k);
  };

  for (const s of accepted) {
    const original = (s.original_bullet || "").trim();
    const rewrite = (s.suggested_rewrite || "").trim();
    if (!original || !rewrite) {
      if (original) unmatched.push(original);
      continue;
    }

    const target = stripLeadingMarker(original);
    const rawable = target.trim().length >= 10;
    let applied = false;

    for (let i = 0; i < lines.length && !applied; i++) {
      if (claimed.has(i)) continue;

      const split = splitMarker(lines[i]);
      const body = split ? split.body : lines[i];
      const prefix = split ? split.prefix : leadingWs(lines[i]);

      // Span of continuation lines that belong to this bullet. Sources wrap
      // flush-left, so keep pulling lines while the text so far has no
      // terminal punctuation; stop at anything that starts a new record
      // (markers, headings, dates, pipe-separated lines).
      let end = i;
      let joined = body;
      while (end + 1 < lines.length) {
        const next = lines[end + 1];
        const nt = next.trim();
        if (!nt) break;
        if (splitMarker(next)) break;
        if (isSectionHeader(next)) break;
        if (isDateLine(nt)) break;
        if (nt.includes("|")) break;
        if (hasTerminalPunct(joined)) break;
        end++;
        joined += " " + nt;
      }

      // 1. exact match of the full (possibly wrapped) bullet
      if (looseKey(joined) === looseKey(original) && (end === i || free(i, end))) {
        ops.push({ start: i, end, text: prefix + rewrite });
        claim(i, end);
        applied = true;
        break;
      }

      // 2. exact match of this line alone — the pulled tail was not part of it
      if (end > i && looseKey(body) === looseKey(original)) {
        ops.push({ start: i, end: i, text: prefix + rewrite });
        claim(i, i);
        applied = true;
        break;
      }

      // 3. wrapped block — only when a continuation actually exists
      if (end > i && isSimilar(joined, original, 0.5) && free(i, end)) {
        ops.push({ start: i, end, text: prefix + rewrite });
        claim(i, end);
        applied = true;
        break;
      }

      if (end > i || !split) continue; // steps 4-5 rewrite a whole/marker line

      // 4. raw substring inside the line
      if (rawable && lines[i].includes(target)) {
        ops.push({ start: i, end: i, text: lines[i].replace(target, rewrite) });
        claim(i, i);
        applied = true;
        break;
      }

      // 5. markered single-line bullet close enough to the original
      if (rawable && isSimilar(body, original, 0.6)) {
        ops.push({ start: i, end: i, text: prefix + rewrite });
        claim(i, i);
        applied = true;
        break;
      }
    }

    if (!applied) unmatched.push(original);
  }

  return { text: polishOutput(applyOps(lines, ops)), appliedCount: ops.length, unmatched };
}

function applyOps(lines: string[], ops: Array<{ start: number; end: number; text: string }>): string {
  const out = [...lines];
  for (const op of [...ops].sort((a, b) => b.start - a.start)) {
    out.splice(op.start, op.end - op.start + 1, op.text);
  }
  return out.join("\n");
}

// ─────────────────────────────────────────────────────────
// Filename helpers (shared by analyze + history views)
// ─────────────────────────────────────────────────────────

export function sanitizeForFilename(s: string): string {
  return s
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 50)
    .replace(/_+$/, "");
}

export function extractNameFromLetter(letter: string): string | null {
  const m = letter.match(
    /(?:sincerely|best regards|kind regards|regards|thank you)[,\s]*\n\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i
  );
  return m ? m[1].trim() : null;
}

// Drop novelty job titles the model sometimes invents
export function safeRoleTitle(jobTitle: string | null | undefined): string | null {
  if (!jobTitle) return null;
  if (/ninja|guru|wizard|rockstar|monkey|devil/i.test(jobTitle)) return null;
  return jobTitle;
}

export function candidateLabelFrom(
  letter: string | null | undefined,
  resumeText: string | null | undefined
): string {
  if (letter) {
    const fromLetter = extractNameFromLetter(letter);
    if (fromLetter) return fromLetter;
  }
  const firstLine = resumeText
    ?.split("\n")
    .find((l) => {
      const t = l.trim();
      return t.length > 2 && !/^[\s=\-_|#*>]+$/.test(t) && !/^[A-Z\s]{15,}$/.test(t);
    })
    ?.trim();
  return firstLine || "Candidate";
}

// ATS convention: Firstname_Lastname_Resume
export function buildResumeFilename(candidate: string): string {
  return `${sanitizeForFilename(candidate) || "Candidate"}_Resume`;
}
