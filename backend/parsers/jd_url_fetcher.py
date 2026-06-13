import httpx
from bs4 import BeautifulSoup


def fetch_jd_from_url(url: str) -> str:
    if not url or not url.strip():
        raise ValueError("URL cannot be empty")

    if not url.startswith(("http://", "https://")):
        raise ValueError(f"Invalid URL scheme: {url}")

    try:
        response = httpx.get(
            url,
            timeout=15.0,
            follow_redirects=True,
            headers={
                "User-Agent": "Mozilla/5.0 (compatible; ProteusBot/1.0)",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
        )
        response.raise_for_status()
    except httpx.TimeoutException:
        raise ValueError(f"Request timed out for URL: {url}")
    except httpx.HTTPStatusError as e:
        raise ValueError(f"HTTP error {e.response.status_code} for URL: {url}")
    except httpx.RequestError as e:
        raise ValueError(f"Failed to fetch URL: {e}")

    content_type = response.headers.get("content-type", "")
    if "text/html" not in content_type and "application/xhtml" not in content_type:
        raise ValueError(f"URL did not return HTML (got {content_type})")

    soup = BeautifulSoup(response.text, "html.parser")

    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()

    article = soup.find("article")
    if article:
        return article.get_text(separator="\n", strip=True)

    main = soup.find("main")
    if main:
        return main.get_text(separator="\n", strip=True)

    body = soup.find("body")
    if body:
        return body.get_text(separator="\n", strip=True)

    return soup.get_text(separator="\n", strip=True)
