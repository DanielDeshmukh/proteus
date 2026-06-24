from pydantic import BaseModel, Field
from enum import Enum


class Tone(str, Enum):
    PROFESSIONAL = "professional"
    ENTHUSIASTIC = "enthusiastic"
    CONCISE = "concise"


class CoverLetterSection(BaseModel):
    heading: str = Field(description="Section heading (e.g. 'Opening', 'Why This Role')")
    content: str = Field(description="Section paragraph text")


class CoverLetterOutput(BaseModel):
    job_title: str = Field(description="The job title this cover letter is addressing")
    full_letter: str = Field(description="The complete cover letter as a single string")
    sections: list[CoverLetterSection] = Field(description="Breakdown of letter into sections")
    tone: Tone = Field(description="Tone used for this letter")
    key_points_addressed: list[str] = Field(description="Which JD requirements were highlighted in the letter")
    word_count: int = Field(description="Approximate word count of the letter")
