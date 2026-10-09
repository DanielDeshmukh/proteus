import type { GuardViolation } from "./types";
import { normalize, words } from "./text";

export interface HiddenExperienceCheck {
  kept: string[];
  violations: GuardViolation[];
}

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "of", "to", "in", "for", "with", "on", "at",
  "by", "from", "as", "is", "are", "was", "were", "be", "been", "it", "its",
  "that", "this", "those", "these", "has", "have", "had", "but", "not", "no",
  "you", "your", "we", "our", "their", "they", "he", "she", "his", "her",
]);

/**
 * A "hidden experience" claim must be grounded in the resume: if the resume
 * never mentions it, the model fabricated it. Keep only items whose content
 * words substantially appear in the resume text.
 */
export function checkHiddenExperience(
  items: string[],
  resumeText: string
): HiddenExperienceCheck {
  const kept: string[] = [];
  const violations: GuardViolation[] = [];

  const resumeTokens = new Set(normalize(resumeText).split(" "));
  const resumeTokenList = [...resumeTokens];

  const grounded = (w: string): boolean => {
    if (resumeTokens.has(w)) return true;
    if (w.length < 4) return false;
    // light stem tolerance: "pipeline" matches "pipelines", "migrating" matches "migration"
    return resumeTokenList.some(
      (t) => t.length >= 4 && (t.startsWith(w) || w.startsWith(t))
    );
  };

  for (const item of items) {
    const content = words(normalize(item)).filter((w) => w.length >= 3 && !STOPWORDS.has(w));
    if (content.length === 0) {
      violations.push({
        code: "UNGROUND_HIDDEN",
        target: "hidden_experience",
        detail: `dropped empty/stopword-only claim "${item.slice(0, 60)}"`,
      });
      continue;
    }
    const hits = content.filter(grounded).length;
    const ratio = hits / content.length;
    if (ratio >= 0.6) {
      kept.push(item);
    } else {
      violations.push({
        code: "UNGROUND_HIDDEN",
        target: "hidden_experience",
        detail: `dropped "${item.slice(0, 60)}" — only ${Math.round(ratio * 100)}% of its terms appear in the resume`,
      });
    }
  }

  return { kept, violations };
}
