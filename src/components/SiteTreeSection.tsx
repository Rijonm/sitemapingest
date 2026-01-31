interface Props {
  tree: string;
}

export default function SiteTreeSection({ tree }: Props) {
  return (
    <div className="card-brutal p-5">
      <h2 className="text-lg font-black mb-3">Site Structure</h2>
      <pre className="overflow-x-auto text-sm font-mono bg-neutral-50 p-4 border-2 border-neutral-900 whitespace-pre">
        {tree}
      </pre>
    </div>
  );
}
