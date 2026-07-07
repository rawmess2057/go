"use client";

import { useState, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useBounties, BountyData } from "@/hooks/useBounties";
import { useWonSubmissions } from "@/hooks/useWonSubmissions";
import StatsCard from "@/components/StatsCard";
import Link from "next/link";
import { BountyStatus } from "@/lib/constants";
import { useTranslation } from "@/lib/i18n";

type Tab = "created" | "history";

export default function DashboardPage() {
  const { t } = useTranslation();
  const wallet = useWallet();
  const { bounties, loading, refetch } = useBounties();
  const { totalEarned } = useWonSubmissions(wallet.publicKey ?? null);
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
        <p className="text-zinc-500">{t("detail.connectWallet")}</p>
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
    { key: "created", labelKey: "dashboard.tabs.myInaams", count: created.length },
    { key: "history", labelKey: "dashboard.tabs.history", count: 0 },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
        <button
          onClick={refetch}
          className="text-sm text-zinc-400 hover:text-brand transition-colors"
        >
          {t("dashboard.refresh")}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatsCard label={t("dashboard.totalSpent")} value={`${totalSpent.toFixed(2)} SOL`} color="brand" />
        <StatsCard label={t("dashboard.totalEarned")} value={`${totalEarned.toFixed(2)} SOL`} color="brand" />
        <StatsCard label={t("dashboard.active")} value={`${created.filter((b) => b.status < BountyStatus.Completed).length}`} />
        <StatsCard label={t("dashboard.completed")} value={`${created.filter((b) => b.status === BountyStatus.Completed).length}`} />
      </div>

      <div className="flex gap-1 border-b border-border mb-6">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key as Tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === tabItem.key
                ? "border-brand text-brand"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            }`}
          >
            {t(tabItem.labelKey)}
            {tabItem.count > 0 && (
              <span className="ml-1.5 text-xs bg-muted px-1.5 py-0.5 rounded-full">
                {tabItem.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "created" && <BountyTable bounties={created} emptyMsg={t("dashboard.emptyCreated")} />}
      {tab === "history" && (
        <div className="text-center py-12 text-zinc-400 text-sm">
          {t("dashboard.historyComing")}
        </div>
      )}
    </div>
  );
}

function BountyTable({ bounties, emptyMsg }: { bounties: BountyData[]; emptyMsg: string }) {
  const { t } = useTranslation();

  if (bounties.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400 text-sm">{emptyMsg}</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-zinc-400 text-xs uppercase tracking-wider">
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
            <tr key={b.publicKey.toBase58()} className="border-b border-border hover:bg-muted/50">
              <td className="py-3 px-2 font-medium truncate max-w-[200px]">
                {b.title || "Untitled"}
              </td>
              <td className="py-3 px-2">{(Number(b.amount) / 1e9).toFixed(2)} SOL</td>
              <td className="py-3 px-2">
                <StatusBadge status={b.status} />
              </td>
              <td className="py-3 px-2 text-zinc-400">
                {b.winnersSelected}/{b.maxWinners}
              </td>
              <td className="py-3 px-2 text-zinc-400">
                {new Date(Number(b.deadline) * 1000).toLocaleDateString()}
              </td>
              <td className="py-3 px-2">
                <Link
                  href={`/inaam/${b.publicKey.toBase58()}`}
                  className="text-brand text-xs hover:underline"
                >
                  {t("dashboard.table.view")}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: number }) {
  const { t } = useTranslation();
  const map: Record<number, string> = {
    [BountyStatus.Open]: "text-brand",
    [BountyStatus.Submitted]: "text-amber-500",
    [BountyStatus.WinnerSelected]: "text-blue-500",
    [BountyStatus.Completed]: "text-zinc-400",
    [BountyStatus.Disputed]: "text-red-500",
    [BountyStatus.Expired]: "text-zinc-300",
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
    <span className={`text-xs font-medium ${map[status] || ""}`}>
      {t(labelKeys[status] || "status.unknown")}
    </span>
  );
}
