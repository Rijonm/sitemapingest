interface Props {
  current: number;
  total: number;
  status: string;
}

export default function ProgressBar({ current, total, status }: Props) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="card-brutal p-5 space-y-3">
      <div className="flex justify-between items-center">
        <span className="font-bold text-sm">{status}</span>
        <span className="text-sm font-mono text-neutral-600">
          {current}/{total} pages
        </span>
      </div>
      <div className="w-full h-5 bg-neutral-100 border-2 border-neutral-900">
        <div
          className="h-full bg-accent transition-all duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
