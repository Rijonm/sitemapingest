interface Props {
  totalPages: number;
  successfulPages: number;
  failedPages: number;
  totalWords: number;
  estimatedTokens: number;
}

export default function SummarySection({
  totalPages,
  successfulPages,
  failedPages,
  totalWords,
  estimatedTokens,
}: Props) {
  const stats = [
    { label: "Pages Scraped", value: `${successfulPages}/${totalPages}` },
    { label: "Failed", value: failedPages.toString() },
    { label: "Total Words", value: totalWords.toLocaleString() },
    { label: "Est. Tokens", value: `~${estimatedTokens.toLocaleString()}` },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="card-brutal p-4 text-center">
          <div className="text-2xl font-black">{stat.value}</div>
          <div className="text-sm text-neutral-600 font-medium">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
