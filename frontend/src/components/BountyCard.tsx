"use client";

import Link from "next/link";
import { BountyData } from "@/hooks/useBounties";
import { BountyStatus } from "@/lib/constants";
import CountdownTimer from "./CountdownTimer";
import { useThumbnailUrl } from "@/hooks/useThumbnail";
import { useTranslation } from "@/lib/i18n";

const statusConfig: Record<number, { labelKey: string; classes: string }> = {
  [BountyStatus.Open]: { labelKey: "status.open", classes: "bg-brand/10 text-brand" },
  [BountyStatus.Submitted]: { labelKey: "status.submitted", classes: "bg-amber-100 text-amber-700" },
  [BountyStatus.WinnerSelected]: { labelKey: "status.winnerSelected", classes: "bg-blue-100 text-blue-700" },
  [BountyStatus.Completed]: { labelKey: "status.completed", classes: "bg-zinc-100 text-zinc-500" },
  [BountyStatus.Disputed]: { labelKey: "status.disputed", classes: "bg-red-100 text-red-700" },
  [BountyStatus.Expired]: { labelKey: "status.expired", classes: "bg-zinc-100 text-zinc-400" },
};

export default function BountyCard({ bounty }: { bounty: BountyData }) {
  const { t } = useTranslation();
  const status = statusConfig[bounty.status] || statusConfig[BountyStatus.Open];
  const deadlineNum = Number(bounty.deadline);
  const now = Math.floor(Date.now() / 1000);
  const isExpired = deadlineNum < now;
  const thumbUrl = useThumbnailUrl(bounty.thumbnailUri);

  return (
    <Link
      href={`/inaam/${bounty.publicKey.toBase58()}`}
      className="block rounded-xl border border-border bg-white p-5 hover:border-brand/50 hover:shadow-sm transition-all border-l-4 border-l-brand"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            {thumbUrl && (
              <img
                src={thumbUrl}
                alt=""
                className="w-10 h-10 rounded-lg object-cover border border-border shrink-0"
              />
            )}
            <h3 className="font-semibold text-base truncate">
              {bounty.title || `${t("bountyCard.untitled")}${bounty.bump}`}
            </h3>
          </div>
          <p className="mt-1 text-sm text-zinc-500 line-clamp-2">
            {bounty.description || t("bountyCard.noDescription")}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${status.classes}`}
        >
          {t(status.labelKey)}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="font-semibold text-lg text-brand">
          {(Number(bounty.amount) / 1e9).toFixed(2)} SOL
        </span>
        {isExpired ? (
          <span className="text-red-500 text-xs font-medium">{t("bountyCard.expired")}</span>
        ) : (
          <CountdownTimer target={deadlineNum} />
        )}
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs text-zinc-400">
        <span>
          {t("bountyCard.created")}{" "}
          {new Date(Number(bounty.createdAt) * 1000).toLocaleDateString()}
        </span>
        <span>
          {t("bountyCard.winners")}: {bounty.winnersSelected}/{bounty.maxWinners}
        </span>
      </div>
    </Link>
  );
}
