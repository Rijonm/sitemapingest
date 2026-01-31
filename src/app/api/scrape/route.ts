import { NextRequest } from "next/server";
import { parseSitemap } from "@/lib/sitemap-parser";
import { scrapePage } from "@/lib/page-scraper";
import { buildTree, renderTree } from "@/lib/tree-builder";
import { estimateTokens } from "@/lib/token-estimator";
import { runWithConcurrency } from "@/lib/concurrency";
import { formatOutput } from "@/lib/formatter";
import type { ScrapedPage, ScrapeResult } from "@/types";

function sendEvent(
  controller: ReadableStreamDefaultController,
  type: string,
  data: unknown
) {
  const payload = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
  controller.enqueue(new TextEncoder().encode(payload));
}

export async function GET(req: NextRequest) {
  const sitemapUrl = req.nextUrl.searchParams.get("url");

  if (!sitemapUrl) {
    return new Response(JSON.stringify({ error: "Missing url parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validate URL
  try {
    new URL(sitemapUrl);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid URL" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Phase 1: Parse sitemap
        sendEvent(controller, "status", "Parsing sitemap...");
        const urls = await parseSitemap(sitemapUrl);

        if (urls.length === 0) {
          sendEvent(controller, "error", "No URLs found in sitemap");
          controller.close();
          return;
        }

        sendEvent(controller, "status", `Found ${urls.length} pages. Starting scrape...`);
        sendEvent(controller, "progress", { current: 0, total: urls.length });

        // Phase 2: Scrape pages with concurrency
        const pages: ScrapedPage[] = await runWithConcurrency(
          urls,
          async (url) => {
            const result = await scrapePage(url);
            sendEvent(controller, "page", {
              url: result.url,
              title: result.title,
              wordCount: result.wordCount,
              error: result.error,
            });
            return result;
          },
          5,
          (completed, total) => {
            sendEvent(controller, "progress", { current: completed, total });
          }
        );

        // Phase 3: Build result
        sendEvent(controller, "status", "Building results...");

        const tree = renderTree(buildTree(urls));
        const successfulPages = pages.filter((p) => !p.error);
        const totalWords = successfulPages.reduce((sum, p) => sum + p.wordCount, 0);

        const result: ScrapeResult = {
          sitemapUrl,
          totalPages: urls.length,
          successfulPages: successfulPages.length,
          failedPages: pages.length - successfulPages.length,
          totalWords,
          estimatedTokens: estimateTokens(
            formatOutput({
              sitemapUrl,
              totalPages: urls.length,
              successfulPages: successfulPages.length,
              failedPages: pages.length - successfulPages.length,
              totalWords,
              estimatedTokens: 0,
              tree,
              pages,
            })
          ),
          tree,
          pages,
        };

        sendEvent(controller, "complete", result);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        sendEvent(controller, "error", message);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
