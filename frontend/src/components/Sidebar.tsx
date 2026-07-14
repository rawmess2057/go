"use client";

import { useMemo } from "react";
import Link from "next/link";
import { BountyData } from "@/hooks/useBounties";
import { useTranslation } from "@/lib/i18n";
import { useSolPrice } from "@/hooks/useSolPrice";

function shortPk(pk: string) {
  return `${pk.slice(0, 4)}...${pk.slice(-4)}`;
}

export default function Sidebar({
  bounties,
  loading,
}: {
  bounties: BountyData[];
  loading: boolean;
}) {
  const { t } = useTranslation();
  const solPrice = useSolPrice();

  const highestValue = useMemo(
    () =>
      [...bounties]
        .sort((a, b) => Number(b.amount) - Number(a.amount))
        .slice(0, 5),
    [bounties]
  );

  const topCreators = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    for (const b of bounties) {
      const key = b.creator.toBase58();
      const cur = map.get(key) || { total: 0, count: 0 };
      cur.total += Number(b.amount);
      cur.count += 1;
      map.set(key, cur);
    }
    return [...map.entries()]
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5);
  }, [bounties]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">
          <div className="h-4 bg-muted rounded w-24" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sticky top-24">
      <div className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="text-sm font-semibold mb-4 text-foreground">{t("sidebar.highestValue")}</h3>
        <div className="space-y-3">
          {highestValue.map((b) => {
            const sol = Number(b.amount) / 1e9;
            const usd = solPrice ? (sol * solPrice).toFixed(2) : null;
            return (
              <Link
                key={b.publicKey.toBase58()}
                href={`/gig/${b.publicKey.toBase58()}`}
                className="block group"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-foreground/80 group-hover:text-brand transition-colors truncate">
                    {b.title || "Untitled"}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-0.5 tabular-nums">
                  <span className="text-xs font-medium text-brand">{sol.toFixed(2)} SOL</span>
                  {usd && <span className="text-xs text-muted-foreground/50">(${usd})</span>}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="text-sm font-semibold mb-4 text-foreground">{t("sidebar.topCreators")}</h3>
        <div className="space-y-3">
          {topCreators.map(([pk, data], i) => (
            <div key={pk} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm text-foreground/80 truncate font-mono text-xs">
                  {shortPk(pk)}
                </span>
              </div>
              <div className="text-right shrink-0 tabular-nums">
                <p className="text-xs font-medium text-foreground">
                  {(Number(data.total) / 1e9).toFixed(1)} SOL
                </p>
                <p className="text-[10px] text-muted-foreground/50">{data.count} bounties</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
