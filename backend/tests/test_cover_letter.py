from agents.cover_letter_models import CoverLetterOutput, CoverLetterSection, Tone


def test_cover_letter_model_valid():
    output = CoverLetterOutput(
        job_title="Backend Engineer",
        full_letter="Dear Hiring Manager,\n\nI am excited to apply...",
        sections=[
            CoverLetterSection(heading="Opening", content="I am excited to apply..."),
            CoverLetterSection(heading="Why This Role", content="Your requirements match..."),
        ],
        tone=Tone.PROFESSIONAL,
        key_points_addressed=["Python", "PostgreSQL"],
        word_count=250,
    )
    assert output.job_title == "Backend Engineer"
    assert output.tone == Tone.PROFESSIONAL
    assert output.word_count == 250
    assert len(output.sections) == 2


def test_cover_letter_model_minimal():
    output = CoverLetterOutput(
        job_title="Developer",
        full_letter="Short letter",
        sections=[CoverLetterSection(heading="Body", content="Short letter")],
        tone=Tone.CONCISE,
        key_points_addressed=[],
        word_count=4,
    )
    assert output.job_title == "Developer"
    assert output.tone == Tone.CONCISE


def test_tone_enum():
    assert Tone.PROFESSIONAL.value == "professional"
    assert Tone.ENTHUSIASTIC.value == "enthusiastic"
    assert Tone.CONCISE.value == "concise"


def test_cover_letter_sections():
    sections = [
        CoverLetterSection(heading="Opening", content="Dear Hiring Manager..."),
        CoverLetterSection(heading="Why This Role", content="Your company..."),
        CoverLetterSection(heading="Key Qualifications", content="My experience..."),
        CoverLetterSection(heading="Closing", content="I look forward..."),
    ]
    output = CoverLetterOutput(
        job_title="Software Engineer",
        full_letter="\n\n".join(s.content for s in sections),
        sections=sections,
        tone=Tone.PROFESSIONAL,
        key_points_addressed=["Python", "FastAPI"],
        word_count=300,
    )
    assert len(output.sections) == 4
    assert output.sections[0].heading == "Opening"
    assert output.sections[-1].heading == "Closing"


def test_cover_letter_key_points():
    output = CoverLetterOutput(
        job_title="Data Scientist",
        full_letter="Letter text",
        sections=[CoverLetterSection(heading="Body", content="Letter text")],
        tone=Tone.ENTHUSIASTIC,
        key_points_addressed=["Python", "PostgreSQL", "Kubernetes", "AWS"],
        word_count=100,
    )
    assert len(output.key_points_addressed) == 4
    assert "Python" in output.key_points_addressed
