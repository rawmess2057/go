"use client";

import { useMemo } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { idl } from "@/lib/idl";

export function useProgram() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  const program = useMemo(() => {
    if (!wallet) return null;
    const provider = new AnchorProvider(connection, wallet, {});
    const program = new Program(idl, provider);
    return program as any;
  }, [wallet, connection]);

  return program as any;
}
