"use client";

import { useGigCreateStore } from "@/stores/useGigCreateStore";

export default function MaxWinnersField() {
  const maxWinners = useGigCreateStore((s) => s.maxWinners);
  const amount = useGigCreateStore((s) => s.amount);
  const setField = useGigCreateStore((s) => s.setField);
  const errors = useGigCreateStore((s) => s.errors);
  const touched = useGigCreateStore((s) => s.touched);

  const numVal = parseInt(maxWinners) || 1;
  const perWinner =
    parseFloat(amount) && numVal > 0
      ? (parseFloat(amount) / numVal).toFixed(3)
      : null;
  const showError = touched.maxWinners && errors.maxWinners;

  return (
    <div>
      <label
        htmlFor="gig-winners"
        className="block text-sm font-medium mb-1.5 text-foreground"
      >
        Max Winners <span className="text-muted-foreground">*</span>
      </label>
      <div className="flex items-stretch rounded-xl border bg-muted/30 overflow-hidden focus-within:ring-2 focus-within:ring-brand/50 transition-all">
        <button
          type="button"
          onClick={() => setField("maxWinners", String(Math.max(1, numVal - 1)))}
          disabled={numVal <= 1}
          className="flex items-center justify-center min-w-[44px] bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted/70 disabled:text-muted-foreground/30 disabled:pointer-events-none transition-all text-lg leading-none"
          aria-label="Decrease winners"
        >
          −
        </button>
        <input
          id="gig-winners"
          type="text"
          inputMode="numeric"
          required
          value={maxWinners}
          onChange={(e) =>
            setField("maxWinners", e.target.value.replace(/[eE.+\-]/g, ""))
          }
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") { e.preventDefault(); setField("maxWinners", String(Math.min(10, numVal + 1))); }
            if (e.key === "ArrowDown") { e.preventDefault(); setField("maxWinners", String(Math.max(1, numVal - 1))); }
          }}
          onBlur={() => {
            const clamped = Math.min(10, Math.max(1, parseInt(maxWinners) || 1));
            setField("maxWinners", String(clamped));
          }}
          className="flex-1 bg-transparent px-3 py-3 text-base text-foreground text-center font-semibold focus:outline-none"
          aria-invalid={!!showError}
          aria-describedby="winners-error"
        />
        <button
          type="button"
          onClick={() => setField("maxWinners", String(Math.min(10, numVal + 1)))}
          disabled={numVal >= 10}
          className="flex items-center justify-center min-w-[44px] bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted/70 disabled:text-muted-foreground/30 disabled:pointer-events-none transition-all text-lg leading-none"
          aria-label="Increase winners"
        >
          +
        </button>
      </div>

      {perWinner && (
        <p className="mt-1 text-xs text-muted-foreground">
          ~{perWinner} SOL per winner
        </p>
      )}

      {showError && (
        <p id="winners-error" className="text-xs text-error mt-1" role="alert">
          {errors.maxWinners}
        </p>
      )}

      <p className="mt-1 text-xs text-muted-foreground">
        Reward pool is split equally among winners
      </p>
    </div>
  );
}
