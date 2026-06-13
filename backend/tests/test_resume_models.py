import pytest
from agents.resume_models import (
    ResumeStructured,
    ExperienceBullet,
    Project,
    Education,
    Certification,
)


def test_resume_model_valid():
    data = {
        "name": "Alex Chen",
        "email": "alex@example.com",
        "phone": "555-1234",
        "location": "SF, CA",
        "linkedin": "linkedin.com/in/alex",
        "github": "github.com/alex",
        "portfolio": None,
        "summary": "Senior engineer with 7 years experience.",
        "skills": ["Python", "Go", "PostgreSQL", "Redis"],
        "experience": [
            {
                "role": "Senior Engineer",
                "company": "TechCorp",
                "duration": "2022-Present",
                "bullets": ["Built APIs", "Led migration"],
            }
        ],
        "projects": [
            {
                "name": "OpenCache",
                "description": "Distributed caching library",
                "technologies": ["Go", "gRPC"],
                "url": "github.com/alex/opencache",
            }
        ],
        "education": [
            {
                "degree": "B.S. Computer Science",
                "institution": "UC Berkeley",
                "year": "2017",
                "gpa": None,
            }
        ],
        "certifications": [
            {"name": "AWS SA Associate", "issuer": "Amazon", "year": "2021"}
        ],
        "total_years_experience": 7,
    }
    resume = ResumeStructured(**data)
    assert resume.name == "Alex Chen"
    assert len(resume.skills) == 4
    assert resume.experience[0].role == "Senior Engineer"
    assert resume.projects[0].technologies == ["Go", "gRPC"]


def test_resume_model_minimal():
    data = {
        "name": "Jordan Smith",
        "skills": ["JavaScript", "React"],
        "experience": [],
        "projects": [],
        "education": [],
        "certifications": [],
    }
    resume = ResumeStructured(**data)
    assert resume.name == "Jordan Smith"
    assert resume.email is None
    assert resume.total_years_experience is None
    assert resume.summary is None


def test_resume_model_empty_experience():
    data = {
        "name": "Fresh Grad",
        "skills": ["Python"],
        "experience": [],
        "projects": [],
        "education": [],
        "certifications": [],
    }
    resume = ResumeStructured(**data)
    assert len(resume.experience) == 0


def test_resume_model_invalid_missing_name():
    data = {
        "skills": ["Python"],
        "experience": [],
        "projects": [],
        "education": [],
        "certifications": [],
    }
    with pytest.raises(Exception):
        ResumeStructured(**data)
