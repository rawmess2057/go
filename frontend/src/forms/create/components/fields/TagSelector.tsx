"use client";

import { motion } from "framer-motion";
import { TAGS } from "@/lib/tags";
import { useGigCreateStore } from "@/stores/useGigCreateStore";

const MAX_TAGS = 3;

export default function TagSelector() {
  const selectedTags = useGigCreateStore((s) => s.selectedTags);
  const setField = useGigCreateStore((s) => s.setField);

  const toggle = (key: string) => {
    if (selectedTags.includes(key)) {
      setField("selectedTags", selectedTags.filter((k) => k !== key));
    } else if (selectedTags.length < MAX_TAGS) {
      setField("selectedTags", [...selectedTags, key]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-foreground">
        Category <span className="text-muted-foreground">(optional)</span>
      </label>
      <div className="flex flex-wrap gap-2" role="listbox" aria-label="Select categories" aria-multiselectable="true">
        {TAGS.map((tag) => {
          const selected = selectedTags.includes(tag.key);
          const atLimit = !selected && selectedTags.length >= MAX_TAGS;
          return (
            <motion.button
              key={tag.key}
              type="button"
              role="option"
              aria-selected={selected}
              disabled={atLimit}
              onClick={() => toggle(tag.key)}
              whileTap={{ scale: 0.95 }}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium border transition-all min-h-[36px] ${
                selected
                  ? "bg-brand/10 text-brand border-brand/30"
                  : atLimit
                    ? "border-border text-muted-foreground/40 cursor-not-allowed"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-brand/40"
              }`}
            >
              {tag.label}
            </motion.button>
          );
        })}
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        Select up to {MAX_TAGS} categories{" "}
        <span className="font-medium">({selectedTags.length}/{MAX_TAGS})</span>
      </p>
    </div>
  );
}
