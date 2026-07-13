"use client";

import { useState, useEffect, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import { usePrograms } from "./useProgram";
import { bountyAddress, PROGRAM_ID, OLD_PROGRAM_ID } from "@/lib/constants";
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
  legacy: boolean;
}

export function useBounties() {
  const { newProgram, oldProgram } = usePrograms();
  const { connection } = useConnection();
  const [bounties, setBounties] = useState<BountyData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!newProgram) return;
    setLoading(true);
    try {
      const [newAccounts, oldAccounts] = await Promise.all([
        newProgram.account.bounty.all().catch(() => []),
        oldProgram?.account.bounty.all().catch(() => []) ?? [],
      ]);
      const mapped = [
        ...(newAccounts as { publicKey: PublicKey; account: Record<string, unknown> }[]).map(({ publicKey, account }) => ({
          publicKey,
          ...account,
          status: normalizeStatus(account.status),
          legacy: false,
        })),
        ...(oldAccounts as { publicKey: PublicKey; account: Record<string, unknown> }[]).map(({ publicKey, account }) => ({
          publicKey,
          ...account,
          status: normalizeStatus(account.status),
          legacy: true,
        })),
      ] as BountyData[];
      const seen = new Set<string>();
      const deduped = mapped.filter(b => {
        const key = b.publicKey.toBase58();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setBounties(deduped);
    } catch (err) {
      console.error("Failed to fetch bounties:", err);
    } finally {
      setLoading(false);
    }
  }, [newProgram, oldProgram]);

  useEffect(() => {
    if (!newProgram) return;
    fetch();
    const subId1 = connection.onProgramAccountChange(
      newProgram.programId,
      () => { fetch(); },
      "confirmed",
    );
    const subId2 = oldProgram
      ? connection.onProgramAccountChange(
          oldProgram.programId,
          () => { fetch(); },
          "confirmed",
        )
      : undefined;
    return () => {
      connection.removeProgramAccountChangeListener(subId1);
      if (subId2 !== undefined) {
        connection.removeProgramAccountChangeListener(subId2);
      }
    };
  }, [fetch, newProgram, oldProgram, connection]);

  return { bounties, loading, refetch: fetch };
}

export function useBountyByKey(bountyKey: string) {
  const { newProgram, oldProgram } = usePrograms();
  const { connection } = useConnection();
  const [bounty, setBounty] = useState<BountyData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!newProgram || !bountyKey) return;
    setLoading(true);
    const pk = new PublicKey(bountyKey);
    try {
      const accountInfo = await connection.getAccountInfo(pk);
      if (!accountInfo) { setBounty(null); return; }

      const isLegacy = OLD_PROGRAM_ID ? accountInfo.owner.equals(OLD_PROGRAM_ID) : false;
      const program = isLegacy ? oldProgram : newProgram;
      if (!program) throw new Error("no matching program");

      const account = await program.account.bounty.fetch(pk);
      setBounty({ publicKey: pk, ...account, status: normalizeStatus(account.status), legacy: isLegacy } as BountyData);
    } catch {
      setBounty(null);
    } finally {
      setLoading(false);
    }
  }, [newProgram, oldProgram, OLD_PROGRAM_ID, bountyKey, connection]);

  useEffect(() => {
    if (!newProgram || !bountyKey) return;
    fetch();
    const pk = new PublicKey(bountyKey);
    const subId = connection.onAccountChange(pk, () => { fetch(); }, "confirmed");
    return () => {
      connection.removeAccountChangeListener(subId);
    };
  }, [fetch, newProgram, bountyKey, connection]);

  return { bounty, loading, refetch: fetch };
}

export function useBountyById(creator: PublicKey | null, id: BN) {
  const { newProgram, oldProgram } = usePrograms();
  const [bounty, setBounty] = useState<BountyData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!newProgram || !creator) return;
    const creatorPk: PublicKey = creator;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [newPda] = bountyAddress(creatorPk, id, PROGRAM_ID);
        const acc = await newProgram.account.bounty.fetch(newPda);
        if (!cancelled) {
          setBounty({ publicKey: newPda, ...acc, status: normalizeStatus(acc.status), legacy: false } as BountyData);
        }
      } catch {
        try {
          if (!oldProgram) throw new Error("no old program");
          const [oldPda] = bountyAddress(creatorPk, id, OLD_PROGRAM_ID);
          const acc = await oldProgram.account.bounty.fetch(oldPda);
          if (!cancelled) {
            setBounty({ publicKey: oldPda, ...acc, status: normalizeStatus(acc.status), legacy: true } as BountyData);
          }
        } catch {
          if (!cancelled) setBounty(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [newProgram, oldProgram, creator, id]);

  return { bounty, loading };
}
