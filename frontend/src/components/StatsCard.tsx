export default function StatsCard({
  label,
  value,
  sub,
  color = "brand",
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  const accentClass =
    color === "brand" ? "text-brand" : color === "blue" ? "text-blue-500" : "text-zinc-500";

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accentClass}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-400">{sub}</p>}
    </div>
  );
}
