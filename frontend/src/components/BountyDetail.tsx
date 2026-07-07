"use client";

import { useState, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL, SendTransactionError } from "@solana/web3.js";
import toast from "react-hot-toast";
import { useProgram } from "@/hooks/useProgram";
import { BountyData } from "@/hooks/useBounties";
import { BountyStatus, SOL_MINT, vaultAddress, submissionAddress } from "@/lib/constants";
import { useSubmissions } from "@/hooks/useSubmissions";
import CountdownTimer from "./CountdownTimer";
import { useThumbnailUrl } from "@/hooks/useThumbnail";
import { useTranslation } from "@/lib/i18n";

const statusLabels: Record<number, { labelKey: string; color: string }> = {
  [BountyStatus.Open]: { labelKey: "status.open", color: "bg-brand/10 text-brand" },
  [BountyStatus.Submitted]: { labelKey: "status.submitted", color: "bg-amber-100 text-amber-700" },
  [BountyStatus.WinnerSelected]: { labelKey: "status.winnerSelected", color: "bg-blue-100 text-blue-700" },
  [BountyStatus.Completed]: { labelKey: "status.completed", color: "bg-zinc-100 text-zinc-500" },
  [BountyStatus.Disputed]: { labelKey: "status.disputed", color: "bg-red-100 text-red-700" },
  [BountyStatus.Expired]: { labelKey: "status.expired", color: "bg-zinc-100 text-zinc-400" },
};

function shortPk(pk: string) {
  return `${pk.slice(0, 4)}...${pk.slice(-4)}`;
}

