"use client";

import { useState, useEffect, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import { usePrograms } from "./useProgram";

export interface SubmissionData {
  publicKey: PublicKey;
  worker: PublicKey;
  bounty: PublicKey;
  uri: string;
  submittedAt: BN;
  selected: boolean;
  rejected: boolean;
  bump: number;
}

export function useSubmissions(bountyPda: PublicKey | null, legacy: boolean = false) {
  const { newProgram, oldProgram } = usePrograms();
  const { connection } = useConnection();
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [loading, setLoading] = useState(false);

  const program = legacy ? oldProgram : newProgram;

  const fetch = useCallback(async () => {
    if (!program || !bountyPda) return;
    setLoading(true);
    try {
      const results = await program.account.submission.all([
        { memcmp: { offset: 40, bytes: bountyPda.toBase58() } },
      ]);
      setSubmissions(
        (results as { publicKey: PublicKey; account: Record<string, unknown> }[]).map(({ publicKey, account }) => ({
          publicKey,
          ...account,
        })) as SubmissionData[]
      );
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    } finally {
      setLoading(false);
    }
  }, [program, bountyPda]);

  useEffect(() => {
    if (!program || !bountyPda) return;
    fetch();
    const subId = connection.onProgramAccountChange(
      program.programId,
      () => { fetch(); },
      "confirmed",
    );
    return () => { connection.removeProgramAccountChangeListener(subId); };
  }, [fetch, program, bountyPda, connection]);

  return { submissions, loading, refetch: fetch };
}
