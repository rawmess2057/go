"use client";

import { useState, useEffect, useRef } from "react";
import { validateSubmissionUri } from "@/lib/validate";

export default function SubmissionUriField({
  value,
  onChange,
  placeholder = "ipfs://...",
  hint,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!touched) return;
    clearTimeout(timer.current ?? undefined);
    timer.current = setTimeout(() => {
      if (!value) { setError(null); return; }
      const result = validateSubmissionUri(value);
      setError(result.valid ? null : result.error ?? null);
    }, 400);
    return () => clearTimeout(timer.current ?? undefined);
  }, [value, touched]);

  return (
    <div>
      <label className="block text-sm font-medium mb-1">Submission URI</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder={placeholder}
        className={`w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 transition-all ${
          error
            ? "border-red-500 focus:ring-red-500/50"
            : "border-border focus:ring-brand/50"
        }`}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
      {!error && hint && (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
