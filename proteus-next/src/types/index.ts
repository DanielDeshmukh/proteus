import { z } from "zod";

const coerceArray = z.preprocess(
  (v) => Array.isArray(v) ? v : typeof v === "string" ? v.split(/,\s*/).filter(Boolean) : v != null ? [String(v)] : [],
  z.array(z.string())
);

const safeStr = z.preprocess((v) => v ?? "", z.string());
const safeNum = z.preprocess(
  (v) => { const n = typeof v === "string" ? parseFloat(v) : v; return typeof n === "number" && !isNaN(n) ? n : 0; },
  z.number()
);

// ─────────────────────────────────────────────────────────
// Job Description Models
// ─────────────────────────────────────────────────────────

export const JDStructuredSchema = z.object({
  title: safeStr,
  company: safeStr.nullable().optional(),
  location: safeStr.nullable().optional(),
  seniority_level: z.preprocess(
    (v) => v || "mid",
    z.enum(["junior", "mid", "senior", "lead", "principal", "executive"])
  ),
  hard_skills: coerceArray,
  soft_skills: coerceArray,
  domain_keywords: coerceArray,
  ats_bait: coerceArray,
  requirements_summary: safeStr,
  nice_to_haves: coerceArray.default([]),
}).passthrough();

export type JDStructured = z.infer<typeof JDStructuredSchema>;

// ─────────────────────────────────────────────────────────
// Resume Models
// ─────────────────────────────────────────────────────────

export const ExperienceBulletSchema = z.object({
  role: safeStr,
  company: safeStr.nullable().optional(),
  duration: safeStr.nullable().optional(),
  bullets: coerceArray,
}).passthrough();

export const ProjectSchema = z.object({
  name: safeStr,
  description: safeStr,
  technologies: coerceArray.default([]),
  url: safeStr.nullable().optional(),
}).passthrough();

export const EducationSchema = z.object({
  degree: safeStr,
  institution: safeStr,
  year: safeStr.nullable().optional(),
  gpa: safeStr.nullable().optional(),
}).passthrough();

export const CertificationSchema = z.object({
  name: safeStr,
  issuer: safeStr.nullable().optional(),
  year: safeStr.nullable().optional(),
}).passthrough();

export const ResumeStructuredSchema = z.object({
  name: safeStr,
  email: safeStr.nullable().optional(),
  phone: safeStr.nullable().optional(),
  location: safeStr.nullable().optional(),
  linkedin: safeStr.nullable().optional(),
  github: safeStr.nullable().optional(),
  portfolio: safeStr.nullable().optional(),
  summary: safeStr.nullable().optional(),
  skills: coerceArray,
  experience: z.preprocess(
    (v) => Array.isArray(v) ? v : v && typeof v === "object" ? Object.values(v) : [],
    z.array(ExperienceBulletSchema)
  ),
  projects: z.preprocess(
    (v) => Array.isArray(v) ? v : v && typeof v === "object" ? Object.values(v) : [],
    z.array(ProjectSchema)
  ),
  education: z.preprocess(
    (v) => Array.isArray(v) ? v : v && typeof v === "object" ? Object.values(v) : [],
    z.array(EducationSchema)
  ),
  certifications: z.preprocess(
    (v) => Array.isArray(v) ? v : v && typeof v === "object" ? Object.values(v) : [],
    z.array(CertificationSchema)
  ),
  total_years_experience: safeNum.nullable().optional(),
}).passthrough();

export type ResumeStructured = z.infer<typeof ResumeStructuredSchema>;
export type ExperienceBullet = z.infer<typeof ExperienceBulletSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Certification = z.infer<typeof CertificationSchema>;

// ─────────────────────────────────────────────────────────
// Gap Analysis Models
// ─────────────────────────────────────────────────────────

export const MatchStatusSchema = z.enum(["matched", "partial", "missing"]);
export type MatchStatus = z.infer<typeof MatchStatusSchema>;

export const GapItemSchema = z.object({
  requirement: safeStr,
  status: z.preprocess(
    (v) => { const s = String(v || "").toLowerCase(); return (["matched","partial","missing"].includes(s) ? s : "missing") as "matched"|"partial"|"missing"; },
    MatchStatusSchema
  ),
  similarity_score: safeNum,
  matched_evidence: safeStr.nullable().optional(),
  category: z.preprocess(
    (v) => { const s = String(v || "").toLowerCase(); return (["hard_skill","soft_skill","domain_keyword","ats_bait"].includes(s) ? s : "hard_skill") as "hard_skill"|"soft_skill"|"domain_keyword"|"ats_bait"; },
    z.enum(["hard_skill", "soft_skill", "domain_keyword", "ats_bait"])
  ),
}).passthrough();

