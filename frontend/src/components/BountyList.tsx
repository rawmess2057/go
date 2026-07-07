"use client";

import { useState } from "react";
import { useBounties } from "@/hooks/useBounties";
import BountyCard from "./BountyCard";
import { BountyStatus } from "@/lib/constants";
import EmptyState from "./EmptyState";
import { useTranslation } from "@/lib/i18n";

const FILTERS = [
  { labelKey: "bountyList.all", value: -1 },
  { labelKey: "status.open", value: BountyStatus.Open },
  { labelKey: "status.submitted", value: BountyStatus.Submitted },
  { labelKey: "status.completed", value: BountyStatus.Completed },
] as const;

export default function BountyList() {
  const { t } = useTranslation();
  const { bounties, loading, refetch } = useBounties();
  const [activeFilter, setActiveFilter] = useState(-1);

  const filtered =
    activeFilter === -1
      ? bounties
      : bounties.filter((b) => b.status === activeFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeFilter === f.value
                  ? "bg-brand text-white shadow-sm"
                  : "border border-border text-zinc-600 hover:border-brand/50 hover:text-brand"
              }`}
            >
              {t(f.labelKey)}
            </button>
          ))}
        </div>
        <button
          onClick={refetch}
          className="text-sm text-zinc-400 hover:text-brand transition-colors"
        >
          {t("bountyList.refresh")}
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={t("bountyList.emptyTitle")}
          description={
            activeFilter === -1
              ? t("bountyList.emptyDescAll")
              : t("bountyList.emptyDescFilter")
          }
          actionLabel={t("bountyList.emptyAction")}
          actionHref="/create"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => (
            <BountyCard key={b.publicKey.toBase58()} bounty={b} />
          ))}
        </div>
      )}
    </div>
  );
}
