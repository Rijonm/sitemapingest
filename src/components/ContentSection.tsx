"use client";

import { useState } from "react";
import type { ScrapedPage } from "@/types";

interface Props {
  pages: ScrapedPage[];
}

export default function ContentSection({ pages }: Props) {
  const [expandedUrl, setExpandedUrl] = useState<string | null>(null);
  const successful = pages.filter((p) => !p.error);

  return (
    <div className="card-brutal p-5">
      <h2 className="text-lg font-black mb-3">Page Contents ({successful.length} pages)</h2>
      <div className="space-y-2">
        {successful.map((page) => (
          <div key={page.url} className="border-2 border-neutral-900">
            <button
              onClick={() =>
                setExpandedUrl(expandedUrl === page.url ? null : page.url)
              }
              className="w-full text-left p-3 flex items-center justify-between hover:bg-neutral-50 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="font-bold text-sm truncate">{page.title}</div>
                <div className="text-xs text-neutral-500 truncate">{page.url}</div>
              </div>
              <div className="flex items-center gap-3 ml-3 shrink-0">
                <span className="text-xs text-neutral-500">
                  {page.wordCount.toLocaleString()} words
                </span>
                <span className="text-lg font-mono">
                  {expandedUrl === page.url ? "−" : "+"}
                </span>
              </div>
            </button>
            {expandedUrl === page.url && (
              <div className="border-t-2 border-neutral-900 p-4 bg-neutral-50">
                <pre className="whitespace-pre-wrap text-sm font-mono break-words max-h-96 overflow-y-auto">
                  {page.content}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
