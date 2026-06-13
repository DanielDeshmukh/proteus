from pydantic import BaseModel, Field


class RewriteSuggestion(BaseModel):
    original_bullet: str = Field(description="The original resume bullet being rewritten")
    suggested_rewrite: str = Field(description="The JD-aware rewritten version")
    rationale: str = Field(description="Why this rewrite improves keyword/semantic match")
    target_requirement: str = Field(description="Which JD requirement this addresses")
    impact_score: float = Field(description="Estimated impact on match score (0.0 to 1.0)")
    experience_context: str | None = Field(default=None, description="Which job/project this bullet came from")


class RewriteOutput(BaseModel):
    suggestions: list[RewriteSuggestion] = Field(description="Rewrite suggestions ordered by impact (highest first)")
    hidden_experience: list[str] = Field(default_factory=list, description="Skills/experience the candidate has but isn't surfacing well")
