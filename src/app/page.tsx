"use client";

import { useState, useRef, useCallback } from "react";
import SitemapForm from "@/components/SitemapForm";
import ProgressBar from "@/components/ProgressBar";
import ResultsPanel from "@/components/ResultsPanel";
import type { ScrapeResult, ProgressData } from "@/types";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState<ProgressData>({ current: 0, total: 0 });
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const handleSubmit = useCallback((url: string) => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    setStatus("Connecting...");
    setProgress({ current: 0, total: 0 });

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource(`/api/scrape?url=${encodeURIComponent(url)}`);
    eventSourceRef.current = es;

    es.addEventListener("status", (e) => {
      setStatus(JSON.parse(e.data));
    });

    es.addEventListener("progress", (e) => {
      const data = JSON.parse(e.data) as ProgressData;
      setProgress(data);
    });

    es.addEventListener("complete", (e) => {
      const data = JSON.parse(e.data) as ScrapeResult;
      setResult(data);
      setIsLoading(false);
      setStatus("");
      es.close();
    });

    es.addEventListener("error", (e) => {
      if (e instanceof MessageEvent && e.data) {
        setError(JSON.parse(e.data));
      } else {
        setError("Connection lost");
      }
      setIsLoading(false);
      es.close();
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-10">
          <div className="flex items-center justify-center mb-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              Sitemap<span className="text-accent">Ingest</span>
            </h1>
            <a
              href="https://github.com/Rijonm/sitemapingest"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-brutal px-3 py-2 text-sm flex items-center gap-2 ml-4"
            >
              <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
          <p className="text-neutral-600 font-medium text-center">
            Extract readable text from any sitemap &mdash; ready for LLMs
          </p>
        </div>

        <div className="card-brutal p-6 mb-8">
          <SitemapForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        {isLoading && (
          <div className="mb-8">
            <ProgressBar
              current={progress.current}
              total={progress.total}
              status={status}
            />
          </div>
        )}

        {error && (
          <div className="card-brutal border-red-500 p-5 mb-8">
            <p className="font-bold text-red-600">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {result && <ResultsPanel result={result} />}
      </div>
    </div>
  );
}
