"use client";

import AmountInput from "./fields/AmountInput";
import TokenSelector from "./fields/TokenSelector";
import UsdDisplay from "./fields/UsdDisplay";
import MaxWinnersField from "./fields/MaxWinnersField";
import DeadlineField from "./fields/DeadlineField";
import ModeratorField from "./fields/ModeratorField";

export default function StepPayment() {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card backdrop-blur-xl p-5 space-y-5">
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
