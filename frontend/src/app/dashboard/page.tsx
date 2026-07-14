"use client";

import { useState, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useBounties, BountyData } from "@/hooks/useBounties";
import { useWonSubmissions } from "@/hooks/useWonSubmissions";
import StatsCard from "@/components/StatsCard";
import ActivityChart from "@/components/ActivityChart";
import RecentActivity from "@/components/RecentActivity";
import PageTransition from "@/components/PageTransition";
import Link from "next/link";
import { BountyStatus } from "@/lib/constants";
import { useTranslation } from "@/lib/i18n";
import { useSolPrice } from "@/hooks/useSolPrice";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";

type Tab = "created" | "history";

export default function DashboardPage() {
  const { t } = useTranslation();
  const wallet = useWallet();
  const { bounties, loading, refetch } = useBounties();
  const { totalEarned } = useWonSubmissions(wallet.publicKey ?? null);
  const solPrice = useSolPrice();
  const [tab, setTab] = useState<Tab>("created");

  const created = useMemo(() => {
      const pk = wallet.publicKey?.toBase58();
      if (!pk) return [];
      return bounties.filter((b) => b.creator.toBase58() === pk);
  }, [bounties, wallet.publicKey]);

  const totalSpent = useMemo(
    () => created.reduce((s, b) => s + Number(b.amount), 0) / 1e9,
    [created]
  );

  if (!wallet.publicKey) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-2">{t("dashboard.title")}</h1>
        <p className="text-white/60">{t("detail.connectWallet")}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs: { key: Tab; labelKey: string; count: number }[] = [
    { key: "created", labelKey: "dashboard.tabs.myGigs", count: created.length },
    { key: "history", labelKey: "dashboard.tabs.history", count: 0 },
  ];

  return (
    <PageTransition>
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">{t("dashboard.title")}</h1>
        <button
          onClick={refetch}
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          {t("dashboard.refresh")}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label={t("dashboard.totalSpent")}
          value={`${totalSpent.toFixed(2)} SOL`}
          sub={solPrice ? `$${(totalSpent * solPrice).toFixed(2)}` : undefined}
          color="brand"
        />
        <StatsCard
          label={t("dashboard.totalEarned")}
          value={`${totalEarned.toFixed(2)} SOL`}
          sub={solPrice ? `$${(totalEarned * solPrice).toFixed(2)}` : undefined}
          color="brand"
        />
        <StatsCard label={t("dashboard.active")} value={`${created.filter((b) => b.status < BountyStatus.Completed).length}`} />
        <StatsCard label={t("dashboard.completed")} value={`${created.filter((b) => b.status === BountyStatus.Completed).length}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <div className="lg:col-span-2">
          <ActivityChart bounties={bounties} />
        </div>
        <div>
          <RecentActivity bounties={bounties} />
        </div>
      </div>

      <div className="flex gap-1 border-b border-white/20 mb-6">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key as Tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === tabItem.key
                ? "border-brand text-white"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            {t(tabItem.labelKey)}
            {tabItem.count > 0 && (
              <span className="ml-1.5 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                {tabItem.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "created" && <BountyTable bounties={created} emptyMsg={t("dashboard.emptyCreated")} />}
      {tab === "history" && (
        <div className="text-center py-12 text-white/60 text-sm">
          {t("dashboard.historyComing")}
        </div>
      )}
    </div>
    </PageTransition>
  );
}

function BountyTable({ bounties, emptyMsg }: { bounties: BountyData[]; emptyMsg: string }) {
  const { t } = useTranslation();

  if (bounties.length === 0) {
    return (
      <div className="text-center py-12 text-white/60 text-sm">{emptyMsg}</div>
    );
  }

  return (
    <LiquidGlassCard glowIntensity="sm" shadowIntensity="sm" borderRadius="16px" blurIntensity="sm" className="bg-brand-dark">
      <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/20 text-white/60 text-xs uppercase tracking-wider">
            <th className="text-left py-3 px-2 font-medium">{t("dashboard.table.title")}</th>
            <th className="text-left py-3 px-2 font-medium">{t("dashboard.table.reward")}</th>
            <th className="text-left py-3 px-2 font-medium">{t("dashboard.table.status")}</th>
            <th className="text-left py-3 px-2 font-medium">{t("dashboard.table.winners")}</th>
            <th className="text-left py-3 px-2 font-medium">{t("dashboard.table.deadline")}</th>
            <th className="text-left py-3 px-2 font-medium" />
          </tr>
        </thead>
        <tbody>
          {bounties.map((b) => (
            <tr key={b.publicKey.toBase58()} className="border-b border-white/20 hover:bg-white/10">
              <td className="py-3 px-2 font-medium text-white truncate max-w-[200px]">
                {b.title || "Untitled"}
              </td>
              <td className="py-3 px-2 text-white">{(Number(b.amount) / 1e9).toFixed(2)} SOL</td>
              <td className="py-3 px-2">
                <StatusBadge status={b.status} />
              </td>
              <td className="py-3 px-2 text-white/60">
                {b.winnersSelected}/{b.maxWinners}
              </td>
              <td className="py-3 px-2 text-white/60">
                {new Date(Number(b.deadline) * 1000).toLocaleDateString()}
              </td>
              <td className="py-3 px-2">
                <Link
                  href={`/gig/${b.publicKey.toBase58()}`}
                  className="text-white/60 text-xs hover:text-white"
                >
                  {t("dashboard.table.view")}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </LiquidGlassCard>
  );
}

function StatusBadge({ status }: { status: number }) {
  const { t } = useTranslation();
  const map: Record<number, string> = {
    [BountyStatus.Open]: "text-white",
    [BountyStatus.Submitted]: "text-amber-500",
    [BountyStatus.WinnerSelected]: "text-blue-500",
    [BountyStatus.Completed]: "text-white/60",
    [BountyStatus.Disputed]: "text-red-500",
    [BountyStatus.Expired]: "text-white/40",
  };
  const labelKeys: Record<number, string> = {
    [BountyStatus.Open]: "status.open",
    [BountyStatus.Submitted]: "status.submitted",
    [BountyStatus.WinnerSelected]: "status.winnerSelected",
    [BountyStatus.Completed]: "status.completed",
    [BountyStatus.Disputed]: "status.disputed",
    [BountyStatus.Expired]: "status.expired",
  };

  return (
    <span className={`text-xs font-medium ${map[status] || "text-brand"}`}>
      {t(labelKeys[status] || "status.unknown")}
    </span>
  );
}
