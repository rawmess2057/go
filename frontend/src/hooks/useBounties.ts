"use client";

import { useState, useEffect, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { useProgram } from "./useProgram";
import { bountyAddress } from "@/lib/constants";

const STATUS_MAP: Record<string, number> = {
  open: 0,
  submitted: 1,
  winnerselected: 2,
  completed: 3,
  disputed: 4,
  expired: 5,
};

function normalizeStatus(raw: any): number {
  if (typeof raw === "number") return raw;
  if (typeof raw === "object" && raw !== null) {
    const key = Object.keys(raw)[0]?.toLowerCase() ?? "";
    return STATUS_MAP[key] ?? 0;
  }
  return 0;
}

export interface BountyData {
  publicKey: PublicKey;
  creator: PublicKey;
  moderator: PublicKey;
  bountyId: BN;
  tokenMint: PublicKey;
  amount: BN;
  deadline: BN;
  createdAt: BN;
  title: string;
  description: string;
  referenceUri: string;
  thumbnailUri: string;
  submissionUri: string;
  status: number;
  bump: number;
  maxWinners: number;
  winnersSelected: number;
}

export function useBounties() {
  const program = useProgram();
  const [bounties, setBounties] = useState<BountyData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    const p = program as any;
    if (!p) return;
    setLoading(true);
    try {
      const accounts = await p.account.bounty.all();
      const mapped = accounts.map((a: any) => {
        const data = a.account as Record<string, any>;
        return { publicKey: a.publicKey, ...data, status: normalizeStatus(data.status) } as BountyData;
      });
      setBounties(mapped);
    } catch (err) {
      console.error("Failed to fetch bounties:", err);
    } finally {
      setLoading(false);
    }
  }, [program]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { bounties, loading, refetch: fetch };
}

export function useBountyByKey(bountyKey: string) {
  const program = useProgram();
  const [bounty, setBounty] = useState<BountyData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    const p = program as any;
    if (!p || !bountyKey) return;
    setLoading(true);
    const pk = new PublicKey(bountyKey);
    try {
      const account = await p.account.bounty.fetch(pk);
      const data = account as Record<string, any>;
      setBounty({ publicKey: pk, ...data, status: normalizeStatus(data.status) } as BountyData);
    } catch (err) {
      console.error("Failed to fetch bounty:", err);
      setBounty(null);
    } finally {
      setLoading(false);
    }
  }, [program, bountyKey]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { bounty, loading, refetch: fetch };
}

export function useBountyById(creator: PublicKey | null, id: BN) {
  const program = useProgram();
  const [bounty, setBounty] = useState<BountyData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const p = program as any;
    if (!p || !creator) return;
    const creatorPk = creator;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [pda] = bountyAddress(creatorPk, id);
        const account = await p.account.bounty.fetch(pda);
        if (!cancelled) {
          const data = account as Record<string, any>;
          setBounty({ publicKey: pda, ...data, status: normalizeStatus(data.status) } as BountyData);
        }
      } catch {
        if (!cancelled) setBounty(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [program, creator, id]);

  return { bounty, loading };
}
