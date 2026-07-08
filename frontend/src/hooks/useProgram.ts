"use client";

import { useMemo } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { idl } from "@/lib/idl";
import type { BountyPlatform } from "@/lib/bounty_platform";

type TypedProgram = Program<BountyPlatform>;

export function useProgram() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  return useMemo((): {
    account: TypedProgram["account"];
    methods: any;
    provider: TypedProgram["provider"];
    programId: TypedProgram["programId"];
  } | null => {
    if (!wallet) return null;
    const provider = new AnchorProvider(connection, wallet, {});
    const program = new Program(idl as BountyPlatform, provider) as TypedProgram;
    return {
      account: program.account,
      methods: program.methods,
      provider: program.provider,
      programId: program.programId,
    };
  const program = useMemo(() => {
    const provider = new AnchorProvider(
      connection,
      wallet ?? {
        publicKey: PublicKey.default,
        signTransaction: async (tx) => tx,
        signAllTransactions: async (txs) => txs,
      },
      {}
    );
    return new Program(idl, provider) as any;

  }, [wallet, connection]);
}
