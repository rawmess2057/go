"use client";

import { useGigCreateStore } from "@/stores/useGigCreateStore";

const PRESETS = [0.5, 1, 2, 5, 10];
const STEP = 0.1;

export default function AmountInput() {
  const amount = useGigCreateStore((s) => s.amount);
  const setField = useGigCreateStore((s) => s.setField);
  const setTouched = useGigCreateStore((s) => s.setTouched);
  const errors = useGigCreateStore((s) => s.errors);
  const touched = useGigCreateStore((s) => s.touched);

  const numVal = parseFloat(amount) || 0;
  const showError = touched.amount && errors.amount;

  const adjust = (delta: number) => {
    const next = Math.max(0, +(numVal + delta).toFixed(3));
    setField("amount", String(next));
  };

  return (
    <div>
      <label
        htmlFor="gig-amount"
        className="block text-sm font-medium mb-1.5 text-foreground"
      >
        Reward Amount <span className="text-muted-foreground">*</span>
      </label>
      <div className="flex items-stretch rounded-xl border bg-muted/30 overflow-hidden focus-within:ring-2 focus-within:ring-brand/50 transition-all">
        <button
          type="button"
          onClick={() => adjust(-STEP)}
          disabled={numVal <= 0}
          className="flex items-center justify-center min-w-[44px] bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted/70 disabled:text-muted-foreground/30 disabled:pointer-events-none transition-all text-lg leading-none"
          aria-label="Decrease amount"
        >
          −
        </button>
        <input
          id="gig-amount"
          type="text"
          inputMode="decimal"
          required
          value={amount}
          onChange={(e) => setField("amount", e.target.value.replace(/[eE+\-]/g, ""))}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") { e.preventDefault(); adjust(STEP); }
            if (e.key === "ArrowDown") { e.preventDefault(); adjust(-STEP); }
          }}
          onBlur={() => setTouched("amount")}
          className="flex-1 bg-transparent px-3 py-3 text-base text-foreground text-center font-semibold focus:outline-none"
          placeholder="1.0"
          aria-invalid={!!showError}
          aria-describedby="amount-error"
        />
        <button
          type="button"
          onClick={() => adjust(STEP)}
          className="flex items-center justify-center min-w-[44px] bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted/70 disabled:text-muted-foreground/30 disabled:pointer-events-none transition-all text-lg leading-none"
          aria-label="Increase amount"
        >
          +
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-2">
        {PRESETS.map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => setField("amount", String(val))}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              Math.abs(numVal - val) < 0.001
                ? "bg-brand/10 text-brand border-brand/30"
                : "border-border text-muted-foreground hover:text-foreground hover:border-brand/40"
            }`}
          >
            {val} SOL
          </button>
        ))}
      </div>

      {showError && (
        <p id="amount-error" className="text-xs text-error mt-1" role="alert">
          {errors.amount}
        </p>
      )}
    </div>
  );
}
