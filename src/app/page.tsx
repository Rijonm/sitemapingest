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
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10 relative">
          <a
            href="https://github.com/Rijonm/sitemapingest"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-0 top-1 btn-brutal px-3 py-2 text-sm"
          >
            GitHub
          </a>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
            Sitemap<span className="text-accent">Ingest</span>
          </h1>
          <p className="text-neutral-600 font-medium">
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
