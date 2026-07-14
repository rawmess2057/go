"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useGigCreateStore } from "@/stores/useGigCreateStore";

const STEPS = [
  { label: "Details", description: "Task info" },
  { label: "Payment", description: "Reward & terms" },
  { label: "Review", description: "Confirm & submit" },
];

export default function FormStepper() {
  const currentStep = useGigCreateStore((s) => s.currentStep);

  return (
    <nav aria-label="Progress" className="mb-8">
      <ol
        role="tablist"
        className="flex items-center justify-center gap-0"
      >
        {STEPS.map((step, i) => {
          const isCompleted = i < currentStep;
          const isActive = i === currentStep;

          return (
            <li key={step.label} role="presentation" className="flex items-center flex-1 last:flex-none">
              <div role="tab" aria-selected={isActive} className="flex items-center gap-2 min-w-0">
                <motion.div
                  layout
                  className={`relative w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium shrink-0 transition-colors ${
                    isCompleted
                      ? "bg-brand text-white"
                      : isActive
                        ? "bg-brand text-white ring-2 ring-brand/30"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Check className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </motion.div>
                <span
                  className={`hidden sm:block text-sm leading-tight min-w-0 ${
                    isActive
                      ? "text-foreground font-medium"
                      : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  <span className="block truncate">{step.label}</span>
                  <span className="block text-[11px] font-normal text-muted-foreground truncate">
                    {step.description}
                  </span>
                </span>
              </div>

              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px mx-3 mb-5 ${
                    isCompleted ? "bg-brand" : "bg-muted"
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
