import os
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from agents.jd_models import JDStructured


def test_jd_model_valid():
    data = {
        "title": "Backend Engineer",
        "company": "TechCorp",
        "location": "Remote",
        "seniority_level": "senior",
        "hard_skills": ["Python", "PostgreSQL", "Redis"],
        "soft_skills": ["Communication", "Teamwork"],
        "domain_keywords": ["microservices", "REST API"],
        "ats_bait": ["Python", "PostgreSQL", "Redis", "Docker"],
        "requirements_summary": "Senior backend engineer with Python and database experience.",
        "nice_to_haves": ["Kubernetes experience"],
    }
    jd = JDStructured(**data)
    assert jd.title == "Backend Engineer"
    assert len(jd.hard_skills) == 3
    assert jd.nice_to_haves == ["Kubernetes experience"]


def test_jd_model_minimal():
    data = {
        "title": "Developer",
        "seniority_level": "mid",
        "hard_skills": ["JavaScript"],
        "soft_skills": [],
        "domain_keywords": [],
        "ats_bait": ["JavaScript", "React"],
        "requirements_summary": "A developer.",
    }
    jd = JDStructured(**data)
    assert jd.company is None
    assert jd.location is None
    assert jd.nice_to_haves == []


def test_jd_model_invalid_missing_field():
    data = {
        "title": "Engineer",
    }
    with pytest.raises(Exception):
        JDStructured(**data)
