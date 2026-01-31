import { load } from "cheerio";
import type { ScrapedPage } from "@/types";

const REMOVE_SELECTORS = [
  "script",
  "style",
  "noscript",
  "iframe",
  "svg",
  "nav",
  "footer",
  "header",
  "aside",
  '[role="navigation"]',
  '[role="banner"]',
  '[role="contentinfo"]',
  '[aria-hidden="true"]',
  ".cookie-banner",
  ".ad",
  ".advertisement",
  ".sidebar",
  ".nav",
  ".menu",
  ".popup",
  ".modal",
];

const CONTENT_SELECTORS = [
  "article",
  "main",
  '[role="main"]',
  ".post-content",
  ".entry-content",
  ".article-content",
  ".content",
  "#content",
];

export async function scrapePage(url: string): Promise<ScrapedPage> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "SitemapIngest/1.0",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return { url, title: "", content: "", wordCount: 0, error: `HTTP ${response.status}` };
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return { url, title: "", content: "", wordCount: 0, error: "Not HTML" };
    }

    const html = await response.text();
    const $ = load(html);

    // Extract title
    const title = $("title").first().text().trim() || url;

    // Remove non-content elements
    $(REMOVE_SELECTORS.join(", ")).remove();

    // Try content containers first, fall back to body
    let contentSelector = "body";
    for (const selector of CONTENT_SELECTORS) {
      if ($(selector).length > 0) {
        contentSelector = selector;
        break;
      }
    }

    // Extract text
    const text = $(contentSelector)
      .first()
      .text()
      .replace(/[ \t]+/g, " ")
      .replace(/\n\s*\n/g, "\n\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    const wordCount = text.split(/\s+/).filter(Boolean).length;

    return { url, title, content: text, wordCount };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { url, title: "", content: "", wordCount: 0, error: message };
  }
}
