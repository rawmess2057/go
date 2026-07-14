"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useBounties } from "@/hooks/useBounties";
import UserAvatar from "@/components/UserAvatar";
import { useTranslation } from "@/lib/i18n";
import PageTransition from "@/components/PageTransition";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";

function shortPk(pk: string) {
  return `${pk.slice(0, 4)}...${pk.slice(-4)}`;
}

export default function LeaderboardPage() {
  const { t } = useTranslation();
  const { bounties, loading } = useBounties();

  const topCreators = useMemo(() => {
    const map = new Map<string, { spent: number; count: number }>();
    for (const b of bounties) {
      const key = b.creator.toBase58();
      const cur = map.get(key) || { spent: 0, count: 0 };
      cur.spent += Number(b.amount);
      cur.count += 1;
      map.set(key, cur);
    }
    return [...map.entries()]
      .sort((a, b) => b[1].spent - a[1].spent)
      .slice(0, 20);
  }, [bounties]);

  const topEarners = useMemo(() => {
    const map = new Map<string, { earned: number; count: number }>();
    for (const b of bounties) {
      if (b.status < 3) continue;
      const perWinner = Number(b.amount) / Math.max(b.maxWinners, 1);
      const key = b.creator.toBase58();
      const cur = map.get(key) || { earned: 0, count: 0 };
      cur.earned += perWinner;
      cur.count += 1;
      map.set(key, cur);
    }
    return [...map.entries()]
      .sort((a, b) => b[1].earned - a[1].earned)
      .slice(0, 20);
  }, [bounties]);

  return (
    <PageTransition>
      <div>
        <h1 className="text-2xl font-bold mb-2 text-white">{t("leaderboard.title")}</h1>
        <p className="text-sm text-white/60 mb-8">
          {t("leaderboard.topEarners")} &amp; {t("leaderboard.topCreators")}
        </p>

        <div className="grid gap-8 lg:grid-cols-2">
          <LiquidGlassCard glowIntensity="sm" shadowIntensity="sm" borderRadius="16px" blurIntensity="sm" className="bg-brand-dark">
            <div className="px-5 py-4 border-b border-white/20 bg-white/10">
              <h2 className="text-sm font-semibold text-white">{t("leaderboard.topCreators")}</h2>
            </div>
            <div className="divide-y divide-white/20">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
                      <div className="w-8 h-8 rounded-full bg-white/20" />
                      <div className="flex-1 h-3 bg-white/20 rounded" />
                    </div>
                  ))
                : topCreators.map(([pk, data], i) => (
                    <Link key={pk} href={`/profile/${pk}`} className="flex items-center gap-3 px-5 py-3 hover:bg-white/10 transition-colors group">
                      <span className="w-6 text-center text-sm font-bold text-white/40">{i + 1}</span>
                      <UserAvatar pubkey={pk} size={32} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate group-hover:text-white transition-colors">{shortPk(pk)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">{(Number(data.spent) / 1e9).toFixed(1)} SOL</p>
                        <p className="text-xs text-white/60">{data.count} {t("leaderboard.bounties")}</p>
                      </div>
                    </Link>
                  ))}
            </div>
          </LiquidGlassCard>

          <LiquidGlassCard glowIntensity="sm" shadowIntensity="sm" borderRadius="16px" blurIntensity="sm" className="bg-brand-dark">
            <div className="px-5 py-4 border-b border-white/20 bg-white/10">
              <h2 className="text-sm font-semibold text-white">{t("leaderboard.topEarners")}</h2>
            </div>
            <div className="divide-y divide-white/20">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
                      <div className="w-8 h-8 rounded-full bg-white/20" />
                      <div className="flex-1 h-3 bg-white/20 rounded" />
                    </div>
                  ))
                : topEarners.map(([pk, data], i) => (
                    <Link key={pk} href={`/profile/${pk}`} className="flex items-center gap-3 px-5 py-3 hover:bg-white/10 transition-colors group">
                      <span className="w-6 text-center text-sm font-bold text-white/40">{i + 1}</span>
                      <UserAvatar pubkey={pk} size={32} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate group-hover:text-white transition-colors">{shortPk(pk)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">{(Number(data.earned) / 1e9).toFixed(1)} SOL</p>
                        <p className="text-xs text-white/60">{data.count} {t("leaderboard.bounties")}</p>
                      </div>
                    </Link>
                  ))}
            </div>
          </LiquidGlassCard>
        </div>
      </div>
    </PageTransition>
  );
}
