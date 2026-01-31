"use client";

import type { ScrapeResult } from "@/types";
import SummarySection from "./SummarySection";
import SiteTreeSection from "./SiteTreeSection";
import ContentSection from "./ContentSection";
import CopyDownloadButtons from "./CopyDownloadButtons";
import { formatOutput } from "@/lib/formatter";

interface Props {
  result: ScrapeResult;
}

export default function ResultsPanel({ result }: Props) {
  const fullText = formatOutput(result);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">Results</h2>
        <CopyDownloadButtons content={fullText} />
      </div>
      <SummarySection
        totalPages={result.totalPages}
        successfulPages={result.successfulPages}
        failedPages={result.failedPages}
        totalWords={result.totalWords}
        estimatedTokens={result.estimatedTokens}
      />
      <SiteTreeSection tree={result.tree} />
      <ContentSection pages={result.pages} />
    </div>
  );
}
