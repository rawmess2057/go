"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { BN } from "@coral-xyz/anchor";
import {
  PublicKey,
  SystemProgram,
  SendTransactionError,
} from "@solana/web3.js";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useProgram } from "@/hooks/useProgram";
import { useNotifications } from "@/hooks/useNotifications";
import { useGigCreateStore } from "@/stores/useGigCreateStore";
import { GigCreateData, DEFAULT_TOKEN } from "@/forms/create/types";
import { SOL_MINT, bountyAddress, vaultAddress, MIN_DEADLINE_SECONDS } from "@/lib/constants";
import { isValidSubmissionUri } from "@/lib/validate";
import FormStepper from "./components/FormStepper";
import StepTaskDetails from "./components/StepTaskDetails";
import StepPayment from "./components/StepPayment";
import StepReview from "./components/StepReview";
import FormNavigation from "./components/FormNavigation";

const slideVariants = {
  enter: () => ({ x: 200, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: () => ({ x: -200, opacity: 0 }),
};

export default function GigCreateWizard() {
  const program = useProgram();
  const wallet = useWallet();
  const { connection } = useConnection();
  const router = useRouter();
  const { addNotification } = useNotifications();

  const currentStep = useGigCreateStore((s) => s.currentStep);
  const setStep = useGigCreateStore((s) => s.setStep);
  const isSubmitting = useGigCreateStore((s) => s.isSubmitting);
  const setSubmitting = useGigCreateStore((s) => s.setSubmitting);
  const isUploading = useGigCreateStore((s) => s.isUploading);
  const loadDraft = useGigCreateStore((s) => s.loadDraft);
  const clearDraft = useGigCreateStore((s) => s.clearDraft);

  const draftResolved = useRef(false);

  useEffect(() => {
    if (draftResolved.current) return;
    draftResolved.current = true;

    const draft = loadDraft();
    if (draft) {
      const restore = window.confirm(
        "You have an unsaved draft from " +
          new Date(draft.savedAt).toLocaleTimeString() +
          ". Would you like to resume?"
      );
      if (restore) {
        const store = useGigCreateStore.getState();
        (Object.keys(draft.data) as Array<keyof GigCreateData>).forEach((key) => {
          store.setField(key, draft.data[key]);
        });
        const sel = draft.data.selectedToken;
        if (sel && typeof sel.mint === "string") {
          store.setField("selectedToken", {
            ...sel,
            mint: new PublicKey(sel.mint),
          });
        } else if (sel) {
          store.setField("selectedToken", DEFAULT_TOKEN);
        }
      } else {
        clearDraft();
      }
    }
  }, [loadDraft, clearDraft]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      const state = useGigCreateStore.getState();
      const hasData =
        state.title || state.description || state.amount || state.moderator;
      if (hasData && !state.isSubmitting) {
        e.preventDefault();
        useGigCreateStore.getState().saveDraft();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const state = useGigCreateStore.getState();

      if (!program || !wallet.publicKey) {
        toast.error("Connect your wallet first");
        return;
      }
      if (isUploading) {
        toast.error("Wait for the image upload to finish");
        return;
      }

      let mint: PublicKey;
      try {
        mint = state.selectedToken.mint instanceof PublicKey
          ? state.selectedToken.mint
          : new PublicKey(state.selectedToken.mint);
      } catch {
        mint = SOL_MINT;
      }
      const isSol = mint.equals(SOL_MINT);
      const decimals = state.selectedToken.decimals;
      const multiplier = Math.pow(10, decimals);
      const rawAmount = Math.floor(parseFloat(state.amount) * multiplier);
      if (rawAmount <= 0) {
        toast.error("Amount must be greater than 0");
        return;
      }

      let moderatorPubkey: PublicKey;
      try {
        moderatorPubkey = new PublicKey(state.moderator);
      } catch {
        toast.error("Invalid moderator public key");
        return;
      }

      const maxW = Math.min(Math.max(parseInt(state.maxWinners) || 1, 1), 10);
      const deadlineDaysNum = parseInt(state.deadlineDays, 10);
      if (isNaN(deadlineDaysNum) || deadlineDaysNum < 1 || deadlineDaysNum > 30) {
        toast.error("Deadline must be between 1 and 30 days");
        return;
      }
      const deadlineSecs =
        Math.floor(Date.now() / 1000) + deadlineDaysNum * 86400;
      if (
        deadlineSecs <
        Math.floor(Date.now() / 1000) + MIN_DEADLINE_SECONDS
      ) {
        toast.error("Deadline must be at least 1 hour in the future");
        return;
      }

      const trimmedRef = state.referenceUri.trim();
      if (trimmedRef && state.selectedTags.length === 0 && !isValidSubmissionUri(trimmedRef)) {
        toast.error("Invalid reference URI");
        return;
      }

      const id = new BN(Math.floor(Math.random() * 1_000_000) + 1);

      setSubmitting(true);
      try {
        let finalReferenceUri = trimmedRef;
        if (state.selectedTags.length > 0) {
          const tagStr = `tags=${state.selectedTags.join(",")}`;
          finalReferenceUri = finalReferenceUri
            ? `${tagStr}||${finalReferenceUri}`
            : tagStr;
        }

        const [bountyPda] = bountyAddress(wallet.publicKey, id);
        const [vaultPda] = vaultAddress(bountyPda);

        let creatorTokenAccount: PublicKey | null = null;
        if (!isSol) {
          const ATA_PROGRAM = new PublicKey(
            "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
          );
          const TOKEN_PROGRAM_ID = new PublicKey(
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          );
          [creatorTokenAccount] = PublicKey.findProgramAddressSync(
            [
              wallet.publicKey.toBuffer(),
              TOKEN_PROGRAM_ID.toBuffer(),
              state.selectedToken.mint.toBuffer(),
            ],
            ATA_PROGRAM
          );
        }

        const tx = await program.methods
          .createBounty(
            new BN(id),
            moderatorPubkey,
            state.selectedToken.mint,
            new BN(rawAmount),
            new BN(deadlineSecs),
            state.title.trim(),
            state.description.trim(),
            finalReferenceUri,
            state.thumbnailUri.trim(),
            maxW
          )
          .accounts({
            creator: wallet.publicKey,
            bounty: bountyPda,
            vault: vaultPda,
            creatorTokenAccount: creatorTokenAccount,
            systemProgram: SystemProgram.programId,
            tokenProgram: new PublicKey(
              "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
            ),
          })
          .rpc();

        await connection.confirmTransaction(tx, "confirmed");
        toast.success("Gig created!");
        addNotification({
          type: "created",
          title: "Gig created",
          body: `"${state.title.trim() || "Untitled"}" is now live`,
          href: `/gig/${bountyPda.toBase58()}`,
        });
        clearDraft();
        router.push(`/gig/${bountyPda.toBase58()}`);
      } catch (err: unknown) {
        if (err instanceof SendTransactionError) {
          console.error("Transaction simulation logs:", err.logs);
          toast.error("Transaction failed. Check your wallet for details.");
        } else {
          const message = err instanceof Error ? err.message : "Failed to create gig";
          toast.error(message);
        }
      } finally {
        setSubmitting(false);
      }
    },
    [program, wallet, connection, router, addNotification, isUploading, setSubmitting, clearDraft]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape" && currentStep > 0) {
        e.preventDefault();
        setStep(currentStep - 1);
      }
      if (e.key === "Enter" && currentStep < 2) {
        e.preventDefault();
      }
    },
    [currentStep, setStep]
  );

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="max-w-2xl mx-auto relative"
      aria-label="Create gig"
    >
      <div className="rounded-xl bg-surface border border-border p-4 mb-8 text-center">
        <p className="text-sm text-brand font-semibold">
          Non-custodial escrow on Solana
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Funds are locked in a smart contract — you stay in control
        </p>
      </div>

      <FormStepper />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {currentStep === 0 && <StepTaskDetails />}
          {currentStep === 1 && <StepPayment />}
          {currentStep === 2 && <StepReview />}
        </motion.div>
      </AnimatePresence>

      <FormNavigation isSubmitting={isSubmitting} />

      {isSubmitting && (
        <div className="mt-4 rounded-lg bg-brand/5 border border-brand/20 p-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            <div>
              <p className="text-sm font-medium text-foreground">Creating your gig...</p>
              <p className="text-xs text-muted-foreground">
                Sending transaction to Solana devnet
              </p>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
