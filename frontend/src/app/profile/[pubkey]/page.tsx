"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useBounties, BountyData } from "@/hooks/useBounties";
import { useSubmissions } from "@/hooks/useSubmissions";
import { useWonSubmissions } from "@/hooks/useWonSubmissions";
import { useProfile } from "@/hooks/useProfile";
import { computeCompletionRate } from "@/lib/profile";
import { PublicKey } from "@solana/web3.js";
import UserAvatar from "@/components/UserAvatar";
import BountyCard from "@/components/BountyCard";
import { useTranslation } from "@/lib/i18n";
import PageTransition from "@/components/PageTransition";
import { BountyStatus } from "@/lib/constants";
import { PencilSimple, Check, X, Globe, TwitterLogo, GithubLogo, ArrowRight } from "@phosphor-icons/react";
import Link from "next/link";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const wallet = useWallet();
  const pubkey = params.pubkey as string;
  const { bounties, loading } = useBounties();
  const { profile, update } = useProfile(pubkey);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ displayName: "", bio: "", skills: "", twitter: "", github: "", website: "" });

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

  const activeCount = useMemo(
    () => created.filter((b) => b.status < BountyStatus.Completed).length,
    [created]
  );

  const completedCount = useMemo(
    () => created.filter((b) => b.status === BountyStatus.Completed).length,
    [created]
  );

  const completionRate = useMemo(
    () => computeCompletionRate(completedCount, created.length),
    [created.length, completedCount]
  );

  const completedBounties = useMemo(
    () => bounties.filter((b) => b.status === BountyStatus.Completed),
    [bounties]
  );

  const portfolio = useMemo(() => {
    if (!validPk) return [];
    const pkStr = pubkey;
    return completedBounties.filter(
      (b) => b.creator.toBase58() === pkStr || b.moderator.toBase58() === pkStr
    ).slice(0, 6);
  }, [completedBounties, validPk, pubkey]);

  const isOwn = wallet.publicKey?.toBase58() === pubkey;

  const startEditing = () => {
    setEditForm({
      displayName: profile.displayName,
      bio: profile.bio,
      skills: profile.skills.join(", "),
      twitter: profile.twitter,
      github: profile.github,
      website: profile.website,
    });
    setEditing(true);
  };

  const saveEdit = () => {
    update({
      displayName: editForm.displayName,
      bio: editForm.bio,
      skills: editForm.skills.split(",").map((s) => s.trim()).filter(Boolean),
      twitter: editForm.twitter,
      github: editForm.github,
      website: editForm.website,
    });
    setEditing(false);
  };

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

  const displayName = profile.displayName || `${pubkey.slice(0, 6)}...${pubkey.slice(-4)}`;

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-2xl border border-border bg-surface overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-brand/[0.02]" />
          <div className="relative p-6 sm:p-8">
            <div className="flex items-start gap-5">
              <UserAvatar pubkey={pubkey} size={72} className="ring-2 ring-border shrink-0" />
              <div className="min-w-0 flex-1">
                {editing ? (
                  <div className="space-y-3 max-w-md">
                    <input
                      value={editForm.displayName}
                      onChange={(e) => setEditForm((f) => ({ ...f, displayName: e.target.value }))}
                      placeholder="Display name"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50"
                    />
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
                      placeholder="Short bio"
                      rows={2}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none"
                    />
                    <input
                      value={editForm.skills}
                      onChange={(e) => setEditForm((f) => ({ ...f, skills: e.target.value }))}
                      placeholder="Skills (comma separated)"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        value={editForm.twitter}
                        onChange={(e) => setEditForm((f) => ({ ...f, twitter: e.target.value }))}
                        placeholder="Twitter handle"
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50"
                      />
                      <input
                        value={editForm.github}
                        onChange={(e) => setEditForm((f) => ({ ...f, github: e.target.value }))}
                        placeholder="GitHub username"
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50"
                      />
                      <input
                        value={editForm.website}
                        onChange={(e) => setEditForm((f) => ({ ...f, website: e.target.value }))}
                        placeholder="Website URL"
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-dark transition-colors"
                      >
                        <Check size={14} /> Save
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-bold text-foreground truncate">{displayName}</h1>
                      {isOwn && (
                        <button
                          onClick={startEditing}
                          className="shrink-0 w-7 h-7 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-all"
                          title="Edit profile"
                        >
                          <PencilSimple size={14} />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground/60 font-mono mt-0.5">{pubkey}</p>
                    {profile.bio && (
                      <p className="text-sm text-muted-foreground mt-2 max-w-lg leading-relaxed">{profile.bio}</p>
                    )}
                    {profile.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {profile.skills.map((skill) => (
                          <span
                            key={skill}
                            className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/20"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                    {(profile.twitter || profile.github || profile.website) && (
                      <div className="flex items-center gap-3 mt-2">
                        {profile.twitter && (
                          <a
                            href={`https://twitter.com/${profile.twitter}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-brand transition-colors"
                          >
                            <TwitterLogo size={14} /> @{profile.twitter}
                          </a>
                        )}
                        {profile.github && (
                          <a
                            href={`https://github.com/${profile.github}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-brand transition-colors"
                          >
                            <GithubLogo size={14} /> {profile.github}
                          </a>
                        )}
                        {profile.website && (
                          <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-brand transition-colors"
                          >
                            <Globe size={14} /> Website
                          </a>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-border pt-4">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground tabular-nums">{created.length}</p>
                <p className="text-[10px] text-muted-foreground/60">Created</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-brand tabular-nums">{totalSpent.toFixed(2)} SOL</p>
                <p className="text-[10px] text-muted-foreground/60">Spent</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground tabular-nums">{activeCount}</p>
                <p className="text-[10px] text-muted-foreground/60">Active</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground tabular-nums">{completionRate}%</p>
                <p className="text-[10px] text-muted-foreground/60">Completion</p>
              </div>
            </div>
          </div>
        </div>

        {portfolio.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Portfolio</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {portfolio.map((b) => (
                <Link
                  key={b.publicKey.toBase58()}
                  href={`/gig/${b.publicKey.toBase58()}`}
                  className="rounded-xl border border-border bg-surface p-4 hover:border-brand/40 transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-brand transition-colors">
                        {b.title || "Untitled"}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(Number(b.amount) / 1e9).toFixed(2)} SOL
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>Completed</span>
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Gigs Created</h2>
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
      </div>
    </PageTransition>
  );
}
