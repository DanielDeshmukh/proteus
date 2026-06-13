from pydantic import BaseModel, Field


class ExperienceBullet(BaseModel):
    role: str = Field(description="Job title / role for this position")
    company: str | None = Field(default=None, description="Company name")
    duration: str | None = Field(default=None, description="Employment duration (e.g. '2 years', 'Jan 2022 - Present')")
    bullets: list[str] = Field(description="List of accomplishment/responsibility bullet points")


class Project(BaseModel):
    name: str = Field(description="Project name")
    description: str = Field(description="Brief description of the project")
    technologies: list[str] = Field(default_factory=list, description="Technologies used")
    url: str | None = Field(default=None, description="Project URL if available")


class Education(BaseModel):
    degree: str = Field(description="Degree obtained or pursuing")
    institution: str = Field(description="School/university name")
    year: str | None = Field(default=None, description="Graduation year or expected year")
    gpa: str | None = Field(default=None, description="GPA if mentioned")


class Certification(BaseModel):
    name: str = Field(description="Certification name")
    issuer: str | None = Field(default=None, description="Issuing organization")
    year: str | None = Field(default=None, description="Year obtained")


class ResumeStructured(BaseModel):
    name: str = Field(description="Candidate's full name")
    email: str | None = Field(default=None, description="Email address")
    phone: str | None = Field(default=None, description="Phone number")
    location: str | None = Field(default=None, description="Candidate's location")
    linkedin: str | None = Field(default=None, description="LinkedIn URL if present")
    github: str | None = Field(default=None, description="GitHub URL if present")
    portfolio: str | None = Field(default=None, description="Portfolio/website URL if present")
    summary: str | None = Field(default=None, description="Professional summary/objective if present")
    skills: list[str] = Field(description="All technical skills mentioned")
    experience: list[ExperienceBullet] = Field(default_factory=list, description="Work experience entries")
    projects: list[Project] = Field(default_factory=list, description="Notable projects")
    education: list[Education] = Field(default_factory=list, description="Education entries")
    certifications: list[Certification] = Field(default_factory=list, description="Certifications")
    total_years_experience: int | None = Field(default=None, description="Estimated total years of professional experience")
