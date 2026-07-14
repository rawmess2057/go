"use client";

import { useCallback } from "react";
import { useGigCreateStore } from "@/stores/useGigCreateStore";
import { taskDetailsSchema, paymentSchema } from "@/schemas/gigCreateSchema";

interface FormNavigationProps {
  isSubmitting: boolean;
}

export default function FormNavigation({ isSubmitting }: FormNavigationProps) {
  const currentStep = useGigCreateStore((s) => s.currentStep);
  const setStep = useGigCreateStore((s) => s.setStep);
  const setErrors = useGigCreateStore((s) => s.setErrors);
  const clearErrors = useGigCreateStore((s) => s.clearErrors);

  const validateCurrentStep = useCallback((): boolean => {
    const state = useGigCreateStore.getState();
    clearErrors();
    let result;
    if (currentStep === 0) {
      result = taskDetailsSchema.safeParse({
        title: state.title,
        description: state.description,
        selectedTags: state.selectedTags,
        referenceUri: state.referenceUri,
        thumbnailUri: state.thumbnailUri,
      });
    } else if (currentStep === 1) {
      result = paymentSchema.safeParse({
        amount: state.amount,
        selectedToken: state.selectedToken,
        maxWinners: state.maxWinners,
        deadlineDays: state.deadlineDays,
        moderator: state.moderator,
      });
    }
    if (result && !result.success) {
      const formatted: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join(".");
        if (!formatted[path]) formatted[path] = issue.message;
      }
      setErrors(formatted);
      return false;
    }
    return true;
  }, [currentStep, clearErrors, setErrors]);

  const handleNext = () => {
    if (validateCurrentStep()) {
      setStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setStep(currentStep - 1);
    }
  };

  if (currentStep < 2) {
    return (
      <div className="flex gap-3 pt-4">
        {currentStep > 0 && (
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Back
          </button>
        )}
        <button
          type="button"
          onClick={handleNext}
          className="flex-1 rounded-lg border bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentStep === 1 ? "Create Gig" : "Next"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-3 pt-4">
      <button
        type="button"
        onClick={handleBack}
        disabled={isSubmitting}
        className="flex-1 rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
      >
        Back
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex-1 rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Creating...
          </>
        ) : (
          "Post Gig"
        )}
      </button>
    </div>
  );
}