export const GapAnalysisSchema = z.object({
  overall_match: safeNum,
  matched_count: safeNum,
  partial_count: safeNum,
  missing_count: safeNum,
  total_requirements: safeNum,
  gaps: z.array(GapItemSchema),
}).passthrough();

export type GapItem = z.infer<typeof GapItemSchema>;
export type GapAnalysis = z.infer<typeof GapAnalysisSchema>;

// ─────────────────────────────────────────────────────────
// Rewrite Models
// ─────────────────────────────────────────────────────────

export const RewriteSuggestionSchema = z.object({
  original_bullet: safeStr,
  suggested_rewrite: safeStr,
  rationale: safeStr,
  target_requirement: safeStr,
  impact_score: safeNum,
  experience_context: safeStr.nullable().optional(),
}).passthrough();

export const RewriteOutputSchema = z.object({
  suggestions: z.preprocess(
    (v) => Array.isArray(v) ? v : v && typeof v === "object" ? Object.values(v) : [],
    z.array(RewriteSuggestionSchema)
  ),
  hidden_experience: z.preprocess(
    (v) => Array.isArray(v) ? v.map(x => typeof x === "string" ? x : JSON.stringify(x)) : [],
    z.array(z.string())
  ),
}).passthrough();

export type RewriteSuggestion = z.infer<typeof RewriteSuggestionSchema>;
export type RewriteOutput = z.infer<typeof RewriteOutputSchema>;

// ─────────────────────────────────────────────────────────
// Cover Letter Models
// ─────────────────────────────────────────────────────────

export const ToneSchema = z.enum(["professional", "enthusiastic", "concise"]);
export type Tone = z.infer<typeof ToneSchema>;

export const CoverLetterSectionSchema = z.object({
  heading: safeStr,
  content: safeStr,
}).passthrough();

export const CoverLetterOutputSchema = z.object({
  job_title: safeStr,
  full_letter: safeStr,
  sections: z.array(CoverLetterSectionSchema),
  tone: ToneSchema,
  key_points_addressed: coerceArray,
  word_count: safeNum,
}).passthrough();

export type CoverLetterSection = z.infer<typeof CoverLetterSectionSchema>;
export type CoverLetterOutput = z.infer<typeof CoverLetterOutputSchema>;

// ─────────────────────────────────────────────────────────
// Aggregator Models
// ─────────────────────────────────────────────────────────

export const ActionItemSchema = z.object({
  priority: safeNum,
  action: safeStr,
  impact: safeStr,
  category: z.preprocess(
    (v) => { const s = String(v || "").toLowerCase(); return (["rewrite","add_skill","surface_experience"].includes(s) ? s : "rewrite") as "rewrite"|"add_skill"|"surface_experience"; },
    z.enum(["rewrite", "add_skill", "surface_experience"])
  ),
}).passthrough();

export const PipelineOutputSchema = z.object({
  overall_score: safeNum,
  section_scores: z.record(z.string(), safeNum),
  action_list: z.array(ActionItemSchema),
  summary: safeStr,
}).passthrough();

export type ActionItem = z.infer<typeof ActionItemSchema>;
export type PipelineOutput = z.infer<typeof PipelineOutputSchema>;

// ─────────────────────────────────────────────────────────
// API Response Types
// ─────────────────────────────────────────────────────────

export const AnalyzeResponseSchema = z.object({
  run_id: z.number(),
  overall_score: z.number().nullable().optional(),
  section_scores: z.record(z.string(), z.number()).nullable().optional(),
  gap_analysis: GapAnalysisSchema.nullable().optional(),
  rewrite_suggestions: RewriteOutputSchema.nullable().optional(),
  cover_letter: CoverLetterOutputSchema.nullable().optional(),
  action_list: z.array(ActionItemSchema).nullable().optional(),
  timings: z.record(z.string(), z.number()).nullable().optional(),
  errors: z.array(z.string()).nullable().optional(),
});

export type AnalyzeResponse = z.infer<typeof AnalyzeResponseSchema>;

export interface HistoryResponse {
  runs: DatabaseRun[];
  count: number;
}

export interface DatabaseRun {
  id: number;
  created_at: string;
  jd_text: string | null;
  jd_source: string | null;
  resume_text: string | null;
  resume_source: string | null;
  overall_score: number | null;
  section_scores: string | null;
  gap_analysis: string | null;
  rewrite_suggestions: string | null;
  cover_letter: string | null;
  action_list: string | null;
  status: string;
  error_message: string | null;
}
