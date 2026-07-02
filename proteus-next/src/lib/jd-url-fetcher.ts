import * as cheerio from "cheerio";

export async function fetchJdFromUrl(url: string): Promise<string> {
  if (!url || (!url.startsWith("http://") && !url.startsWith("https://"))) {
    throw new Error("Invalid URL: must start with http:// or https://");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ProteusBot/1.0)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status} for URL: ${url}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      throw new Error(`URL does not return HTML (content-type: ${contentType})`);
    }

    const html = await response.text();
    return extractTextFromHtml(html);
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error(`Request timed out for URL: ${url}`);
      }
      throw new Error(`Failed to fetch URL: ${error.message}`);
    }
    throw error;
  }
}

function extractTextFromHtml(html: string): string {
  const $ = cheerio.load(html);

  // Remove non-content elements
  $("script, style, nav, footer, header, aside").remove();

  // Try to find main content container
  let content = "";
  if ($("article").length) {
    content = $("article").text();
  } else if ($("main").length) {
    content = $("main").text();
  } else if ($("body").length) {
    content = $("body").text();
  } else {
    content = $.text();
  }

  // Clean up whitespace
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n")
    .trim();
}
