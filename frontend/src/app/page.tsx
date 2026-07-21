"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { FileText, Eye, CheckCircle, ArrowRight } from "@phosphor-icons/react";
import BountyList from "@/components/BountyList";
import TrendingBounties from "@/components/TrendingBounties";
import PageTransition from "@/components/PageTransition";
import { useBounties, BountyData } from "@/hooks/useBounties";
import Link from "next/link";
import { useThumbnailUrl } from "@/hooks/useThumbnail";
import { isValidImageUri } from "@/lib/validate";
import { BountyStatus } from "@/lib/constants";

function HeroBountyCard({ bounty }: { bounty: BountyData }) {
  const thumbUrl = useThumbnailUrl(bounty.thumbnailUri);

  return (
    <div className="flex flex-col items-center text-center px-5 py-4">
      <div className="w-full h-28 rounded-xl overflow-hidden mb-3">
        {thumbUrl && isValidImageUri(thumbUrl) ? (
          <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand/20 via-brand/10 to-transparent" />
        )}
      </div>
      <h3 className="text-sm font-semibold text-foreground line-clamp-1 leading-snug">
        {bounty.title || "Untitled"}
      </h3>
      <p className="text-lg font-bold text-brand mt-1 tabular-nums">
        {(Number(bounty.amount) / 1e9).toFixed(2)} SOL
      </p>
      <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
        {`${bounty.creator.toBase58().slice(0, 4)}...${bounty.creator.toBase58().slice(-4)}`}
      </p>
    </div>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  const { bounties } = useBounties();
  const [cardIndex, setCardIndex] = useState(0);

  useEffect(() => {
    if (bounties.length === 0) return;
    setCardIndex((i) => (i >= bounties.length ? 0 : i));
    const interval = setInterval(() => {
      setCardIndex((i) => (i + 1) % bounties.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [bounties.length]);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("gig_onboarded")) {
      localStorage.setItem("gig_onboarded", "true");
      router.push("/onboarding");
    }
  }, [router]);

  const trustItems = (t("home.trust") as unknown as any[]) || [];

  const stats = useMemo(() => {
    const active = bounties.filter((b) => b.status === BountyStatus.Open);
    const totalSol = active.reduce((sum, b) => sum + Number(b.amount) / 1e9, 0);
    return { activeCount: active.length, totalSol };
  }, [bounties]);

  const current = bounties.length > 0 ? bounties[cardIndex] : null;

  const howItWorksSteps = (t("howItWorks.steps") as unknown as any[]) || [];
  const whyGigPoints = (t("whyGig.points") as unknown as any[]) || [];
  const completed = useMemo(() =>
    bounties
      .filter((b) => b.status === BountyStatus.Completed || b.status === BountyStatus.WinnerSelected)
      .reverse()
      .slice(0, 6),
    [bounties]
  );

  return (
    <PageTransition>
    <div>
      <div className="relative pt-16 sm:pt-20 pb-16 sm:pb-20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-12">
          <div className="flex-1 max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter leading-none text-balance">
              {t("home.hero.title")}
              <br />
              <span className="text-muted-foreground">{t("home.hero.subtitle")}</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-[65ch] leading-relaxed">
              {t("home.hero.description")}
            </p>
            <div className="mt-8 flex items-center gap-4">
              <a
                href="/create"
                className="inline-flex items-center rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark active:scale-[0.98] transition-all shadow-lg shadow-brand/20"
              >
                {t("home.createCta")}
              </a>
              <a
                href="/browse"
                className="inline-flex items-center rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-muted active:scale-[0.98] transition-all"
              >
                {t("home.browseCta")}
              </a>
            </div>
          </div>

          <div className="hidden lg:block shrink-0 w-80">
            <div className="relative rounded-2xl border border-border bg-surface overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-brand/15 via-brand/5 to-transparent"
                animate={{
                  borderRadius: ["40% 60% 60% 40%", "60% 40% 50% 50%", "40% 60% 60% 40%"],
                  scale: [1, 1.08, 1],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative z-10">
                {current ? (
                  <>
                    <div className="min-h-[220px] flex items-center justify-center">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={current.publicKey.toBase58()}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -16 }}
                          transition={{ duration: 0.3 }}
                          className="w-full"
                        >
                          <HeroBountyCard bounty={current} />
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 pb-3">
                      {bounties.slice(0, 7).map((b, i) => (
                        <div
                          key={b.publicKey.toBase58()}
                          className={`rounded-full transition-all ${
                            i === cardIndex
                              ? "bg-brand w-3 h-1.5"
                              : "bg-muted-foreground/25 w-1.5 h-1.5"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="min-h-[220px] flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
                  </div>
                )}
                <div className="border-t border-border grid grid-cols-2 divide-x divide-border">
                  <div className="p-3 text-center">
                    <p className="text-sm font-bold text-foreground tabular-nums">{stats.activeCount}</p>
                    <p className="text-[10px] text-muted-foreground">Active</p>
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-sm font-bold text-brand tabular-nums">{stats.totalSol.toFixed(1)}</p>
                    <p className="text-[10px] text-muted-foreground">SOL</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {trustItems.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            {trustItems.map((item: any, i: number) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-surface p-5 flex flex-col"
              >
                <p className="font-semibold text-sm text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-16">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-8 text-center">
          {t("howItWorks.title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {howItWorksSteps.map((step: any, i: number) => {
            const icons = [FileText, Eye, CheckCircle];
            const Icon = icons[i] || CheckCircle;
            return (
              <div key={i} className="relative rounded-2xl border border-border bg-surface p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center mx-auto mb-4">
                  <Icon size={22} className="text-brand" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-foreground mb-1.5">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {completed.length > 0 && (
        <div className="mb-16">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-6">
            {t("recentlyCompleted.title")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completed.map((b) => (
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
                  <span className="shrink-0 text-[10px] font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                    {t("status.completed")}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>{b.creator.toBase58().slice(0, 4)}...{b.creator.toBase58().slice(-4)}</span>
                  <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mb-16">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-8 text-center">
          {t("whyGig.title")}
        </h2>
        <div className="max-w-3xl mx-auto space-y-3">
          {whyGigPoints.map((point: any, i: number) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center rounded-xl border border-border bg-surface p-4"
            >
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{point.us}</p>
              </div>
              <div className="shrink-0 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider px-2">
                {t("whyGig.vs")}
              </div>
              <div className="text-left">
                <p className="text-sm text-muted-foreground">{point.them}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {bounties.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {t("home.trending")}
          </h2>
          <TrendingBounties bounties={bounties} />
        </div>
      )}

      <div id="gigs">
        <BountyList />
      </div>
    </div>
    </PageTransition>
  );
}
