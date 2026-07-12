"use client";

import { useMemo } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { idl } from "@/lib/idl";
import { PROGRAM_ID, OLD_PROGRAM_ID } from "@/lib/constants";

function createProvider(connection: any, wallet: any) {
  return new AnchorProvider(
    connection,
    wallet ?? {
      publicKey: PublicKey.default,
      signTransaction: async (tx) => tx,
      signAllTransactions: async (txs) => txs,
    },
    {}
  );
}

function programWithId(idl: any, programId: PublicKey, provider: AnchorProvider) {
  const clone = JSON.parse(JSON.stringify(idl));
  clone.address = programId.toBase58();
  return new Program(clone, provider) as any;
}

export function usePrograms() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  return useMemo(() => {
    const provider = createProvider(connection, wallet);
    return {
      newProgram: programWithId(idl, PROGRAM_ID, provider),
      oldProgram: programWithId(idl, OLD_PROGRAM_ID, provider),
    };
  }, [wallet, connection]);
}

export function useProgram() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  return useMemo(() => {
    const provider = createProvider(connection, wallet);
    return programWithId(idl, PROGRAM_ID, provider);
  }, [wallet, connection]);
}
