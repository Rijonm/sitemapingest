import type { ScrapeResult } from "@/types";

export function formatOutput(result: ScrapeResult): string {
  const lines: string[] = [];

  // Summary
  lines.push("=" .repeat(60));
  lines.push(`Sitemap: ${result.sitemapUrl}`);
  lines.push(`Pages: ${result.successfulPages}/${result.totalPages} scraped successfully`);
  lines.push(`Words: ${result.totalWords.toLocaleString()}`);
  lines.push(`Estimated tokens: ~${result.estimatedTokens.toLocaleString()}`);
  lines.push("=".repeat(60));
  lines.push("");

  // Tree
  lines.push("Site Structure:");
  lines.push("-".repeat(40));
  lines.push(result.tree);
  lines.push("");

  // Page contents
  lines.push("Page Contents:");
  lines.push("=".repeat(60));

  for (const page of result.pages) {
    if (page.error) continue;
    lines.push("");
    lines.push(`${"─".repeat(60)}`);
    lines.push(`URL: ${page.url}`);
    lines.push(`Title: ${page.title}`);
    lines.push(`Words: ${page.wordCount}`);
    lines.push(`${"─".repeat(60)}`);
    lines.push(page.content);
    lines.push("");
  }

  return lines.join("\n");
}
