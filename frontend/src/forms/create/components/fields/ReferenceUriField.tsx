"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { useGigCreateStore } from "@/stores/useGigCreateStore";

export default function ReferenceUriField() {
  const referenceUri = useGigCreateStore((s) => s.referenceUri);
  const setField = useGigCreateStore((s) => s.setField);
  const errors = useGigCreateStore((s) => s.errors);

  const [expanded, setExpanded] = useState(!!referenceUri);

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        aria-expanded={expanded}
      >
        <ExternalLink className="w-4 h-4" />
        {expanded ? "Remove reference link" : "Add reference link"}
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2">
              <input
                type="text"
                value={referenceUri}
                onChange={(e) => setField("referenceUri", e.target.value)}
                className={`w-full rounded-lg border bg-muted/30 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all ${
                  errors.referenceUri ? "border-error ring-1 ring-error/30" : "border-border"
                }`}
                placeholder="https://... or ipfs://..."
                aria-invalid={!!errors.referenceUri}
                aria-describedby={errors.referenceUri ? "ref-error" : undefined}
              />
              {errors.referenceUri && (
                <p id="ref-error" className="text-xs text-error mt-1" role="alert">
                  {errors.referenceUri}
                </p>
              )}
              {!errors.referenceUri && referenceUri && (
                <p className="text-xs text-success mt-1">Valid link</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                Link to specs, designs, or reference materials
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
