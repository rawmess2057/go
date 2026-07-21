"use client";

import AmountInput from "./fields/AmountInput";
import TokenSelector from "./fields/TokenSelector";
import UsdDisplay from "./fields/UsdDisplay";
import MaxWinnersField from "./fields/MaxWinnersField";
import DeadlineField from "./fields/DeadlineField";
import ModeratorField from "./fields/ModeratorField";
import { useGigCreateStore } from "@/stores/useGigCreateStore";

const SUGGESTED_RATES: Record<string, string> = {
  writing: "0.1 – 2 SOL per task",
  design: "0.5 – 5 SOL per task",
  video: "1 – 10 SOL per task",
  development: "1 – 15 SOL per task",
  marketing: "0.5 – 5 SOL per task",
  research: "0.2 – 3 SOL per task",
  translation: "0.1 – 2 SOL per task",
  general: "0.1 – 5 SOL per task",
};

export default function StepPayment() {
  const selectedTags = useGigCreateStore((s) => s.selectedTags);

  const rates = selectedTags
    .map((tag) => SUGGESTED_RATES[tag])
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-surface p-5 space-y-5">
        {rates && (
          <div className="rounded-lg bg-brand/5 border border-brand/20 p-3 text-sm">
            <p className="font-medium text-foreground text-xs mb-1">Suggested Rates</p>
            <p className="text-muted-foreground text-xs">{rates}</p>
          </div>
        )}

        <div className="rounded-lg bg-muted/30 border border-border p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Secure Escrow</p>
          <p>
            Funds are locked in a non-custodial escrow smart contract. Rewards are released by the moderator upon approval.
          </p>
        </div>

        <div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <AmountInput />
              <UsdDisplay />
            </div>
            <TokenSelector />
          </div>
        </div>

        <MaxWinnersField />
        <DeadlineField />
        <ModeratorField />
      </div>
    </div>
  );
}
