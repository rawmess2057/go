"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import UserAvatar from "./UserAvatar";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL, SendTransactionError } from "@solana/web3.js";
import toast from "react-hot-toast";
import { usePrograms } from "@/hooks/useProgram";
import { BountyData } from "@/hooks/useBounties";
import { BountyStatus, SOL_MINT, PROGRAM_ID, OLD_PROGRAM_ID, vaultAddress, submissionAddress } from "@/lib/constants";
import { useSubmissions } from "@/hooks/useSubmissions";
import { useSolPrice } from "@/hooks/useSolPrice";
import CountdownTimer from "./CountdownTimer";
import { useThumbnailUrl } from "@/hooks/useThumbnail";
import { useMetadata } from "@/hooks/useMetadata";
import { useTranslation } from "@/lib/i18n";
import { isValidUri, isValidSubmissionUri, isValidImageUri } from "@/lib/validate";
import SubmissionUriField from "./SubmissionUriField";
import { TAGS } from "@/lib/tags";
import { useNotifications } from "@/hooks/useNotifications";

const STATUS_META: Record<number, { labelKey: string; color: string }> = {
  [BountyStatus.Open]: { labelKey: "status.open", color: "bg-brand/10 text-brand border-brand/20" },
  [BountyStatus.Submitted]: { labelKey: "status.submitted", color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
  [BountyStatus.WinnerSelected]: { labelKey: "status.winnerSelected", color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
  [BountyStatus.Completed]: { labelKey: "status.completed", color: "bg-muted/50 text-muted-foreground border-border" },
  [BountyStatus.Disputed]: { labelKey: "status.disputed", color: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800" },
  [BountyStatus.Expired]: { labelKey: "status.expired", color: "bg-muted/30 text-muted-foreground/60 border-border" },
};

function shortPk(pk: string) {
  return `${pk.slice(0, 4)}...${pk.slice(-4)}`;
}

function fireConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#55d292", "#3bb87a", "#f59e0b"],
  });
}

