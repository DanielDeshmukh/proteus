from pydantic import BaseModel, Field


class JDStructured(BaseModel):
    title: str = Field(description="Job title extracted from the JD")
    company: str | None = Field(default=None, description="Company name if mentioned")
    location: str | None = Field(default=None, description="Job location or Remote/Hybrid/Onsite")
    seniority_level: str = Field(description="Estimated seniority: junior, mid, senior, lead, principal, executive")
    hard_skills: list[str] = Field(description="Technical skills, tools, frameworks, languages required")
    soft_skills: list[str] = Field(description="Communication, leadership, teamwork, etc.")
    domain_keywords: list[str] = Field(description="Industry/domain terms relevant to the role")
    ats_bait: list[str] = Field(description="Exact tool/framework names from posting for ATS keyword matching")
    requirements_summary: str = Field(description="2-3 sentence summary of core requirements")
    nice_to_haves: list[str] = Field(default_factory=list, description="Preferred but not required qualifications")
