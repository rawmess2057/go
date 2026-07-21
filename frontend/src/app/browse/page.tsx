"use client";

import { useTranslation } from "@/lib/i18n";
import BountyList from "@/components/BountyList";
import PageTransition from "@/components/PageTransition";

export default function BrowsePage() {
  const { t } = useTranslation();

  return (
    <PageTransition>
      <div>
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {t("browse.title")}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {t("browse.description")}
          </p>
        </div>
        <BountyList />
      </div>
    </PageTransition>
  );
}