export default function BountyDetail({
  bounty,
  onRefresh,
}: {
  bounty: BountyData;
  onRefresh?: () => void;
}) {
  const { t } = useTranslation();
  const { newProgram, oldProgram } = usePrograms();
  const wallet = useWallet();
  const { connection } = useConnection();
  const solPrice = useSolPrice();
  const { addNotification } = useNotifications();
  const [uri, setUri] = useState("");
  const [sending, setSending] = useState<string | null>(null);
  const { submissions, loading: subsLoading } = useSubmissions(bounty.publicKey, bounty.legacy);
  const mySubmission = useMemo(
    () => submissions.find(s => s.worker.toBase58() === wallet.publicKey?.toBase58()),
    [submissions, wallet.publicKey]
  );
  useEffect(() => {
    if (mySubmission && !uri) {
      setUri(mySubmission.uri);
    }
  }, [mySubmission]); // only on mount — uri intentionally excluded
  const hasSubmitted = !!mySubmission;
  const thumbUrl = useThumbnailUrl(bounty.thumbnailUri);
  const metadata = useMetadata(bounty.referenceUri);

  const status = STATUS_META[bounty.status] || STATUS_META[BountyStatus.Open];
  const deadlineNum = Number(bounty.deadline);
  const now = Math.floor(Date.now() / 1000);
  const isExpired = deadlineNum < now;
  const rewardPerWinner = Number(bounty.amount) / Math.max(bounty.maxWinners, 1);
  const solAmount = Number(bounty.amount) / LAMPORTS_PER_SOL;
  const usdAmount = solPrice ? (solAmount * solPrice).toFixed(2) : null;

  const exec = useCallback(
    async (action: string, worker?: PublicKey) => {
      if (!newProgram || !wallet.publicKey) return;
      const program = bounty.legacy ? oldProgram : newProgram;
      const progId = bounty.legacy ? OLD_PROGRAM_ID : PROGRAM_ID;
      setSending(action);
      try {
        let tx: string;

        switch (action) {
          case "submit": {
            const cleanUri = uri.trim();
            if (!cleanUri) {
              toast.error("Submission URI is required");
              return;
            }
            if (!isValidSubmissionUri(cleanUri)) {
              toast.error("Invalid submission URI. Must be a valid https://, ipfs://, or ar:// link");
              return;
            }
            const [subPda] = submissionAddress(bounty.publicKey, wallet.publicKey, progId);
            tx = await program.methods
              .submitCompletion(bounty.bountyId, cleanUri)
              .accounts({
                worker: wallet.publicKey,
                bounty: bounty.publicKey,
                submission: subPda,
                systemProgram: SystemProgram.programId,
              })
              .rpc();
            break;
          }
          case "select-winner": {
            if (!worker) {
              toast.error("Select a submission first");
              return;
            }
            fireConfetti();
            const [submissionPda] = submissionAddress(bounty.publicKey, worker, progId);
            const [vaultPda] = vaultAddress(bounty.publicKey, progId);
            tx = await program.methods
              .selectWinner(bounty.bountyId)
              .accounts({
                moderator: wallet.publicKey,
                bounty: bounty.publicKey,
                submission: submissionPda,
                vault: vaultPda,
                recipient: worker,
                systemProgram: SystemProgram.programId,
                tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
              })
              .rpc();
            break;
          }
          case "reject": {
            if (!worker) {
              toast.error("Select a submission to reject");
              return;
            }
            const [submissionPda] = submissionAddress(bounty.publicKey, worker, progId);
            tx = await program.methods
              .rejectSubmission(bounty.bountyId)
              .accounts({
                moderator: wallet.publicKey,
                bounty: bounty.publicKey,
                submission: submissionPda,
              })
              .rpc();
            break;
          }
          case "dispute": {
            tx = await program.methods
              .raiseDispute(bounty.bountyId)
              .accounts({ signer: wallet.publicKey, bounty: bounty.publicKey })
              .rpc();
            break;
          }
          case "resolve-worker": {
            const [vaultPda] = vaultAddress(bounty.publicKey, progId);
            tx = await program.methods
              .resolveDispute(bounty.bountyId, true)
              .accounts({
                moderator: wallet.publicKey,
                bounty: bounty.publicKey,
                vault: vaultPda,
                recipient: worker || PublicKey.default,
                tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
                systemProgram: SystemProgram.programId,
              })
              .rpc();
            break;
          }
          case "resolve-creator": {
            const [vaultPda] = vaultAddress(bounty.publicKey, progId);
            tx = await program.methods
              .resolveDispute(bounty.bountyId, false)
              .accounts({
                moderator: wallet.publicKey,
                bounty: bounty.publicKey,
                vault: vaultPda,
                recipient: bounty.creator,
                tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
                systemProgram: SystemProgram.programId,
              })
              .rpc();
            break;
          }
          case "refund": {
            const [vaultPda] = vaultAddress(bounty.publicKey, progId);
            tx = await program.methods
              .refundExpired(bounty.bountyId)
              .accounts({
                caller: wallet.publicKey,
                bounty: bounty.publicKey,
                vault: vaultPda,
                creatorRecipient: bounty.creator,
                clock: new PublicKey("SysvarC1ock11111111111111111111111111111111"),
                systemProgram: SystemProgram.programId,
                tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
              })
              .rpc();
            break;
          }
          case "close": {
            tx = await program.methods
              .closeBounty(bounty.bountyId)
              .accounts({ caller: wallet.publicKey, bounty: bounty.publicKey })
              .rpc();
            break;
          }
          default:
            return;
        }

        await connection.confirmTransaction(tx, "confirmed");
        toast.success(`${action} successful`);

        if (action === "submit") {
          addNotification({ type: "submission", title: "Work submitted", body: `You submitted work to "${bounty.title || "Untitled"}"`, href: `/gig/${bounty.publicKey.toBase58()}` });
        } else if (action === "select-winner") {
          addNotification({ type: "completed", title: "Winner selected", body: `You selected a winner for "${bounty.title || "Untitled"}"`, href: `/gig/${bounty.publicKey.toBase58()}` });
        }

        onRefresh?.();
      } catch (err: any) {
        if (err instanceof SendTransactionError) {
          console.error("Transaction simulation logs:", err.logs);
          toast.error("Transaction failed. Check your wallet for details.");
        } else {
          toast.error(err.message || `Failed to ${action}`);
        }
      } finally {
        setSending(null);
      }
    },
    [newProgram, oldProgram, wallet, connection, bounty, uri, onRefresh]
  );

  const isModerator = wallet.publicKey?.toBase58() === bounty.moderator.toBase58();
  const isCreator = wallet.publicKey?.toBase58() === bounty.creator.toBase58();
  const canSubmitMore = bounty.winnersSelected < bounty.maxWinners;
  const p = t("detail.processing");

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="relative rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="relative h-56">
          {thumbUrl && isValidImageUri(thumbUrl) ? (
            <img
              src={thumbUrl}
              alt={bounty.title || "Thumbnail"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand/5 via-transparent to-brand/[0.02]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

          <span className={`absolute top-4 right-4 rounded-full px-4 py-1.5 text-sm font-medium border shadow-sm ${status.color}`}>
            {t(status.labelKey)}
          </span>

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
              {bounty.title || t("detail.untitled")}
            </h1>
            <p className="mt-1.5 text-sm text-white/70 break-all font-mono">
              {shortPk(bounty.publicKey.toBase58())}
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {metadata && metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {metadata.tags.map((key) => {
                const tag = TAGS.find((t) => t.key === key);
                if (!tag) return null;
                return (
                  <span
                    key={key}
                    className={`rounded-full px-3 py-1 text-xs font-medium border ${tag.color}`}
                  >
                    {tag.label}
                  </span>
                );
              })}
            </div>
          )}

          {bounty.description && (
            <p className="mt-5 text-sm text-muted-foreground/80 leading-relaxed max-w-3xl">{bounty.description}</p>
          )}

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-5">
            <div className="bg-muted/50 rounded-xl p-4">
              <span className="text-xs text-muted-foreground/60">{t("detail.rewardPool")}</span>
              <p className="font-bold text-xl text-foreground mt-1">{solAmount.toFixed(3)} SOL</p>
              {usdAmount && <p className="text-xs text-muted-foreground/50 mt-0.5">${usdAmount}</p>}
              {bounty.maxWinners > 1 && (
                <p className="text-xs text-muted-foreground/50 mt-1">
                  {(rewardPerWinner / LAMPORTS_PER_SOL).toFixed(3)} SOL {t("detail.perWinner")}
                </p>
              )}
            </div>
            <div className="bg-muted/50 rounded-xl p-4">
              <span className="text-xs text-muted-foreground/60">{t("detail.deadline")}</span>
              <p className="font-bold text-lg mt-1">
                {isExpired ? (
                  <span className="text-red-500">{t("status.expired")}</span>
                ) : (
                  <CountdownTimer target={deadlineNum} />
                )}
              </p>
              <p className="text-xs text-muted-foreground/50 mt-0.5">
                {new Date(deadlineNum * 1000).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4">
              <span className="text-xs text-muted-foreground/60">{t("detail.winners")}</span>
              <p className="font-bold text-lg mt-1">{bounty.winnersSelected} / {bounty.maxWinners}</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4">
              <span className="text-xs text-muted-foreground/60">{t("detail.status")}</span>
              <p className="font-semibold text-sm mt-1">{t(status.labelKey)}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div className="flex items-center gap-2">
              <UserAvatar pubkey={bounty.creator.toBase58()} size={24} />
              <div>
                <span className="text-muted-foreground/60 text-xs">{t("detail.creator")}</span>
                <Link href={`/profile/${bounty.creator.toBase58()}`} className="block font-mono text-xs hover:text-brand transition-colors">
                  {shortPk(bounty.creator.toBase58())}
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <UserAvatar pubkey={bounty.moderator.toBase58()} size={24} />
              <div>
                <span className="text-muted-foreground/60 text-xs">{t("detail.moderator")}</span>
                <Link href={`/profile/${bounty.moderator.toBase58()}`} className="block font-mono text-xs hover:text-brand transition-colors">
                  {shortPk(bounty.moderator.toBase58())}
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-sm font-semibold mb-4">{t("detail.timeline")}</h3>
            <div className="relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-brand/30 rounded-full" />
              <div className="space-y-5">
                <TimelineItem label={t("detail.timelineCreated")} time={new Date(Number(bounty.createdAt) * 1000).toLocaleString()} active />
                {bounty.status >= BountyStatus.Submitted && (
                  <TimelineItem label={t("detail.timelineSubmitted")} time="See transaction" active />
                )}
                {bounty.status >= BountyStatus.WinnerSelected && (
                  <TimelineItem label={t("detail.timelineWinner")} time={t("detail.timelineWinnerCount", { selected: bounty.winnersSelected, max: bounty.maxWinners })} active />
                )}
                {bounty.status >= BountyStatus.Completed && (
                  <TimelineItem label={t("detail.timelineCompleted")} time={t("detail.timelineCompletedDesc")} active={bounty.status === BountyStatus.Completed} />
                )}
                {bounty.status === BountyStatus.Disputed && (
                  <TimelineItem label={t("detail.timelineDisputed")} time={t("detail.timelineDisputedDesc")} active warning />
                )}
                {bounty.status === BountyStatus.Expired && (
                  <TimelineItem label={t("detail.timelineExpired")} time={t("detail.timelineExpiredDesc")} active />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <h2 className="text-lg font-semibold mb-4">{t("detail.actions")}</h2>

        {bounty.status === BountyStatus.Open && (
          <div className="space-y-4">
            {isCreator || isModerator ? (
              <p className="text-sm text-muted-foreground">{t("detail.cannotSubmit")}</p>
            ) : (
              <>
                <SubmissionUriField
                  value={uri}
                  onChange={setUri}
                  hint={hasSubmitted ? t("detail.updateSubmissionHint") || "Update your submission URI" : undefined}
                />
                <button
                  onClick={() => exec("submit")}
                  disabled={sending !== null || (uri.length > 0 && !isValidSubmissionUri(uri))}
                  className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sending === "submit" ? p : hasSubmitted ? "Update Submission" : t("detail.submitWork")}
                </button>
              </>
            )}
          </div>
        )}

        {(bounty.status === BountyStatus.Submitted || (bounty.status === BountyStatus.WinnerSelected && canSubmitMore)) && (
          <div className="space-y-4">
            {isModerator && (
              <div className="space-y-4 pt-4 border-t border-border">
                <p className="text-sm font-medium text-foreground">{t("detail.moderatorActions")}</p>
                <div className="space-y-3">
                  {subsLoading ? (
                    <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
                  ) : submissions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("detail.noSubmissions")}</p>
                  ) : (
                    submissions.map((sub) => (
                      <div
                        key={sub.publicKey.toBase58()}
                        className={`rounded-lg border p-4 text-sm space-y-1 ${
                          sub.selected
                            ? "border-green-300 bg-green-50"
                            : "border-border bg-surface"
                        }`}
                      >
                        <p className="font-mono text-xs break-all">
                          {shortPk(sub.worker.toBase58())}
                        </p>
                        <p className="text-xs break-all text-blue-600">{sub.uri}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(Number(sub.submittedAt) * 1000).toLocaleString()}
                        </p>
                        {sub.selected ? (
                          <span className="text-xs text-green-600 font-medium">
                            {t("detail.winnerBadge")}
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-2 mt-2">
                            <button
                              onClick={() => exec("select-winner", sub.worker)}
                              disabled={sending !== null}
                              className="rounded bg-brand px-3 py-1 text-xs font-medium text-white hover:bg-brand-dark disabled:opacity-50 transition-colors"
                            >
                              {sending === "select-winner" ? p : t("detail.selectWinner")}
                            </button>
                            {!sub.rejected && (
                              <button
                                onClick={() => exec("reject", sub.worker)}
                                disabled={sending !== null}
                                className="rounded bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
                              >
                                {sending === "reject" ? p : t("detail.rejectSubmission")}
                              </button>
                            )}
                          </div>
                        )}
                        {sub.rejected && (
                          <span className="text-xs text-muted-foreground font-medium">
                            {t("detail.rejectedBadge")}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            {isCreator || isModerator ? (
              <p className="text-sm text-muted-foreground">{t("detail.cannotSubmit")}</p>
            ) : (
              <div className="space-y-4">
                <SubmissionUriField
                  value={uri}
                  onChange={setUri}
                  hint={hasSubmitted ? t("detail.updateSubmissionHint") || "Update your submission URI" : undefined}
                />
                <button
                  onClick={() => exec("submit")}
                  disabled={sending !== null || (uri.length > 0 && !isValidSubmissionUri(uri))}
                  className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sending === "submit" ? p : hasSubmitted ? "Update Submission" : t("detail.submitWork")}
                </button>
              </div>
            )}
            <div className="pt-4 border-t border-border">
              <button
                onClick={() => exec("dispute")}
                disabled={sending !== null}
                className="rounded-lg border border-red-300 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending === "dispute" ? p : t("detail.raiseDispute")}
              </button>
            </div>
          </div>
        )}

        {bounty.status === BountyStatus.Disputed && isModerator && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-foreground">{t("detail.moderatorResolve")}</p>
            <div className="space-y-3">
              {subsLoading ? (
                <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
              ) : submissions.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("detail.noSubmissions")}</p>
              ) : (
                submissions.map((sub) => (
                  <div
                    key={sub.publicKey.toBase58()}
                    className="rounded-lg border border-border bg-surface p-4 text-sm space-y-1"
                  >
                    <p className="font-mono text-xs break-all">
                      {shortPk(sub.worker.toBase58())}
                    </p>
                    <p className="text-xs break-all text-blue-600">{sub.uri}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(Number(sub.submittedAt) * 1000).toLocaleString()}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <button
                        onClick={() => exec("resolve-worker", sub.worker)}
                        disabled={sending !== null}
                        className="rounded bg-brand px-3 py-1 text-xs font-medium text-white hover:bg-brand-dark disabled:opacity-50 transition-colors"
                      >
                        {sending === "resolve-worker" ? p : t("detail.resolvePay")}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="pt-3">
              <button
                onClick={() => exec("resolve-creator")}
                disabled={sending !== null}
                className="rounded-lg bg-red-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending === "resolve-creator" ? p : t("detail.resolveRefund")}
              </button>
            </div>
          </div>
        )}

        {(bounty.status === BountyStatus.Open || bounty.status === BountyStatus.WinnerSelected) && isExpired && (
          <div>
            <button
              onClick={() => exec("refund")}
              disabled={sending !== null}
              className="rounded-lg bg-muted text-foreground px-5 py-2.5 text-sm font-medium hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending === "refund" ? p : t("detail.refundExpired")}
            </button>
          </div>
        )}
        {(bounty.status === BountyStatus.Completed || bounty.status === BountyStatus.Expired) && (
          <div>
            <button
              onClick={() => exec("close")}
              disabled={sending !== null}
              className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending === "close" ? p : t("detail.closeBounty")}
            </button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <h2 className="text-lg font-semibold mb-4">{t("detail.submissions")} ({submissions.length})</h2>
        {subsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-muted/30 p-4 animate-pulse space-y-2">
                <div className="h-3 bg-muted rounded w-32" />
                <div className="h-3 bg-muted rounded w-64" />
              </div>
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <p className="text-sm text-muted-foreground/60 text-center py-8">{t("detail.noSubmissions")}</p>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub) => (
              <div
                key={sub.publicKey.toBase58()}
                className={`rounded-xl border p-4 transition-all ${
                  sub.selected
                    ? "border-brand/30 bg-brand/5"
                    : sub.rejected
                    ? "border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10"
                    : "border-border bg-muted/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Link href={`/profile/${sub.worker.toBase58()}`}>
                      <UserAvatar pubkey={sub.worker.toBase58()} size={32} />
                    </Link>
                    <div className="min-w-0">
                      <Link
                        href={`/profile/${sub.worker.toBase58()}`}
                        className="text-sm font-medium hover:text-brand transition-colors"
                      >
                        {shortPk(sub.worker.toBase58())}
                      </Link>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">
                        {new Date(Number(sub.submittedAt) * 1000).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {sub.selected && (
                      <span className="text-xs font-medium text-brand bg-brand/10 px-2.5 py-0.5 rounded-full">
                        {t("detail.winnerBadge")}
                      </span>
                    )}
                    {sub.rejected && (
                      <span className="text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/20 px-2.5 py-0.5 rounded-full">
                        {t("detail.rejectedBadge")}
                      </span>
                    )}
                  </div>
                </div>
                {sub.uri && isValidUri(sub.uri) ? (
                  <a
                    href={sub.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block text-xs text-blue-500 hover:text-blue-600 truncate"
                  >
                    {sub.uri}
                  </a>
                ) : sub.uri ? (
                  <span className="mt-2 block text-xs text-muted-foreground truncate">
                    {sub.uri}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function TimelineItem({
  label,
  time,
  active,
  warning,
}: {
  label: string;
  time: string;
  active: boolean;
  warning?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`mt-1.5 w-[22px] h-[22px] rounded-full shrink-0 flex items-center justify-center ring-4 ring-background ${
          warning
            ? "bg-red-500"
            : active
            ? "bg-brand"
            : "bg-white/20"
        }`}
      >
        {active && !warning && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {warning && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01" />
          </svg>
        )}
      </div>
      <div className="pt-1">
        <p className={`text-sm ${active ? "font-medium text-foreground" : "text-muted-foreground"}`}>{label}</p>
        <p className="text-xs text-muted-foreground/60 mt-0.5">{time}</p>
      </div>
    </div>
  );
}
