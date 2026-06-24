from pathlib import Path

import pdfplumber


def parse_pdf(file_path: str | Path) -> str:
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"PDF file not found: {path}")
    if not path.suffix.lower() == ".pdf":
        raise ValueError(f"File is not a PDF: {path}")

    try:
        text_parts = []
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
        return "\n\n".join(text_parts).strip()
    except Exception as e:
        raise ValueError(f"Failed to parse PDF: {e}")


def parse_pdf_bytes(data: bytes) -> str:
    import io

    try:
        text_parts = []
        with pdfplumber.open(io.BytesIO(data)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
        return "\n\n".join(text_parts).strip()
    except Exception as e:
        raise ValueError(f"Failed to parse PDF bytes: {e}")
