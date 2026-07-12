"use client";

import { useState, useEffect, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { usePrograms } from "./useProgram";

export function useWonSubmissions(wallet: PublicKey | null) {
  const { newProgram, oldProgram } = usePrograms();
  const [totalEarned, setTotalEarned] = useState(0);
  const [loading, setLoading] = useState(false);

  const computeEarnings = useCallback(async (program: any): Promise<number> => {
    if (!program || !wallet) return 0;
    const all: any[] = await program.account.submission.all([
      { memcmp: { offset: 0, bytes: wallet.toBase58() } },
    ]).catch(() => []);

    const won = all.filter((s: any) => s.account.selected);
    if (won.length === 0) return 0;

    const keyToBountyKey = new Map(
      [...new Set(won.map((s: any) => s.account.bounty.toBase58()))].map((k: string) => [
        k,
        new PublicKey(k),
      ])
    );

    const bounties: any[] = await Promise.all(
      [...keyToBountyKey.values()].map((pk: PublicKey) =>
        program.account.bounty.fetch(pk).catch(() => null)
      )
    );

    let earned = 0;
    let i = 0;
    for (const [_key, _pk] of keyToBountyKey) {
      const bounty = bounties[i++];
      if (!bounty) continue;
      const amount = Number(bounty.amount);
      const maxWinners = bounty.maxWinners ?? 1;
      const rewardPerWinner = maxWinners > 0 ? amount / maxWinners : 0;
      const count = won.filter(
        (s: any) => s.account.bounty.toBase58() === _key
      ).length;
      earned += rewardPerWinner * count;
    }

    return earned / 1e9;
  }, [wallet]);

  const fetch = useCallback(async () => {
    if (!newProgram || !wallet) return;
    setLoading(true);
    try {
      const shouldQueryOld = oldProgram && !newProgram.programId.equals(oldProgram.programId);
      const [newEarned, oldEarned] = await Promise.all([
        computeEarnings(newProgram),
        shouldQueryOld ? computeEarnings(oldProgram) : 0,
      ]);
      setTotalEarned(newEarned + oldEarned);
    } catch (err) {
      console.error("Failed to compute earnings:", err);
    } finally {
      setLoading(false);
    }
  }, [newProgram, oldProgram, wallet, computeEarnings]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { totalEarned, loading, refetch: fetch };
}
