from pathlib import Path

import pytest

from parsers.pdf_parser import parse_pdf, parse_pdf_bytes

FIXTURES_DIR = Path(__file__).parent / "fixtures"


def test_parse_pdf_not_found():
    with pytest.raises(FileNotFoundError):
        parse_pdf("nonexistent.pdf")


def test_parse_pdf_wrong_extension(tmp_path):
    txt_file = tmp_path / "test.txt"
    txt_file.write_text("hello")
    with pytest.raises(ValueError, match="not a PDF"):
        parse_pdf(txt_file)


def test_parse_pdf_bytes_invalid():
    with pytest.raises(ValueError, match="Failed to parse PDF"):
        parse_pdf_bytes(b"not a pdf")


def test_parse_pdf_bytes_valid():
    import io

    from pypdf import PdfWriter

    writer = PdfWriter()
    writer.add_blank_page(width=612, height=792)
    buf = io.BytesIO()
    writer.write(buf)
    buf.seek(0)

    result = parse_pdf_bytes(buf.getvalue())
    assert isinstance(result, str)
