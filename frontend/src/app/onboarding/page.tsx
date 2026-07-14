"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  {
    title: "Welcome to Gigs",
    desc: "Decentralized bounty platform on Solana. Post tasks, claim bounties, and get paid — all without a middleman.",
    icon: "🎉",
  },
  {
    title: "Connect Your Wallet",
    desc: "Click the 'Connect Wallet' button in the top right. We support Phantom and other Solana wallets.",
    icon: "🔌",
  },
  {
    title: "Create or Claim",
    desc: "Creators can post bounties with SOL rewards. Workers can browse, claim tasks, and earn by completing them.",
    icon: "💼",
  },
  {
    title: "Stay Safe",
    desc: "Funds are locked in a non-custodial escrow smart contract. Disputes are resolved by an arbiter. You're always in control.",
    icon: "🛡️",
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const router = useRouter();

  const current = STEPS[step];

  return (
    <div className="max-w-lg mx-auto py-16">
      <div className="text-center">
        <div className="text-6xl mb-6">{current.icon}</div>
        <h1 className="text-2xl font-bold mb-3">{current.title}</h1>
        <p className="text-zinc-500 leading-relaxed">{current.desc}</p>
      </div>

      <div className="rounded-xl bg-brand/5 border border-brand/20 p-4 text-sm text-zinc-600 text-center mb-8">
        You're in control — funds are locked in escrow until you approve.
      </div>
      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === step ? "bg-brand" : "bg-zinc-200"
            }`}
          />
        ))}
      </div>

      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex-1 rounded-lg border border-border px-4 py-3 text-sm font-medium text-zinc-600 hover:bg-muted transition-colors"
          >
            Back
          </button>
        )}
        <button
          onClick={() => {
            if (step < STEPS.length - 1) {
              setStep(step + 1);
            } else {
              router.push("/");
            }
          }}
          className="flex-1 rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-dark transition-colors"
        >
          {step < STEPS.length - 1 ? "Next" : "Get Started"}
        </button>
      </div>

      {step < STEPS.length - 1 && (
        <button
          onClick={() => router.push("/")}
          className="w-full mt-4 text-sm text-zinc-400 hover:text-zinc-600 text-center"
        >
          Skip
        </button>
      )}
    </div>
  );
}
