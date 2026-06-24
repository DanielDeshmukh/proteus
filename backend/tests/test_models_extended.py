"""
Extended model validation tests covering edge cases for all Pydantic models.
"""
import pytest

from agents.aggregator import ActionItem, PipelineOutput
from agents.cover_letter_models import CoverLetterOutput, CoverLetterSection, Tone
from agents.gap_models import GapAnalysis, GapItem, MatchStatus
from agents.jd_models import JDStructured
from agents.resume_models import Certification, Education, ExperienceBullet, Project, ResumeStructured
from agents.rewrite_models import RewriteOutput, RewriteSuggestion

# --- JD Model Edge Cases ---

def test_jd_with_all_fields():
    jd = JDStructured(
        title="Staff Engineer", company="BigTech", location="Remote",
        seniority_level="staff",
        hard_skills=["Python", "Go", "Rust", "C++", "TypeScript"],
        soft_skills=["Leadership", "Mentorship", "Communication", "Stakeholder Management"],
        domain_keywords=["distributed systems", "microservices", "event-driven"],
        ats_bait=["Python", "Go", "Rust", "Kubernetes", "AWS"],
        requirements_summary="Staff engineer to lead platform team",
        nice_to_haves=["PhD", "publications", "open source contributions"],
    )
    assert jd.title == "Staff Engineer"
    assert jd.seniority_level == "staff"
    assert len(jd.hard_skills) == 5
    assert len(jd.nice_to_haves) == 3


def test_jd_with_empty_lists():
    jd = JDStructured(
        title="Intern", seniority_level="intern",
        hard_skills=[], soft_skills=[], domain_keywords=[], ats_bait=[],
        requirements_summary="Summer intern position",
    )
    assert len(jd.hard_skills) == 0
    assert jd.company is None
    assert jd.nice_to_haves == []


def test_jd_seniority_levels():
    for level in ["junior", "mid", "senior", "lead", "principal", "executive", "intern", "staff"]:
        jd = JDStructured(
            title="Engineer", seniority_level=level,
            hard_skills=["Python"], soft_skills=[], domain_keywords=[], ats_bait=["Python"],
            requirements_summary="Test",
        )
        assert jd.seniority_level == level


def test_jd_missing_required_field():
    with pytest.raises(Exception):
        JDStructured(title="Engineer")


# --- Resume Model Edge Cases ---

def test_resume_all_fields():
    resume = ResumeStructured(
        name="Full Profile", email="a@b.com", phone="555-0000",
        location="NYC", linkedin="linkedin.com/in/full",
        github="github.com/full", portfolio="full.dev",
        summary="Senior engineer with 10 years.",
        skills=["Python", "Go", "Rust"],
        experience=[
            ExperienceBullet(role="Lead", company="A", duration="2020-2024", bullets=["Led team", "Shipped product"]),
            ExperienceBullet(role="Senior", company="B", duration="2016-2020", bullets=["Built APIs"]),
        ],
        projects=[
            Project(name="Proj1", description="Cool project", technologies=["Python", "Go"], url="github.com/proj1"),
            Project(name="Proj2", description="Another project", technologies=["Rust"]),
        ],
        education=[
            Education(degree="MS CS", institution="MIT", year="2016", gpa="3.9"),
            Education(degree="BS CS", institution="Stanford", year="2014"),
        ],
        certifications=[
            Certification(name="AWS SA", issuer="Amazon", year="2023"),
            Certification(name="CKA", issuer="CNCF"),
        ],
        total_years_experience=10,
    )
    assert resume.name == "Full Profile"
    assert len(resume.experience) == 2
    assert resume.experience[0].role == "Lead"
    assert len(resume.projects) == 2
    assert len(resume.education) == 2
    assert len(resume.certifications) == 2
    assert resume.total_years_experience == 10


def test_resume_minimal_optional_fields():
    resume = ResumeStructured(
        name="Minimal", skills=["Python"], experience=[], projects=[], education=[], certifications=[],
    )
    assert resume.email is None
    assert resume.phone is None
    assert resume.location is None
    assert resume.linkedin is None
    assert resume.github is None
    assert resume.portfolio is None
    assert resume.summary is None
    assert resume.total_years_experience is None


def test_resume_experience_with_optional_fields():
    exp = ExperienceBullet(role="Engineer", bullets=["Built stuff"])
    assert exp.company is None
    assert exp.duration is None


def test_resume_project_with_optional_url():
    proj = Project(name="P", description="Desc", technologies=["Python"])
    assert proj.url is None


def test_resume_education_with_optional_gpa():
    edu = Education(degree="BS", institution="MIT")
    assert edu.gpa is None
    assert edu.year is None


def test_resume_certification_with_optional_fields():
    cert = Certification(name="AWS")
    assert cert.issuer is None
    assert cert.year is None


def test_resume_missing_name():
    with pytest.raises(Exception):
        ResumeStructured(skills=[], experience=[], projects=[], education=[], certifications=[])


# --- Gap Model Edge Cases ---

def test_gap_item_all_statuses():
    for status in MatchStatus:
        gap = GapItem(
            requirement="Python", status=status,
            similarity_score=0.85, category="hard_skill",
        )
        assert gap.status == status


def test_gap_item_with_evidence():
    gap = GapItem(
        requirement="Python", status=MatchStatus.MATCHED,
        similarity_score=0.95, matched_evidence="5 years Python at Google",
        category="hard_skill",
    )
    assert gap.matched_evidence == "5 years Python at Google"


