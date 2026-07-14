"use client";

import { useMemo } from "react";
import { useGigCreateStore } from "@/stores/useGigCreateStore";

export default function DeadlineField() {
  const deadlineDays = useGigCreateStore((s) => s.deadlineDays);
  const setField = useGigCreateStore((s) => s.setField);
  const errors = useGigCreateStore((s) => s.errors);
  const touched = useGigCreateStore((s) => s.touched);

  const numVal = parseInt(deadlineDays) || 7;
  const showError = touched.deadlineDays && errors.deadlineDays;

  const endDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + numVal);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [numVal]);

  return (
    <div>
      <label
        htmlFor="gig-deadline"
        className="block text-sm font-medium mb-1.5 text-foreground"
      >
        Deadline (days) <span className="text-muted-foreground">*</span>
      </label>
      <div className="flex items-stretch rounded-xl border bg-muted/30 overflow-hidden focus-within:ring-2 focus-within:ring-brand/50 transition-all">
        <button
          type="button"
          onClick={() => setField("deadlineDays", String(Math.max(1, numVal - 1)))}
          disabled={numVal <= 1}
          className="flex items-center justify-center min-w-[44px] bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted/70 disabled:text-muted-foreground/30 disabled:pointer-events-none transition-all text-lg leading-none"
          aria-label="Decrease deadline"
        >
          −
        </button>
        <input
          id="gig-deadline"
          type="text"
          inputMode="numeric"
          required
          value={deadlineDays}
          onChange={(e) =>
            setField("deadlineDays", e.target.value.replace(/[eE.+\-]/g, ""))
          }
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") { e.preventDefault(); setField("deadlineDays", String(Math.min(30, numVal + 1))); }
            if (e.key === "ArrowDown") { e.preventDefault(); setField("deadlineDays", String(Math.max(1, numVal - 1))); }
          }}
          onBlur={() => {
            const clamped = Math.min(30, Math.max(1, parseInt(deadlineDays) || 1));
            setField("deadlineDays", String(clamped));
          }}
          className="flex-1 bg-transparent px-3 py-3 text-base text-foreground text-center font-semibold focus:outline-none"
          aria-invalid={!!showError}
          aria-describedby="deadline-error"
        />
        <button
          type="button"
          onClick={() => setField("deadlineDays", String(Math.min(30, numVal + 1)))}
          disabled={numVal >= 30}
          className="flex items-center justify-center min-w-[44px] bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted/70 disabled:text-muted-foreground/30 disabled:pointer-events-none transition-all text-lg leading-none"
          aria-label="Increase deadline"
        >
          +
        </button>
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        Ends: <span className="font-medium text-foreground">{endDate}</span>
      </p>

      {showError && (
        <p id="deadline-error" className="text-xs text-error mt-1" role="alert">
          {errors.deadlineDays}
        </p>
      )}
    </div>
  );
}
