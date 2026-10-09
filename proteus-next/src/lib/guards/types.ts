export type GuardCode =
  | "PLACEHOLDER"
  | "NAME_MISSING"
  | "COMPANY_MISSING"
  | "NUMBER_NOT_IN_SOURCE"
  | "WORD_COUNT_WRONG"
  | "SECTIONS_DIVERGE"
  | "GARBLED"
  | "REPETITION"
  | "ORIGINAL_NOT_IN_RESUME"
  | "INVENTED_NUMBER"
  | "NEW_PROPER_NOUN"
  | "TOO_LONG"
  | "UNGROUND_HIDDEN";

export interface GuardViolation {
  code: GuardCode;
  target: "cover_letter" | "rewrites" | "hidden_experience";
  detail: string;
}

export function formatViolation(v: GuardViolation): string {
  return `[guard:${v.code}] ${v.target}: ${v.detail}`;
}
