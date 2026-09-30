// src/lib/resume-export.ts
// Pure helpers that splice accepted rewrite suggestions into the raw resume
// text, plus the filename helpers shared by the analyze and history views.

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

function normalize(s: string): string {
  return s.replace(/\s+/g, " ").trim().toLowerCase();
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
 *   1. exact match of the line body (marker/whitespace/punctuation tolerant)
 *   2. wrapped block — indented continuation lines joined, then matched
 *   3. raw substring (surgical: keeps whatever else is on the line)
 *   4. whole-line containment (only lines carrying a bullet marker)
 *
 * Steps 2-4 are restricted so a heading plus its following line can never be
 * swallowed as one bullet. Anything still unmatched is reported, not dropped.
 */
export function applyRewrites(resumeText: string, accepted: RewriteCandidate[]): ApplyResult {
  if (!resumeText || accepted.length === 0) {
    return { text: resumeText ?? "", appliedCount: 0, unmatched: [] };
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

      // Span of indented continuation lines that belong to this bullet
      let end = i;
      let joined = body;
      while (end + 1 < lines.length) {
        const next = lines[end + 1];
        if (!next.trim()) break;
        if (splitMarker(next)) break;
        if (isSectionHeader(next)) break;
        if (!/^\s/.test(next)) break;
        end++;
        joined += " " + next.trim();
      }

      // 1. exact single-line match
      if (looseKey(body) === looseKey(original)) {
        ops.push({ start: i, end: i, text: prefix + rewrite });
        claim(i, i);
        applied = true;
        break;
      }

      // 2. wrapped block — only when a continuation actually exists
      if (end > i && isSimilar(joined, original, 0.5) && free(i, end)) {
        ops.push({ start: i, end, text: prefix + rewrite });
        claim(i, end);
        applied = true;
        break;
      }

      if (end > i || !split) continue; // steps 3-4 rewrite a whole/marker line

      // 3. raw substring inside the line
      if (rawable && lines[i].includes(target)) {
        ops.push({ start: i, end: i, text: lines[i].replace(target, rewrite) });
        claim(i, i);
        applied = true;
        break;
      }

      // 4. markered line whose body is close enough to the original
      if (rawable && isSimilar(body, original, 0.6)) {
        ops.push({ start: i, end: i, text: prefix + rewrite });
        claim(i, i);
        applied = true;
        break;
      }
    }

    if (!applied) unmatched.push(original);
  }

  return { text: applyOps(lines, ops), appliedCount: ops.length, unmatched };
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
