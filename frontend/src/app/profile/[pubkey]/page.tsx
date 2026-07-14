"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useBounties, BountyData } from "@/hooks/useBounties";
import { PublicKey } from "@solana/web3.js";
import UserAvatar from "@/components/UserAvatar";
import BountyCard from "@/components/BountyCard";
import { useTranslation } from "@/lib/i18n";
import PageTransition from "@/components/PageTransition";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const pubkey = params.pubkey as string;
  const { bounties, loading } = useBounties();

  let validPk: PublicKey | null = null;
  try { validPk = new PublicKey(pubkey); } catch { validPk = null; }

  const created = useMemo(
    () => bounties.filter((b) => b.creator.toBase58() === pubkey),
    [bounties, pubkey]
  );

  const totalSpent = useMemo(
    () => created.reduce((s, b) => s + Number(b.amount), 0) / 1e9,
    [created]
  );

  if (!validPk) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Invalid public key</p>
        <button onClick={() => router.push("/")} className="mt-4 text-sm text-brand hover:underline">
          {t("gigPage.backHome")}
        </button>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-2xl border border-border bg-surface overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-brand/[0.02]" />
          <div className="relative p-6 sm:p-8 flex items-center gap-5">
            <UserAvatar pubkey={pubkey} size={64} className="ring-2 ring-border" />
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-foreground truncate font-mono">{pubkey}</h1>
              <p className="text-sm text-muted-foreground/60 mt-1">
                {t("profile.created")}: {created.length} bounties
              </p>
            </div>
            <div className="ml-auto text-right shrink-0 tabular-nums">
              <p className="text-2xl font-bold text-brand">{totalSpent.toFixed(2)} SOL</p>
              <p className="text-xs text-muted-foreground/60">{t("profile.totalSpent")}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-surface p-5 animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : created.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {t("profile.noBounties")}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {created.map((b, i) => (
              <BountyCard key={b.publicKey.toBase58()} bounty={b} index={i} />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
