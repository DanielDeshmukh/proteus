// Shared text heuristics for output guards. Pure functions, no I/O.

const PLACEHOLDER_RE = /\[[^\]\n]{1,80}\]/g;

const BANNED_PHRASES = [
  /\blorem ipsum\b/i,
  /\bas an ai( language)? model\b/i,
  /\b\[?(related skill|desirable trait|achievement|previous position|company name|job title)\]?/i,
];

const MOJIBAKE_RE = /[\u00C2\u00C3][\u0080-\u00BF]/;
const REPLACEMENT_CHAR = "\uFFFD";
const CONTROL_CHARS_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/;

const REPEATED_WORD_RE = /\b(\w+)(?:\s+\1){2,}\b/i;

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function words(s: string): string[] {
  return s.split(/\s+/).filter(Boolean);
}

export function countWords(s: string): number {
  const t = s.trim();
  return t ? t.split(/\s+/).length : 0;
}

/** Dice coefficient over word bigrams — 0..1, order-insensitive enough for bullets. */
export function diceSimilarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const bigrams = (s: string): Map<string, number> => {
    const ws = s.split(" ");
    const m = new Map<string, number>();
    for (let i = 0; i < ws.length - 1; i++) {
      const bg = `${ws[i]} ${ws[i + 1]}`;
      m.set(bg, (m.get(bg) ?? 0) + 1);
    }
    if (ws.length === 1) m.set(ws[0], 1);
    return m;
  };
  const ma = bigrams(na);
  const mb = bigrams(nb);
  let matches = 0;
  let totalA = 0;
  let totalB = 0;
  for (const c of ma.values()) totalA += c;
  for (const c of mb.values()) totalB += c;
  if (totalA === 0 || totalB === 0) return 0;
  for (const [bg, ca] of ma) {
    const cb = mb.get(bg);
    if (cb) matches += Math.min(ca, cb);
  }
  return (2 * matches) / (totalA + totalB);
}

export function findPlaceholders(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(PLACEHOLDER_RE)) out.push(m[0]);
  for (const re of BANNED_PHRASES) {
    const hit = re.exec(text);
    if (hit) out.push(hit[0]);
  }
  return out;
}

export function findGarbled(text: string): string[] {
  const out: string[] = [];
  if (text.includes(REPLACEMENT_CHAR)) out.push("U+FFFD replacement character");
  const ctrl = CONTROL_CHARS_RE.exec(text);
  if (ctrl) out.push(`control char U+${ctrl[0].charCodeAt(0).toString(16).padStart(4, "0")}`);
  const moji = MOJIBAKE_RE.exec(text);
  if (moji) out.push(`mojibake sequence "${moji[0]}…"`);
  return out;
}

export function findRepetition(text: string): string[] {
  const out: string[] = [];
  const wordHit = REPEATED_WORD_RE.exec(text);
  if (wordHit) out.push(`word repeated 3+ times: "${wordHit[0]}"`);

  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => normalize(s))
    .filter((s) => words(s).length >= 5);
  const seen = new Map<string, number>();
  for (const s of sentences) seen.set(s, (seen.get(s) ?? 0) + 1);
  for (const [s, n] of seen) {
    if (n >= 2) out.push(`sentence repeated ${n}x: "${s.slice(0, 60)}"`);
  }
  return out;
}

/** Numeric tokens, commas stripped — "1,400" and "1400" compare equal. */
export function extractNumbers(text: string): Set<string> {
  const cleaned = text.replace(/(\d),(?=\d{3}\b)/g, "$1");
  const out = new Set<string>();
  for (const m of cleaned.matchAll(/\d+(?:\.\d+)?/g)) out.add(m[0]);
  return out;
}

/** Mid-sentence capitalized tokens (not sentence-initial, not all-caps acronyms). */
export function midSentenceProperNouns(text: string): string[] {
  const tokens = text.split(/\s+/);
  const out: string[] = [];
  let atSentenceStart = true;
  for (let i = 0; i < tokens.length; i++) {
    const raw = tokens[i];
    const bare = raw.replace(/[^\p{L}\p{N}]/gu, "");
    if (!bare) continue;
    if (/[.!?]$/.test(raw) || /^\s*$/.test(raw)) {
      atSentenceStart = true;
      continue;
    }
    const isFirstWord = i === 0;
    const capitalized = /^\p{Lu}\p{Ll}/u.test(bare);
    const isAcronym = /^\p{Lu}{2,}$/u.test(bare);
    if ((isFirstWord || atSentenceStart) && capitalized) {
      atSentenceStart = false;
      continue;
    }
    atSentenceStart = false;
    if (capitalized && !isAcronym && bare.length > 2) out.push(bare);
  }
  return out;
}
