"use client";

import { useState } from "react";

interface Props {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export default function SitemapForm({ onSubmit, isLoading }: Props) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com/sitemap.xml"
        required
        className="flex-1 px-4 py-3 border-2 border-neutral-900 text-base font-mono bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 placeholder:text-neutral-400"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="btn-brutal btn-accent px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Scraping..." : "Ingest"}
      </button>
    </form>
  );
}
