"use client";

import { useMemo } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { idl } from "@/lib/idl";

export function useProgram() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  return useMemo(() => {
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
