import { XMLParser } from "fast-xml-parser";

const MAX_PAGES = 500;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

export async function parseSitemap(url: string): Promise<string[]> {
  const urls: string[] = [];
  await resolveUrls(url, urls, 0);
  return urls.slice(0, MAX_PAGES);
}

async function resolveUrls(
  url: string,
  collected: string[],
  depth: number
): Promise<void> {
  if (depth > 3 || collected.length >= MAX_PAGES) return;

  const response = await fetch(url, {
    headers: { "User-Agent": "SitemapIngest/1.0" },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  const parsed = parser.parse(text);

  // Handle <sitemapindex> → recurse into child sitemaps
  if (parsed.sitemapindex?.sitemap) {
    const sitemaps = Array.isArray(parsed.sitemapindex.sitemap)
      ? parsed.sitemapindex.sitemap
      : [parsed.sitemapindex.sitemap];

    for (const sm of sitemaps) {
      if (collected.length >= MAX_PAGES) break;
      const loc = sm.loc || sm;
      if (typeof loc === "string") {
        await resolveUrls(loc, collected, depth + 1);
      }
    }
    return;
  }

  // Handle <urlset> → collect page URLs
  if (parsed.urlset?.url) {
    const entries = Array.isArray(parsed.urlset.url)
      ? parsed.urlset.url
      : [parsed.urlset.url];

    for (const entry of entries) {
      if (collected.length >= MAX_PAGES) break;
      const loc = entry.loc || entry;
      if (typeof loc === "string") {
        collected.push(loc);
      }
    }
  }
}
