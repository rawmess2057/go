"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import BountyList from "@/components/BountyList";
import TrendingBounties from "@/components/TrendingBounties";
import PageTransition from "@/components/PageTransition";
import { useBounties } from "@/hooks/useBounties";

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  const { bounties } = useBounties();

  useEffect(() => {
    if (typeof window !== "undefined" && !        localStorage.getItem("gig_onboarded")) {
      localStorage.setItem("gig_onboarded", "true");
      router.push("/onboarding");
    }
  }, [router]);

  return (
    <PageTransition>
    <div>
      <div className="relative -mx-4 -mt-8 px-4 pt-16 sm:pt-24 pb-20 sm:pb-28 bg-brand text-white text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm text-white font-medium mb-6 backdrop-blur-sm">
            {t("home.badge")}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight max-w-2xl mx-auto leading-tight">
            {t("home.hero.title")}
            <br />
            <span className="text-white/90">{t("home.hero.subtitle")}</span>
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-lg mx-auto">
            {t("home.hero.description")}
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <a
              href="/create"
              className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand hover:bg-white/90 transition-colors"
            >
              {t("home.createCta")}
            </a>
            <a
              href="#gigs"
              className="inline-flex items-center rounded-lg border border-white/30 px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors"
            >
              {t("home.browseCta")}
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 -mt-10 mb-8 relative z-10">
        {(t("home.trust") as unknown as any[]).map((item: any, i: number) => (
          <div
            key={i}
            className="rounded-2xl bg-card border border-border backdrop-blur-xl shadow-sm p-5 text-center"
          >
            <p className="font-semibold text-sm text-brand">{item.title}</p>
            <p className="text-xs text-brand/70 mt-1 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {bounties.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-foreground/60 uppercase tracking-wider mb-3">
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
