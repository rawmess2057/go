"use client";

import { useMemo } from "react";
import { useGigCreateStore } from "@/stores/useGigCreateStore";

const WORD_LIMIT = 500;

function wordCount(s: string): number {
  return s.trim() ? s.trim().split(/\s+/).length : 0;
}

function getCountColor(count: number): string {
  if (count >= WORD_LIMIT) return "text-error";
  if (count >= WORD_LIMIT * 0.8) return "text-warning";
  return "text-muted-foreground";
}

export default function DescriptionField() {
  const description = useGigCreateStore((s) => s.description);
  const setField = useGigCreateStore((s) => s.setField);
  const errors = useGigCreateStore((s) => s.errors);

  const showError = !!errors.description;
  const wc = useMemo(() => wordCount(description), [description]);

  return (
    <div>
      <label
        htmlFor="gig-description"
        className="block text-sm font-medium mb-1.5 text-foreground"
      >
        Description <span className="text-muted-foreground">*</span>
      </label>
      <textarea
        id="gig-description"
        maxLength={3000}
        required
        rows={5}
        value={description}
        onChange={(e) => setField("description", e.target.value)}
        className={`w-full rounded-lg border bg-muted/30 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/50 resize-y min-h-[120px] transition-all ${
          showError
            ? "border-error ring-1 ring-error/30"
            : "border-border"
        }`}
        placeholder="Describe the task in detail. Include requirements, deliverables, and any relevant information..."
        aria-invalid={!!showError}
        aria-describedby="description-counter description-error"
      />
      <div className="flex items-center justify-between mt-1">
        {showError && (
          <p id="description-error" className="text-xs text-error" role="alert">
            {errors.description}
          </p>
        )}
        <span
          id="description-counter"
          className={`text-xs ml-auto transition-colors ${getCountColor(wc)}`}
        >
          {wc}/{WORD_LIMIT} words
        </span>
      </div>
    </div>
  );
}
