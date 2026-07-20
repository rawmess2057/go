"use client";

import { useGigCreateStore } from "@/stores/useGigCreateStore";

const LIMIT = 500;

function getCountColor(count: number): string {
  if (count >= LIMIT) return "text-error";
  if (count >= LIMIT - 100) return "text-warning";
  return "text-muted-foreground";
}

export default function TitleField() {
  const title = useGigCreateStore((s) => s.title);
  const setField = useGigCreateStore((s) => s.setField);
  const errors = useGigCreateStore((s) => s.errors);

  const showError = !!errors.title;

  return (
    <div>
      <label
        htmlFor="gig-title"
        className="block text-sm font-medium mb-1.5 text-foreground"
      >
        Task Title <span className="text-muted-foreground">*</span>
      </label>
      <div className="relative">
        <input
          id="gig-title"
          type="text"
          maxLength={LIMIT}
          required
          value={title}
          onChange={(e) => setField("title", e.target.value)}
          className={`w-full rounded-lg border bg-muted/30 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all ${
            showError
              ? "border-error ring-1 ring-error/30"
              : "border-border"
          }`}
          placeholder="What needs to be done?"
          aria-invalid={!!showError}
          aria-describedby="title-counter title-error"
        />
      </div>
      <div className="flex items-center justify-between mt-1">
        {showError && (
          <p id="title-error" className="text-xs text-error" role="alert">
            {errors.title}
          </p>
        )}
        <span
          id="title-counter"
          className={`text-xs ml-auto transition-colors ${getCountColor(title.length)}`}
        >
          {title.length}/{LIMIT} chars
        </span>
      </div>
    </div>
  );
}
