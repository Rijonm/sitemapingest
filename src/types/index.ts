export interface ScrapedPage {
  url: string;
  title: string;
  content: string;
  wordCount: number;
  error?: string;
}

export interface ScrapeResult {
  sitemapUrl: string;
  totalPages: number;
  successfulPages: number;
  failedPages: number;
  totalWords: number;
  estimatedTokens: number;
  tree: string;
  pages: ScrapedPage[];
}

export type SSEEventType = "status" | "progress" | "page" | "complete" | "error";

export interface SSEEvent {
  type: SSEEventType;
  data: unknown;
}

export interface ProgressData {
  current: number;
  total: number;
}

export interface TreeNode {
  name: string;
  children: Map<string, TreeNode>;
  isPage: boolean;
}
