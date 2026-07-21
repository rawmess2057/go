"use client";

import { useMemo } from "react";
import { useBounties } from "@/hooks/useBounties";
import PageTransition from "@/components/PageTransition";
import EmptyState from "@/components/EmptyState";
import Link from "next/link";
import { BountyStatus } from "@/lib/constants";
import { useTranslation } from "@/lib/i18n";
import { Clock, SealCheck, ArrowRight } from "@phosphor-icons/react";

export default function DisputesPage() {
  const { t } = useTranslation();
  const { bounties, loading } = useBounties();

  const disputes = useMemo(() => {
    return bounties
      .filter((b) => b.status === BountyStatus.Disputed)
      .sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
  }, [bounties]);

  const resolved = useMemo(() => {
    return bounties
      .filter((b) => b.status === BountyStatus.Completed)
      .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
      .slice(0, 10);
  }, [bounties]);

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Dispute Ledger
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Every dispute on Gig is recorded publicly on-chain. This is a transparent record of all disputes and their resolutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl border border-border bg-surface p-4 text-center">
            <p className="text-2xl font-bold text-amber-500 tabular-nums">{disputes.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Active Disputes</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4 text-center">
            <p className="text-2xl font-bold text-green-500 tabular-nums">{resolved.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Resolved</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4 text-center">
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {disputes.length + resolved.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total Cases</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">
              Active Disputes
              {disputes.length > 0 && (
                <span className="ml-2 text-xs text-muted-foreground font-normal">
                  ({disputes.length} case{disputes.length !== 1 ? "s" : ""})
                </span>
              )}
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : disputes.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No active disputes"
                description="All disputes are resolved. The platform is running smoothly."
                actionLabel="Browse Gigs"
                actionHref="/browse"
              />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {disputes.map((b) => (
                <Link
                  key={b.publicKey.toBase58()}
                  href={`/gig/${b.publicKey.toBase58()}`}
                  className="block px-5 py-4 hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                        <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-brand transition-colors">
                          {b.title || "Untitled Gig"}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span>
                          Creator: {b.creator.toBase58().slice(0, 4)}...{b.creator.toBase58().slice(-4)}
                        </span>
                        <span>
                          Moderator: {b.moderator.toBase58().slice(0, 4)}...{b.moderator.toBase58().slice(-4)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground/60">
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(Number(b.createdAt) * 1000).toLocaleDateString()}
                        </span>
                        <span>
                          {(Number(b.amount) / 1e9).toFixed(2)} SOL
                        </span>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-muted-foreground/30 group-hover:text-brand transition-colors shrink-0 mt-1" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {resolved.length > 0 && (
          <div className="mt-8 rounded-2xl border border-border bg-surface overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">
                Recently Resolved
              </h2>
            </div>
            <div className="divide-y divide-border">
              {resolved.slice(0, 5).map((b) => (
                <Link
                  key={b.publicKey.toBase58()}
                  href={`/gig/${b.publicKey.toBase58()}`}
                  className="block px-5 py-3 hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <SealCheck size={16} className="text-green-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground truncate group-hover:text-brand transition-colors">
                        {b.title || "Untitled Gig"}
                      </p>
                      <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                        Resolved by {b.moderator.toBase58().slice(0, 4)}...{b.moderator.toBase58().slice(-4)} &middot;{" "}
                        {(Number(b.amount) / 1e9).toFixed(2)} SOL
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 rounded-xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-foreground mb-2">How Disputes Work</h2>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">1.</strong> Client creates a gig and assigns a moderator at creation time.
            </p>
            <p>
              <strong className="text-foreground">2.</strong> Freelancer submits work before the deadline.
            </p>
            <p>
              <strong className="text-foreground">3.</strong> Client can approve (winner selected) or reject with a reason.
            </p>
            <p>
              <strong className="text-foreground">4.</strong> If rejected or dissatisfied, the client can raise a dispute.
            </p>
            <p>
              <strong className="text-foreground">5.</strong> The moderator reviews both sides — work submission, client criteria, and responses.
            </p>
            <p>
              <strong className="text-foreground">6.</strong> Moderator decides: pay the worker or refund the client. Decision is final and on-chain.
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