def test_gap_item_without_evidence():
    gap = GapItem(
        requirement="Rust", status=MatchStatus.MISSING,
        similarity_score=0.10, category="hard_skill",
    )
    assert gap.matched_evidence is None


def test_gap_analysis_extreme_scores():
    ga = GapAnalysis(
        overall_match=0.0, matched_count=0, partial_count=0,
        missing_count=10, total_requirements=10,
        gaps=[GapItem(requirement=f"R{i}", status=MatchStatus.MISSING, similarity_score=0.0, category="hard_skill") for i in range(10)],
    )
    assert ga.overall_match == 0.0
    assert ga.missing_count == 10

    ga2 = GapAnalysis(
        overall_match=1.0, matched_count=10, partial_count=0,
        missing_count=0, total_requirements=10, gaps=[],
    )
    assert ga2.overall_match == 1.0


def test_gap_categories():
    for cat in ["hard_skill", "soft_skill", "domain_keyword", "ats_bait"]:
        gap = GapItem(
            requirement="X", status=MatchStatus.MATCHED,
            similarity_score=0.8, category=cat,
        )
        assert gap.category == cat


# --- Rewrite Model Edge Cases ---

def test_rewrite_suggestion_all_fields():
    rs = RewriteSuggestion(
        original_bullet="Built APIs",
        suggested_rewrite="Designed RESTful APIs serving 10K req/s with FastAPI",
        rationale="Added metrics and technology",
        target_requirement="FastAPI, REST APIs",
        impact_score=0.85,
        experience_context="Engineer at TechCo",
    )
    assert rs.experience_context == "Engineer at TechCo"


def test_rewrite_suggestion_minimal():
    rs = RewriteSuggestion(
        original_bullet="Did stuff",
        suggested_rewrite="Did stuff better",
        rationale="Improved",
        target_requirement="General",
        impact_score=0.5,
    )
    assert rs.experience_context is None


def test_rewrite_output_empty():
    ro = RewriteOutput(suggestions=[], hidden_experience=[])
    assert len(ro.suggestions) == 0
    assert len(ro.hidden_experience) == 0


def test_rewrite_impact_score_boundary():
    rs = RewriteSuggestion(
        original_bullet="A", suggested_rewrite="B", rationale="r",
        target_requirement="t", impact_score=0.0,
    )
    assert rs.impact_score == 0.0

    rs2 = RewriteSuggestion(
        original_bullet="A", suggested_rewrite="B", rationale="r",
        target_requirement="t", impact_score=1.0,
    )
    assert rs2.impact_score == 1.0


# --- Cover Letter Model Edge Cases ---

def test_all_tones():
    for tone in Tone:
        cl = CoverLetterOutput(
            job_title="Engineer",
            full_letter="Letter", sections=[CoverLetterSection(heading="Body", content="Text")],
            tone=tone, key_points_addressed=[], word_count=10,
        )
        assert cl.tone == tone


def test_cover_letter_many_sections():
    sections = [
        CoverLetterSection(heading=f"Section {i}", content=f"Content {i}") for i in range(10)
    ]
    cl = CoverLetterOutput(
        job_title="Senior Engineer",
        full_letter="Long letter", sections=sections,
        tone=Tone.PROFESSIONAL, key_points_addressed=["A", "B"], word_count=500,
    )
    assert len(cl.sections) == 10


def test_cover_letter_zero_word_count():
    cl = CoverLetterOutput(
        job_title="Intern",
        full_letter="", sections=[CoverLetterSection(heading="Empty", content="")],
        tone=Tone.CONCISE, key_points_addressed=[], word_count=0,
    )
    assert cl.word_count == 0


def test_cover_letter_many_key_points():
    cl = CoverLetterOutput(
        job_title="Platform Engineer",
        full_letter="Letter", sections=[CoverLetterSection(heading="Body", content="Text")],
        tone=Tone.ENTHUSIASTIC,
        key_points_addressed=["Python", "Go", "AWS", "Kubernetes", "Docker", "Terraform"],
        word_count=300,
    )
    assert len(cl.key_points_addressed) == 6


# --- ActionItem & PipelineOutput Edge Cases ---

def test_action_item_categories():
    for cat in ["rewrite", "add_skill", "surface_experience"]:
        ai = ActionItem(priority=1, action="Do X", impact="High", category=cat)
        assert ai.category == cat


def test_pipeline_output_empty_actions():
    po = PipelineOutput(
        overall_score=0.95, section_scores={"hard_skills": 1.0},
        action_list=[], summary="Excellent match",
    )
    assert len(po.action_list) == 0


def test_pipeline_output_many_sections():
    po = PipelineOutput(
        overall_score=0.5,
        section_scores={f"section_{i}": 0.5 for i in range(20)},
        action_list=[], summary="Test",
    )
    assert len(po.section_scores) == 20


def test_pipeline_output_boundary_scores():
    po = PipelineOutput(
        overall_score=0.0, section_scores={"hard_skills": 0.0},
        action_list=[], summary="No match",
    )
    assert po.overall_score == 0.0

    po2 = PipelineOutput(
        overall_score=1.0, section_scores={"hard_skills": 1.0},
        action_list=[], summary="Perfect match",
    )
    assert po2.overall_score == 1.0
