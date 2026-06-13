from pydantic import BaseModel, Field
from enum import Enum


class MatchStatus(str, Enum):
    MATCHED = "matched"
    PARTIAL = "partial"
    MISSING = "missing"


class GapItem(BaseModel):
    requirement: str = Field(description="The JD requirement being evaluated")
    status: MatchStatus = Field(description="How well this requirement is covered")
    similarity_score: float = Field(description="Cosine similarity score (0.0 to 1.0)")
    matched_evidence: str | None = Field(default=None, description="Resume bullet/skill that best matches this requirement")
    category: str = Field(description="Category: hard_skill, soft_skill, domain_keyword, ats_bait")


class GapAnalysis(BaseModel):
    overall_match: float = Field(description="Overall match percentage (0.0 to 1.0)")
    matched_count: int = Field(description="Number of requirements matched")
    partial_count: int = Field(description="Number of requirements partially matched")
    missing_count: int = Field(description="Number of requirements missing")
    total_requirements: int = Field(description="Total number of JD requirements")
    gaps: list[GapItem] = Field(description="All requirements ranked by gap size (worst first)")
