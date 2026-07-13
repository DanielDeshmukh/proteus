/**
 * Pre-filters noisy JD text scraped from job boards.
 * Removes navigation, UI elements, job listing grids, footers, and
 * other non-JD content before sending to the LLM parser.
 * This is noise removal, NOT context reduction — the actual JD content is preserved.
 */

const NOISE_PATTERNS: RegExp[] = [
  // Navigation & UI
  /^Skip to content$/im,
  /^(Find Jobs|Salary Tools|Career Advice|Employers\s*\/?\s*Post Job)$/im,
  /^(Search results for|Showing \d+ to \d+ of \d+|No More Results)/im,
  /^(remote|All Dates|Within \d+ miles|Jobs only)$/im,
  /^(Today|Last \d+ (days?|weeks?|months?))$/im,
  /^(5 miles|10 miles|30 miles|50 miles|100 miles)$/im,

  // Job listing entries (title + location + "Apply" + "XX days ago")
  /^(Apply|Remote|New)$/im,
  /^\d+\+?\s*days?\s*ago$/im,
  /^(€[\d,]+–€[\d,]+|€[\d,]+)$/im,

  // Resume resources / sidebar
  /^(Resume Resources|Free Resume Templates|Free Resume Builder)$/im,
  /^(Add your missing skills\.|Add Skills|Profile Insights|Am I Qualified\?)$/im,
  /^\+ show more$/im,

  // Footer / legal
  /^(About us|Contact us|Press|How we work|How we hire|Your career)$/im,
  /^(Equal Opportunity|Privacy|Terms|Manage cookies|Help)$/im,
  /^(Investor relations|Blog|More about us|Send Feedback|Sign in)$/im,
  /^(arrow_back|share|linkCopy link|emailEmail a friend)$/im,
  /^(expand_more|work_outline|noogler_hat|handyman|person_outline|help_outline|feedback|more_vert)$/im,
  /^(home|Jobs|Students|Home)$/im,

  // Google careers specific noise
  /^(job details|careers|job details)$/im,
  /^(corporate_fare|bar_chart|info_outline|XNote:)$/im,
  /^(Follow Life at Google on|No More Results)$/im,
  /^(Numbers & Facts|Location\s+\w)/im,

  // Monster.com specific
  /^(We extracted this information from the job description\.|United States \(English\))$/im,
  /^(For Job Seekers|For Employers|Browse Jobs|Salary Tools|Resume Templates|Resume Builder|Career Advice)$/im,
  /^(Company Profile|Products|Solutions|Pricing|Resources)$/im,
  /^(Helpful Resources|Terms of Use|Security Center|Accessibility Center)$/im,
  /^(Do Not Sell My Personal Information|Personal Data Request|AdChoices)$/im,
  /^(Find us on social media|Get the Monster App|© \d{4} MCB Bermuda Ltd)$/im,
  /^(Monster Jobs - Job Search.*|MCB Bermuda Ltd.*)$/im,

  // Skills that don't match (from the "Skills" sidebar)
  /^(Android|Automation Engineering|Business Development|Cloud Architecture|Cloud Computing|Cloud Storage)$/im,
  /^(Cross-Functional|Data Analysis|Data Management|Debugging Skills|English Language|Entertainment and Media)$/im,
  /^(Equal Employment Opportunity|Field Sales|Financial Services|Gaming|Genetics|German Language)$/im,
  /^(Hyperion Pillar|Identify Issues|Leading Edge Technology|Network Administration|Network Operations Center)$/im,
  /^(Operations Management|Organizational Skills|Partner Sales|Post-Sales|Pricing|Problem Solving Skills)$/im,
  /^(Product Demonstration|Product Management|Product Support|Programming Languages|Proof of Concept|Prototyping)$/im,
  /^(Recruiting\/Staffing Agency|Regulatory Requirements|Reliability Engineering|Sales Cycle|Sales Support)$/im,
  /^(Software Development|Software Engineering|Solution Sales|Stock Purchase Plans|Strategic Planning)$/im,
  /^(Systems Administration|Technical Consulting|Technical Presentation|Technical Sales|Technical Strategy|Technical Support|Virtualization)$/im,
  /^(unmatched|matched)$/im,
];

const JOB_LISTING_NOISE = /^(HERE Technologies|HERE Global BV|Google LLC|European Energy Exchange|AeroVect Technologies|Noir|Mistral AI|SimCorp AS|Zero to One search)\b.*$/im;

/**
 * Pre-filters noisy JD text before LLM parsing.
 * Removes job board UI elements, navigation, footers, skill lists,
 * and short job listing entries — preserving only the main JD content.
 */
export function preFilterJd(rawText: string): string {
  const text = rawText;

  // Apply line-by-line noise removal
  const lines = text.split("\n");
  const cleaned: string[] = [];

  let consecutiveNoise = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines that follow 3+ consecutive noise lines
    if (!trimmed && consecutiveNoise >= 3) continue;

    // Check against noise patterns
    const isNoise = NOISE_PATTERNS.some(p => p.test(trimmed));
    const isJobListing = trimmed.length < 120 && JOB_LISTING_NOISE.test(trimmed);

    if (isNoise || isJobListing) {
      consecutiveNoise++;
      continue;
    }

    // If we hit substantial content after noise, reset
    consecutiveNoise = 0;
    cleaned.push(line);
  }

  const result = cleaned.join("\n").replace(/\n{3,}/g, "\n\n").trim();

  // Safety: if filtering removed >50% of text, return original (filter was too aggressive)
  if (result.length < rawText.length * 0.3) {
    return rawText;
  }

  return result;
}
