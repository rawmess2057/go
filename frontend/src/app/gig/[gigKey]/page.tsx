"use client";

import { useParams, useRouter } from "next/navigation";
import { useBountyByKey } from "@/hooks/useBounties";
import BountyDetail from "@/components/BountyDetail";
import PageTransition from "@/components/PageTransition";
import { useTranslation } from "@/lib/i18n";

export default function GigPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const gigKey = params.gigKey as string;
  const { bounty, loading, refetch } = useBountyByKey(gigKey);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!bounty) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">{t("gigPage.notFound")}</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 text-sm text-brand hover:underline"
        >
          {t("gigPage.backHome")}
        </button>
      </div>
    );
  }

  return (
    <PageTransition>
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => router.push("/")}
        className="text-sm text-muted-foreground hover:text-brand transition-colors mb-4 inline-flex items-center gap-1"
      >
        &larr; {t("gigPage.back")}
      </button>
      <BountyDetail bounty={bounty} onRefresh={refetch} />
    </div>
    </PageTransition>
  );
}
