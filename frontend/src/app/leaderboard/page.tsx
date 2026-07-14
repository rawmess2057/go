"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useBounties } from "@/hooks/useBounties";
import UserAvatar from "@/components/UserAvatar";
import { useTranslation } from "@/lib/i18n";
import PageTransition from "@/components/PageTransition";

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
        <h1 className="text-2xl font-bold mb-2 text-foreground">{t("leaderboard.title")}</h1>
        <p className="text-sm text-muted-foreground mb-8">
          {t("leaderboard.topEarners")} &amp; {t("leaderboard.topCreators")}
        </p>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted/30">
              <h2 className="text-sm font-semibold text-foreground">{t("leaderboard.topCreators")}</h2>
            </div>
            <div className="divide-y divide-border">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
                      <div className="w-8 h-8 rounded-full bg-muted" />
                      <div className="flex-1 h-3 bg-muted rounded" />
                    </div>
                  ))
                : topCreators.map(([pk, data], i) => (
                    <Link key={pk} href={`/profile/${pk}`} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors group">
                      <span className="w-6 text-center text-sm font-bold text-muted-foreground/40">{i + 1}</span>
                      <UserAvatar pubkey={pk} size={32} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-foreground transition-colors">{shortPk(pk)}</p>
                      </div>
                      <div className="text-right tabular-nums">
                        <p className="text-sm font-semibold text-brand">{(Number(data.spent) / 1e9).toFixed(1)} SOL</p>
                        <p className="text-xs text-muted-foreground">{data.count} {t("leaderboard.bounties")}</p>
                      </div>
                    </Link>
                  ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted/30">
              <h2 className="text-sm font-semibold text-foreground">{t("leaderboard.topEarners")}</h2>
            </div>
            <div className="divide-y divide-border">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
                      <div className="w-8 h-8 rounded-full bg-muted" />
                      <div className="flex-1 h-3 bg-muted rounded" />
                    </div>
                  ))
                : topEarners.map(([pk, data], i) => (
                    <Link key={pk} href={`/profile/${pk}`} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors group">
                      <span className="w-6 text-center text-sm font-bold text-muted-foreground/40">{i + 1}</span>
                      <UserAvatar pubkey={pk} size={32} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-foreground transition-colors">{shortPk(pk)}</p>
                      </div>
                      <div className="text-right tabular-nums">
                        <p className="text-sm font-semibold text-brand">{(Number(data.earned) / 1e9).toFixed(1)} SOL</p>
                        <p className="text-xs text-muted-foreground">{data.count} {t("leaderboard.bounties")}</p>
                      </div>
                    </Link>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
