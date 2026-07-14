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
    color === "brand" ? "text-brand" : color === "blue" ? "text-blue-500" : "text-foreground";

  return (
    <div className="relative rounded-2xl border border-border bg-white overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br from-transparent via-transparent ${color === "brand" ? "to-brand/5" : "to-muted/50"}`} />
      <div className="relative p-5">
        <p className="text-sm text-brand/60">{label}</p>
        <p className={`mt-1.5 text-2xl font-bold ${accentClass}`}>{value}</p>
        {sub && <p className="mt-1 text-xs text-brand/50">{sub}</p>}
      </div>
    </div>
  );
}
