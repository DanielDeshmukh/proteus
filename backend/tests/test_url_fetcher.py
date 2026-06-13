import pytest
from parsers.jd_url_fetcher import fetch_jd_from_url


def test_fetch_empty_url():
    with pytest.raises(ValueError, match="empty"):
        fetch_jd_from_url("")


def test_fetch_none_url():
    with pytest.raises(ValueError, match="empty"):
        fetch_jd_from_url(None)


def test_fetch_invalid_scheme():
    with pytest.raises(ValueError, match="Invalid URL scheme"):
        fetch_jd_from_url("ftp://example.com")


def test_fetch_invalid_url():
    with pytest.raises(ValueError):
        fetch_jd_from_url("https://this-domain-does-not-exist-12345.com")


def test_fetch_valid_html(monkeypatch):
    mock_html = """
    <html>
    <head><title>Job Posting</title></head>
    <body>
        <h1>Senior Engineer</h1>
        <p>We are looking for a senior engineer with Python experience.</p>
        <p>Requirements: 5+ years, PostgreSQL, Redis</p>
    </body>
    </html>
    """

    def mock_get(*args, **kwargs):
        class MockResponse:
            status_code = 200
            text = mock_html
            headers = {"content-type": "text/html"}

            def raise_for_status(self):
                pass

        return MockResponse()

    import parsers.jd_url_fetcher as fetcher
    monkeypatch.setattr(fetcher.httpx, "get", mock_get)

    result = fetch_jd_from_url("https://example.com/job")
    assert "Senior Engineer" in result
    assert "Python" in result


def test_fetch_strips_scripts(monkeypatch):
    mock_html = """
    <html>
    <head><script>var evil = 1;</script></head>
    <body>
        <p>Job content here</p>
    </body>
    </html>
    """

    def mock_get(*args, **kwargs):
        class MockResponse:
            status_code = 200
            text = mock_html
            headers = {"content-type": "text/html"}

            def raise_for_status(self):
                pass

        return MockResponse()

    import parsers.jd_url_fetcher as fetcher
    monkeypatch.setattr(fetcher.httpx, "get", mock_get)

    result = fetch_jd_from_url("https://example.com/job")
    assert "evil" not in result
    assert "Job content" in result