export default function BountyDetail({
  bounty,
  onRefresh,
}: {
  bounty: BountyData;
  onRefresh?: () => void;
}) {
  const { t } = useTranslation();
  const program = useProgram();
  const wallet = useWallet();
  const { connection } = useConnection();
  const [uri, setUri] = useState("");
  const [sending, setSending] = useState<string | null>(null);
  const { submissions, loading: subsLoading } = useSubmissions(bounty.publicKey);
  const thumbUrl = useThumbnailUrl(bounty.thumbnailUri);

  const status = statusLabels[bounty.status] || statusLabels[BountyStatus.Open];
  const deadlineNum = Number(bounty.deadline);
  const now = Math.floor(Date.now() / 1000);
  const isExpired = deadlineNum < now;
  const rewardPerWinner = Number(bounty.amount) / Math.max(bounty.maxWinners, 1);

  const exec = useCallback(
    async (action: string, worker?: PublicKey) => {
      if (!program || !wallet.publicKey) return;
      setSending(action);
      try {
        let tx: string;

        switch (action) {
          case "submit": {
            if (!uri.trim()) {
              toast.error("Submission URI is required");
              return;
            }
            const [subPda] = submissionAddress(bounty.publicKey, wallet.publicKey);
            tx = await program.methods
              .submitCompletion(bounty.bountyId, uri.trim())
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
            const [submissionPda] = submissionAddress(bounty.publicKey, worker);
            const [vaultPda] = vaultAddress(bounty.publicKey);
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
            tx = await program.methods
              .rejectSubmission(bounty.bountyId)
              .accounts({ moderator: wallet.publicKey, bounty: bounty.publicKey })
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
            const [vaultPda] = vaultAddress(bounty.publicKey);
            tx = await program.methods
              .resolveDispute(bounty.bountyId, true)
              .accounts({
                moderator: wallet.publicKey,
                bounty: bounty.publicKey,
                vault: vaultPda,
                recipient: worker || PublicKey.default,
                creator: bounty.creator,
                tokenMint: SOL_MINT,
                tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
                systemProgram: SystemProgram.programId,
              })
              .rpc();
            break;
          }
          case "resolve-creator": {
            const [vaultPda] = vaultAddress(bounty.publicKey);
            tx = await program.methods
              .resolveDispute(bounty.bountyId, false)
              .accounts({
                moderator: wallet.publicKey,
                bounty: bounty.publicKey,
                vault: vaultPda,
                recipient: worker || PublicKey.default,
                creator: bounty.creator,
                tokenMint: SOL_MINT,
                tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
                systemProgram: SystemProgram.programId,
              })
              .rpc();
            break;
          }
          case "refund": {
            const [vaultPda] = vaultAddress(bounty.publicKey);
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
          default:
            return;
        }

        await connection.confirmTransaction(tx, "confirmed");
        toast.success(`${action} successful`);
        onRefresh?.();
      } catch (err: any) {
        if (err instanceof SendTransactionError) {
          const logs = err.logs || [];
          console.error("Transaction simulation logs:", logs);
          toast.error(logs.length > 0 ? logs.join("\n") : err.message);
        } else {
          toast.error(err.message || `Failed to ${action}`);
        }
      } finally {
        setSending(null);
      }
    },
    [program, wallet, connection, bounty, uri, onRefresh]
  );

  const isModerator = wallet.publicKey?.toBase58() === bounty.moderator.toBase58();
  const isCreator = wallet.publicKey?.toBase58() === bounty.creator.toBase58();
  const canSubmitMore = bounty.winnersSelected < bounty.maxWinners;
  const p = t("detail.processing");

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-white p-6 border-l-4 border-l-brand">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold">{bounty.title || t("detail.untitled")}</h1>
            <p className="mt-1 text-sm text-zinc-500 break-all font-mono">
              {bounty.publicKey.toBase58()}
            </p>
          </div>
          <span className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${status.color}`}>
            {t(status.labelKey)}
          </span>
        </div>

        {bounty.description && (
          <p className="mt-4 text-sm text-zinc-700 leading-relaxed">{bounty.description}</p>
        )}

        {thumbUrl && (
          <div className="mt-4">
            <img
              src={thumbUrl}
              alt={bounty.title || "Thumbnail"}
              className="w-full max-w-[200px] rounded-lg object-cover border border-border"
            />
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-zinc-400 text-xs">{t("detail.rewardPool")}</span>
            <p className="font-semibold text-lg text-brand">
              {(Number(bounty.amount) / LAMPORTS_PER_SOL).toFixed(3)} SOL
            </p>
            {bounty.maxWinners > 1 && (
              <p className="text-xs text-zinc-400 mt-0.5">
                {(rewardPerWinner / LAMPORTS_PER_SOL).toFixed(3)} SOL {t("detail.perWinner")}
              </p>
            )}
          </div>
          <div>
            <span className="text-zinc-400 text-xs">{t("detail.deadline")}</span>
            <p className="font-semibold">
              {isExpired ? (
                <span className="text-red-500">{t("status.expired")}</span>
              ) : (
                <CountdownTimer target={deadlineNum} />
              )}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              {new Date(deadlineNum * 1000).toLocaleDateString()}
            </p>
          </div>
          <div>
            <span className="text-zinc-400 text-xs">{t("detail.winners")}</span>
            <p className="font-semibold">{bounty.winnersSelected} / {bounty.maxWinners}</p>
          </div>
          <div>
            <span className="text-zinc-400 text-xs">{t("detail.creator")}</span>
            <p className="font-mono text-xs mt-0.5">{shortPk(bounty.creator.toBase58())}</p>
          </div>
          <div>
            <span className="text-zinc-400 text-xs">{t("detail.moderator")}</span>
            <p className="font-mono text-xs mt-0.5">{shortPk(bounty.moderator.toBase58())}</p>
          </div>
          <div>
            <span className="text-zinc-400 text-xs">{t("detail.status")}</span>
            <p className="font-semibold text-xs mt-0.5">{t(status.labelKey)}</p>
          </div>
        </div>

        {bounty.referenceUri && (
          <div className="mt-3 pt-3 border-t border-border">
            <span className="text-xs text-zinc-400">{t("detail.reference")}:</span>
            <p className="mt-1 font-mono text-xs break-all text-blue-600">{bounty.referenceUri}</p>
          </div>
        )}

        {bounty.submissionUri && (
          <div className="mt-3 pt-3 border-t border-border">
            <span className="text-xs text-zinc-400">{t("detail.latestSubmission")}:</span>
            <p className="mt-1 font-mono text-xs break-all text-blue-600">{bounty.submissionUri}</p>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-border">
          <h3 className="text-sm font-semibold mb-3">{t("detail.timeline")}</h3>
          <div className="space-y-3">
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

      <div className="rounded-xl border border-border bg-white p-6">
        <h2 className="text-lg font-semibold mb-4">{t("detail.actions")}</h2>

        {bounty.status === BountyStatus.Open && (
          <div className="space-y-4">
            {isCreator || isModerator ? (
              <p className="text-sm text-zinc-400">{t("detail.cannotSubmit")}</p>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("detail.submissionUri")}</label>
                  <input
                    type="text"
                    value={uri}
                    onChange={(e) => setUri(e.target.value)}
                    placeholder="ipfs://..."
                    className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                  />
                </div>
                <button
                  onClick={() => exec("submit")}
                  disabled={sending !== null}
                  className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sending === "submit" ? p : t("detail.submitWork")}
                </button>
              </>
            )}
          </div>
        )}

        {(bounty.status === BountyStatus.Submitted || (bounty.status === BountyStatus.WinnerSelected && canSubmitMore)) && (
          <div className="space-y-4">
            {isModerator && (
              <div className="space-y-4 pt-4 border-t border-border">
                <p className="text-sm font-medium text-zinc-700">{t("detail.moderatorActions")}</p>
                <div className="space-y-3">
                  {subsLoading ? (
                    <p className="text-sm text-zinc-400">{t("common.loading")}</p>
                  ) : submissions.length === 0 ? (
                    <p className="text-sm text-zinc-400">{t("detail.noSubmissions")}</p>
                  ) : (
                    submissions.map((sub) => (
                      <div
                        key={sub.publicKey.toBase58()}
                        className={`rounded-lg border p-4 text-sm space-y-1 ${
                          sub.selected
                            ? "border-green-300 bg-green-50"
                            : "border-border bg-white"
                        }`}
                      >
                        <p className="font-mono text-xs break-all">
                          {shortPk(sub.worker.toBase58())}
                        </p>
                        <p className="text-xs break-all text-blue-600">{sub.uri}</p>
                        <p className="text-xs text-zinc-400">
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
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div className="pt-3">
                  <button
                    onClick={() => exec("reject")}
                    disabled={sending !== null}
                    className="rounded-lg bg-red-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {sending === "reject" ? p : t("detail.rejectSubmission")}
                  </button>
                </div>
              </div>
            )}
            {isCreator || isModerator ? (
              <p className="text-sm text-zinc-400">{t("detail.cannotSubmit")}</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t("detail.submissionUri")}</label>
                  <input
                    type="text"
                    value={uri}
                    onChange={(e) => setUri(e.target.value)}
                    placeholder="ipfs://..."
                    className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                  />
                </div>
                <button
                  onClick={() => exec("submit")}
                  disabled={sending !== null}
                  className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sending === "submit" ? p : t("detail.submitWork")}
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
            <p className="text-sm font-medium text-zinc-700">{t("detail.moderatorResolve")}</p>
            <div className="space-y-3">
              {subsLoading ? (
                <p className="text-sm text-zinc-400">{t("common.loading")}</p>
              ) : submissions.length === 0 ? (
                <p className="text-sm text-zinc-400">{t("detail.noSubmissions")}</p>
              ) : (
                submissions.map((sub) => (
                  <div
                    key={sub.publicKey.toBase58()}
                    className="rounded-lg border border-border bg-white p-4 text-sm space-y-1"
                  >
                    <p className="font-mono text-xs break-all">
                      {shortPk(sub.worker.toBase58())}
                    </p>
                    <p className="text-xs break-all text-blue-600">{sub.uri}</p>
                    <p className="text-xs text-zinc-400">
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

        {bounty.status === BountyStatus.Open && isExpired && (
          <div>
            <button
              onClick={() => exec("refund")}
              disabled={sending !== null}
              className="rounded-lg bg-zinc-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending === "refund" ? p : t("detail.refundExpired")}
            </button>
          </div>
        )}
      </div>
    </div>
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
        className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${
          warning ? "bg-red-400" : active ? "bg-brand" : "bg-zinc-200"
        }`}
      />
      <div>
        <p className={`text-sm ${active ? "font-medium" : "text-zinc-400"}`}>{label}</p>
        <p className="text-xs text-zinc-400">{time}</p>
      </div>
    </div>
  );
}
