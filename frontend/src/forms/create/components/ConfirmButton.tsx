"use client";

import { useGigCreateStore } from "@/stores/useGigCreateStore";

export default function ConfirmButton() {
  const currentStep = useGigCreateStore((s) => s.currentStep);

  if (currentStep !== 2) return null;

  return null;
}
