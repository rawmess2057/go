"use client";

import { useCallback } from "react";
import { ClipboardPaste } from "lucide-react";
import { useGigCreateStore } from "@/stores/useGigCreateStore";
import { isValidSolanaAddress } from "@/lib/validate";

export default function ModeratorField() {
  const moderator = useGigCreateStore((s) => s.moderator);
  const setField = useGigCreateStore((s) => s.setField);
  const setTouched = useGigCreateStore((s) => s.setTouched);
  const errors = useGigCreateStore((s) => s.errors);
  const touched = useGigCreateStore((s) => s.touched);

  const showError = touched.moderator && errors.moderator;
  const isPotentiallyValid =
    moderator.length >= 32 && moderator.length <= 44 && isValidSolanaAddress(moderator);

  const pasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      const cleaned = text.trim();
      if (cleaned) {
        setField("moderator", cleaned);
        setTouched("moderator");
      }
    } catch {
      // Clipboard access denied or unavailable
    }
  }, [setField, setTouched]);

  return (
    <div>
      <label
        htmlFor="gig-moderator"
        className="block text-sm font-medium mb-1.5 text-foreground"
      >
        Moderator Wallet <span className="text-muted-foreground">*</span>
      </label>
      <div className="relative">
        <input
          id="gig-moderator"
          type="text"
          required
          value={moderator}
          onChange={(e) => setField("moderator", e.target.value)}
          onBlur={() => setTouched("moderator")}
          className={`w-full rounded-lg border bg-muted/30 px-4 py-2.5 pr-10 text-sm font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all ${
            showError
              ? "border-error ring-1 ring-error/30"
              : isPotentiallyValid
                ? "border-success"
                : moderator.length > 0
                  ? "border-border"
                  : "border-border"
          }`}
          placeholder="Enter moderator wallet address"
          aria-invalid={!!showError}
          aria-describedby="moderator-error moderator-hint"
        />
        <button
          type="button"
          onClick={pasteFromClipboard}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
          aria-label="Paste from clipboard"
          title="Paste from clipboard"
        >
          <ClipboardPaste className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-1">
        {showError && (
          <p id="moderator-error" className="text-xs text-error" role="alert">
            {errors.moderator}
          </p>
        )}
        {!showError && moderator.length > 0 && isPotentiallyValid && (
          <p className="text-xs text-success">Valid address</p>
        )}
        {!showError && moderator.length > 0 && !isPotentiallyValid && moderator.length < 32 && (
          <p className="text-xs text-muted-foreground">Enter a valid Solana address (32-44 characters)</p>
        )}
      </div>

      <p id="moderator-hint" className="mt-1 text-xs text-muted-foreground">
        An independent third party who reviews submissions and releases payments in case of disputes
      </p>
    </div>
  );
}
