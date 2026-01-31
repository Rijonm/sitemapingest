"use client";

import { useState } from "react";

interface Props {
  content: string;
  filename?: string;
}

export default function CopyDownloadButtons({ content, filename = "sitemap-content.txt" }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={handleCopy}
        className="btn-brutal"
      >
        {copied ? "Copied!" : "Copy All"}
      </button>
      <button
        onClick={handleDownload}
        className="btn-brutal"
      >
        Download .txt
      </button>
    </div>
  );
}
