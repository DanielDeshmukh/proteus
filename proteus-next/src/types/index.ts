import { z } from "zod";

// ─────────────────────────────────────────────────────────
// Job Description Models
// ─────────────────────────────────────────────────────────

export const JDStructuredSchema = z.object({
  title: z.string(),
  company: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  seniority_level: z.enum(["junior", "mid", "senior", "lead", "principal", "executive"]),
  hard_skills: z.array(z.string()),
  soft_skills: z.array(z.string()),
  domain_keywords: z.array(z.string()),
  ats_bait: z.array(z.string()),
  requirements_summary: z.string(),
  nice_to_haves: z.array(z.string()).default([]),
});

export type JDStructured = z.infer<typeof JDStructuredSchema>;

// ─────────────────────────────────────────────────────────
// Resume Models
// ─────────────────────────────────────────────────────────

export const ExperienceBulletSchema = z.object({
  role: z.string(),
  company: z.string().nullable().optional(),
  duration: z.string().nullable().optional(),
  bullets: z.array(z.string()),
});

export const ProjectSchema = z.object({
  name: z.string(),
  description: z.string(),
  technologies: z.array(z.string()).default([]),
  url: z.string().nullable().optional(),
});

export const EducationSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  year: z.string().nullable().optional(),
  gpa: z.string().nullable().optional(),
});

export const CertificationSchema = z.object({
  name: z.string(),
  issuer: z.string().nullable().optional(),
  year: z.string().nullable().optional(),
});

export const ResumeStructuredSchema = z.object({
  name: z.string(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  linkedin: z.string().nullable().optional(),
  github: z.string().nullable().optional(),
  portfolio: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  skills: z.array(z.string()),
  experience: z.array(ExperienceBulletSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  education: z.array(EducationSchema).default([]),
  certifications: z.array(CertificationSchema).default([]),
  total_years_experience: z.number().nullable().optional(),
});

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
  requirement: z.string(),
  status: MatchStatusSchema,
  similarity_score: z.number().min(0).max(1),
  matched_evidence: z.string().nullable().optional(),
  category: z.enum(["hard_skill", "soft_skill", "domain_keyword", "ats_bait"]),
});

export const GapAnalysisSchema = z.object({
  overall_match: z.number().min(0).max(1),
  matched_count: z.number().int(),
  partial_count: z.number().int(),
  missing_count: z.number().int(),
  total_requirements: z.number().int(),
  gaps: z.array(GapItemSchema),
});

export type GapItem = z.infer<typeof GapItemSchema>;
export type GapAnalysis = z.infer<typeof GapAnalysisSchema>;

// ─────────────────────────────────────────────────────────
// Rewrite Models
// ─────────────────────────────────────────────────────────

export const RewriteSuggestionSchema = z.object({
  original_bullet: z.string(),
  suggested_rewrite: z.string(),
  rationale: z.string(),
  target_requirement: z.string(),
  impact_score: z.number().min(0).max(1),
  experience_context: z.string().nullable().optional(),
});

export const RewriteOutputSchema = z.object({
  suggestions: z.array(RewriteSuggestionSchema),
  hidden_experience: z.array(z.string()).default([]),
});

export type RewriteSuggestion = z.infer<typeof RewriteSuggestionSchema>;
export type RewriteOutput = z.infer<typeof RewriteOutputSchema>;

// ─────────────────────────────────────────────────────────
// Cover Letter Models
// ─────────────────────────────────────────────────────────

export const ToneSchema = z.enum(["professional", "enthusiastic", "concise"]);
export type Tone = z.infer<typeof ToneSchema>;

export const CoverLetterSectionSchema = z.object({
  heading: z.string(),
  content: z.string(),
});

export const CoverLetterOutputSchema = z.object({
  job_title: z.string(),
  full_letter: z.string(),
  sections: z.array(CoverLetterSectionSchema),
  tone: ToneSchema,
  key_points_addressed: z.array(z.string()),
  word_count: z.number().int(),
});

export type CoverLetterSection = z.infer<typeof CoverLetterSectionSchema>;
export type CoverLetterOutput = z.infer<typeof CoverLetterOutputSchema>;

// ─────────────────────────────────────────────────────────
// Aggregator Models
// ─────────────────────────────────────────────────────────

export const ActionItemSchema = z.object({
  priority: z.number().int().min(1),
  action: z.string(),
  impact: z.string(),
  category: z.enum(["rewrite", "add_skill", "surface_experience"]),
});

export const PipelineOutputSchema = z.object({
  overall_score: z.number().min(0).max(1),
  section_scores: z.record(z.string(), z.number().min(0).max(1)),
  action_list: z.array(ActionItemSchema),
  summary: z.string(),
});

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
