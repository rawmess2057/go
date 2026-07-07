"use client";

import { useState, useEffect, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import { useProgram } from "./useProgram";
import { bountyAddress } from "@/lib/constants";
import type { BountyPlatform } from "@/lib/bounty_platform";

type BountyAccount = {
  publicKey: PublicKey;
  account: BountyPlatform["accounts"][number] extends infer A
    ? A extends { name: "bounty" } ? A : never
    : never;
};

const STATUS_MAP: Record<string, number> = {
  open: 0,
  submitted: 1,
  winnerselected: 2,
  completed: 3,
  disputed: 4,
  expired: 5,
};

function normalizeStatus(raw: unknown): number {
  if (typeof raw === "number") return raw;
  if (typeof raw === "object" && raw !== null) {
    const key = Object.keys(raw as Record<string, unknown>)[0]?.toLowerCase() ?? "";
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
  const { connection } = useConnection();
  const [bounties, setBounties] = useState<BountyData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!program) return;
    setLoading(true);
    try {
      const accounts = await program.account.bounty.all();
      const mapped = accounts.map(({ publicKey, account }) => ({
        publicKey,
        ...account,
        status: normalizeStatus(account.status),
      })) as BountyData[];
      setBounties(mapped);
    } catch (err) {
      console.error("Failed to fetch bounties:", err);
    } finally {
      setLoading(false);
    }
  }, [program]);

  useEffect(() => {
    if (!program) return;
    fetch();
    const subId = connection.onProgramAccountChange(
      program.programId,
      () => { fetch(); },
      "confirmed",
    );
    return () => { connection.removeProgramAccountChangeListener(subId); };
  }, [fetch, program, connection]);

  return { bounties, loading, refetch: fetch };
}

export function useBountyByKey(bountyKey: string) {
  const program = useProgram();
  const { connection } = useConnection();
  const [bounty, setBounty] = useState<BountyData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!program || !bountyKey) return;
    setLoading(true);
    const pk = new PublicKey(bountyKey);
    try {
      const account = await program.account.bounty.fetch(pk);
      setBounty({ publicKey: pk, ...account, status: normalizeStatus(account.status) } as BountyData);
    } catch (err) {
      console.error("Failed to fetch bounty:", err);
      setBounty(null);
    } finally {
      setLoading(false);
    }
  }, [program, bountyKey]);

  useEffect(() => {
    if (!program || !bountyKey) return;
    fetch();
    const pk = new PublicKey(bountyKey);
    const subId = connection.onAccountChange(pk, () => { fetch(); }, "confirmed");
    return () => {
      connection.removeAccountChangeListener(subId);
    };
  }, [fetch, program, bountyKey, connection]);

  return { bounty, loading, refetch: fetch };
}

export function useBountyById(creator: PublicKey | null, id: BN) {
  const program = useProgram();
  const [bounty, setBounty] = useState<BountyData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!program || !creator) return;
    const prog = program;
    const creatorPk = creator;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [pda] = bountyAddress(creatorPk, id);
        const account = await prog.account.bounty.fetch(pda);
        if (!cancelled) {
          setBounty({ publicKey: pda, ...account, status: normalizeStatus(account.status) } as BountyData);
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
