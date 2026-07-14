"use client";

import { useTranslation } from "@/lib/i18n";
import CreateBountyForm from "@/components/CreateBountyForm";
import PageTransition from "@/components/PageTransition";

export default function CreatePage() {
  const { t } = useTranslation();

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2 text-white">{t("create.title")}</h1>
        <p className="text-sm text-white/60 mb-8">
          {t("create.subtitle")}
        </p>
        <CreateBountyForm />
      </div>
    </PageTransition>
  );
}
