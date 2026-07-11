"use client";

import { useState, useEffect, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { useProgram } from "./useProgram";

export function useWonSubmissions(wallet: PublicKey | null) {
  const program = useProgram();
  const [totalEarned, setTotalEarned] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!program || !wallet) return;
    setLoading(true);
    try {
      const all: any[] = await program.account.submission.all([
        { memcmp: { offset: 0, bytes: wallet.toBase58() } },
      ]);

      const won = all.filter((s) => s.account.selected);
      if (won.length === 0) {
        setTotalEarned(0);
        return;
      }

      const keyToBountyKey = new Map(
        [...new Set(won.map((s) => s.account.bounty.toBase58()))].map((k) => [
          k,
          new PublicKey(k),
        ])
      );

      const bounties: any[] = await Promise.all(
        [...keyToBountyKey.values()].map((pk) =>
          program.account.bounty.fetch(pk).catch(() => null)
        )
      );

      let earned = 0;
      let i = 0;
      for (const [key, _pk] of keyToBountyKey) {
        const bounty = bounties[i++];
        if (!bounty) continue;
        const amount = Number(bounty.amount);
        const maxWinners = bounty.maxWinners ?? 1;
        const rewardPerWinner = maxWinners > 0 ? amount / maxWinners : 0;
        const count = won.filter(
          (s) => s.account.bounty.toBase58() === key
        ).length;
        earned += rewardPerWinner * count;
      }

      setTotalEarned(earned / 1e9);
    } catch (err) {
      console.error("Failed to compute earnings:", err);
    } finally {
      setLoading(false);
    }
  }, [program, wallet]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { totalEarned, loading, refetch: fetch };
}
