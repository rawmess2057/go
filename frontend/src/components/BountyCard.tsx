"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import UserAvatar from "./UserAvatar";
import { BountyData } from "@/hooks/useBounties";
import { BountyStatus } from "@/lib/constants";
import CountdownTimer from "./CountdownTimer";
import { useThumbnailUrl } from "@/hooks/useThumbnail";
import { useSolPrice } from "@/hooks/useSolPrice";
import { useTranslation } from "@/lib/i18n";
import { isValidImageUri } from "@/lib/validate";
import { useRouter } from "next/navigation";

const STATUS_META: Record<number, { labelKey: string; color: string }> = {
  [BountyStatus.Open]: { labelKey: "status.open", color: "bg-brand/10 text-brand border-brand/20" },
  [BountyStatus.Submitted]: { labelKey: "status.submitted", color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
  [BountyStatus.WinnerSelected]: { labelKey: "status.winnerSelected", color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
  [BountyStatus.Completed]: { labelKey: "status.completed", color: "bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700" },
  [BountyStatus.Disputed]: { labelKey: "status.disputed", color: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800" },
  [BountyStatus.Expired]: { labelKey: "status.expired", color: "bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-700" },
};

function shortPk(pk: string) {
  return `${pk.slice(0, 4)}...${pk.slice(-4)}`;
}

export default function BountyCard({ bounty, index = 0 }: { bounty: BountyData; index?: number }) {
  const router = useRouter();
  const { t } = useTranslation();
  const solPrice = useSolPrice();
  const status = STATUS_META[bounty.status] || STATUS_META[BountyStatus.Open];
  const deadlineNum = Number(bounty.deadline);
  const now = Math.floor(Date.now() / 1000);
  const isExpired = deadlineNum < now;
  const thumbUrl = useThumbnailUrl(bounty.thumbnailUri);
  const solAmount = Number(bounty.amount) / 1e9;
  const usdAmount = solPrice ? (solAmount * solPrice).toFixed(2) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link
        href={`/inaam/${bounty.publicKey.toBase58()}`}
        className="group block relative rounded-2xl border border-border bg-card hover:border-brand/40 transition-all duration-300 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                {thumbUrl && isValidImageUri(thumbUrl) ? (
                  <img
                    src={thumbUrl}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover border border-border shrink-0"
                  />
                ) : (
                  <UserAvatar pubkey={bounty.creator.toBase58()} size={40} className="shrink-0" />
                )}
                <div className="min-w-0">
                  <h3 className="font-semibold text-base truncate group-hover:text-brand transition-colors">
                    {bounty.title || `${t("bountyCard.untitled")}${bounty.bump}`}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/profile/${bounty.creator.toBase58()}`); }}
                      className="text-xs text-muted-foreground hover:text-brand transition-colors"
                    >
                      {t("bountyCard.by")} {shortPk(bounty.creator.toBase58())}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-medium border ${status.color}`}
            >
              {t(status.labelKey)}
            </span>
          </div>

          {bounty.description && (
            <p className="mt-2.5 text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed">
              {bounty.description}
            </p>
          )}

          <div className="mt-4 flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-xl text-foreground">
                  {solAmount.toFixed(2)} SOL
                </span>
                {usdAmount && (
                  <span className="text-sm text-muted-foreground/60">(${usdAmount})</span>
                )}
              </div>
              <span className="text-xs text-muted-foreground/50">
                {t("bountyCard.perWinner")}: {(solAmount / Math.max(bounty.maxWinners, 1)).toFixed(2)} SOL
              </span>
            </div>
            <div className="text-right">
              {isExpired ? (
                <span className="text-xs font-medium text-red-500">{t("bountyCard.expired")}</span>
              ) : (
                <CountdownTimer target={deadlineNum} />
              )}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {new Date(Number(bounty.createdAt) * 1000).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
            <span>
              {bounty.winnersSelected}/{bounty.maxWinners} {t("bountyCard.winners")}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
