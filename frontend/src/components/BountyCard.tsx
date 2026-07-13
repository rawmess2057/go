"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BountyData } from "@/hooks/useBounties";
import { BountyStatus } from "@/lib/constants";
import CountdownTimer from "./CountdownTimer";
import { useThumbnailUrl } from "@/hooks/useThumbnail";
import { useSolPrice } from "@/hooks/useSolPrice";
import { useMetadata } from "@/hooks/useMetadata";
import { useTranslation } from "@/lib/i18n";
import { isValidImageUri } from "@/lib/validate";
import { useRouter } from "next/navigation";
import { getTagDef } from "@/lib/tags";

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
  const metadata = useMetadata(bounty.referenceUri);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link
        href={`/gig/${bounty.publicKey.toBase58()}`}
        className="group block relative rounded-2xl border border-brand/10 bg-brand/[0.03] dark:bg-brand/[0.06] backdrop-blur-xl hover:border-brand/40 hover:-translate-y-1 hover:shadow-[0_0_25px_-8px] hover:shadow-brand/30 transition-all duration-300 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-brand/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative h-48">
          {thumbUrl && isValidImageUri(thumbUrl) ? (
            <img
              src={thumbUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand/10 via-transparent to-purple-500/10" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

          <span
            className={`absolute top-3 right-3 rounded-full px-3 py-1 text-[11px] font-medium border shadow-sm backdrop-blur-sm ${status.color}`}
          >
            {t(status.labelKey)}
          </span>

          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="font-semibold text-base text-white leading-snug line-clamp-2">
              {bounty.title || `${t("bountyCard.untitled")}${bounty.bump}`}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <button
                onClick={(e) => { e.stopPropagation(); router.push(`/profile/${bounty.creator.toBase58()}`); }}
                className="text-xs text-white/70 hover:text-white transition-colors"
              >
                {t("bountyCard.by")} {shortPk(bounty.creator.toBase58())}
              </button>
              {metadata && metadata.tags.length > 0 && (
                metadata.tags.map((key) => {
                  const tag = getTagDef(key);
                  if (!tag) return null;
                  const textOnly = tag.color
                    .replace(/bg-\S+/g, "")
                    .replace(/dark:bg-\S+/g, "")
                    .trim();
                  return (
                    <span
                      key={key}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium backdrop-blur-xl bg-white/70 dark:bg-black/50 border border-white/20 shadow-sm ${textOnly}`}
                    >
                      {tag.label}
                    </span>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="relative p-5">
          {bounty.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {bounty.description}
            </p>
          )}

          <div className="mt-4 flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-xl text-brand">
                  {solAmount.toFixed(2)} SOL
                </span>
                {usdAmount && (
                  <span className="text-sm text-muted-foreground">(${usdAmount})</span>
                )}
              </div>
              <span className="text-xs text-muted-foreground/70">
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
