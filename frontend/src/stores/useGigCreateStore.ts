"use client";

import { create } from "zustand";
import { GigCreateData, DEFAULT_TOKEN, ValidationErrors } from "@/forms/create/types";

const DRAFT_KEY = "gig-create-draft";
const DRAFT_TTL = 24 * 60 * 60 * 1000;

interface DraftData {
  data: GigCreateData;
  savedAt: number;
}

interface GigCreateState extends GigCreateData {
  currentStep: number;
  isSubmitting: boolean;
  isUploading: boolean;
  isAutoSaving: boolean;
  lastSavedAt: number | null;
  draftId: string | null;
  errors: ValidationErrors;
  touched: Record<string, boolean>;

  setField: <K extends keyof GigCreateData>(key: K, value: GigCreateData[K]) => void;
  setStep: (step: number) => void;
  setSubmitting: (v: boolean) => void;
  setUploading: (v: boolean) => void;
  setErrors: (errors: ValidationErrors) => void;
  setTouched: (field: string) => void;
  clearErrors: () => void;
  saveDraft: () => void;
  loadDraft: () => DraftData | null;
  clearDraft: () => void;
  getAboutLines: () => string[];
  reset: () => void;
}

const initialData: GigCreateData = {
  title: "",
  description: "",
  selectedTags: [],
  referenceUri: "",
  thumbnailUri: "",
  amount: "",
  selectedToken: DEFAULT_TOKEN,
  maxWinners: "1",
  deadlineDays: "7",
  moderator: "",
};

export const useGigCreateStore = create<GigCreateState>((set, get) => ({
  ...initialData,
  currentStep: 0,
  isSubmitting: false,
  isUploading: false,
  isAutoSaving: false,
  lastSavedAt: null,
  draftId: null,
  errors: {},
  touched: {},

  setField: (key, value) => {
    set({ [key]: value } as Partial<GigCreateState>);
  },

  setStep: (step) => set({ currentStep: step }),
  setSubmitting: (v) => set({ isSubmitting: v }),
  setUploading: (v) => set({ isUploading: v }),

  setErrors: (errors) => set({ errors }),
  setTouched: (field) =>
    set((state) => ({ touched: { ...state.touched, [field]: true } })),
  clearErrors: () => set({ errors: {} }),

  saveDraft: () => {
    const state = get();
    const draft: DraftData = {
      data: {
        title: state.title,
        description: state.description,
        selectedTags: state.selectedTags,
        referenceUri: state.referenceUri,
        thumbnailUri: state.thumbnailUri,
        amount: state.amount,
        selectedToken: state.selectedToken,
        maxWinners: state.maxWinners,
        deadlineDays: state.deadlineDays,
        moderator: state.moderator,
      },
      savedAt: Date.now(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    set({ isAutoSaving: false, lastSavedAt: Date.now(), draftId: DRAFT_KEY });
  },

  loadDraft: () => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      const draft: DraftData = JSON.parse(raw);
      if (Date.now() - draft.savedAt > DRAFT_TTL) {
        localStorage.removeItem(DRAFT_KEY);
        return null;
      }
      return draft;
    } catch {
      return null;
    }
  },

  clearDraft: () => {
    localStorage.removeItem(DRAFT_KEY);
    set({ draftId: null, lastSavedAt: null });
  },

  getAboutLines: () => {
    const state = get();
    return [
      `Create a gig on Solana devnet`,
      `${state.amount || "0"} ${state.selectedToken.symbol} to an escrow vault`,
      `A ${state.deadlineDays}-day deadline with ${state.maxWinners} winner slot(s)`,
    ];
  },

  reset: () =>
    set({
      ...initialData,
      currentStep: 0,
      isSubmitting: false,
      isUploading: false,
      isAutoSaving: false,
      lastSavedAt: null,
      draftId: null,
      errors: {},
      touched: {},
    }),
}));
