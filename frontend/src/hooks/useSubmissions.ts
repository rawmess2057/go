"use client";

import { useState, useEffect, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { useProgram } from "./useProgram";

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

export function useSubmissions(bountyPda: PublicKey | null) {
  const program = useProgram();
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    const p = program as any;
    if (!p || !bountyPda) return;
    setLoading(true);
    try {
      const all = await p.account.submission.all();
      const filtered = all
        .filter((a: any) => a.account.bounty.toBase58() === bountyPda.toBase58())
        .map((a: any) => {
          const data = a.account as Record<string, any>;
          return { publicKey: a.publicKey, ...data } as SubmissionData;
        });
      setSubmissions(filtered);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    } finally {
      setLoading(false);
    }
  }, [program, bountyPda]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { submissions, loading, refetch: fetch };
}
