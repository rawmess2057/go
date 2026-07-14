import { LiquidGlassCard } from "@/components/ui/liquid-glass";

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
    color === "brand" ? "text-white" : color === "blue" ? "text-blue-500" : "text-foreground";

  return (
    <LiquidGlassCard
      glowIntensity="sm"
      shadowIntensity="sm"
      borderRadius="16px"
      blurIntensity="sm"
      className="bg-brand-dark"
    >
      <div className="p-5">
        <p className="text-sm text-white/60">{label}</p>
        <p className={`mt-1.5 text-2xl font-bold ${accentClass}`}>{value}</p>
        {sub && <p className="mt-1 text-xs text-white/50">{sub}</p>}
      </div>
    </LiquidGlassCard>
  );
}
