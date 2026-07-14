"use client";

import { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useGigCreateStore } from "@/stores/useGigCreateStore";
import { TokenOption, DEFAULT_TOKEN } from "@/forms/create/types";
import { SOL_MINT } from "@/lib/constants";

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

const KNOWN_TOKENS: Record<string, { symbol: string; decimals: number }> = {
  "So11111111111111111111111111111111111111112": { symbol: "SOL", decimals: 9 },
  "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr": { symbol: "USDC", decimals: 6 },
  "8zGu4iryBusWepoKNfN3LaYb1yGNYiJfS6WRa72Qiyo5": { symbol: "USDT", decimals: 6 },
  "mntE4Z5zXHo6DVs6o7WxGtpLGLeRgGCs5w5r8sGMwnF": { symbol: "mSOL", decimals: 9 },
};

export default function TokenSelector() {
  const selectedToken = useGigCreateStore((s) => s.selectedToken);
  const setField = useGigCreateStore((s) => s.setField);
  const wallet = useWallet();
  const { connection } = useConnection();

  const [tokenOptions, setTokenOptions] = useState<TokenOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!wallet.publicKey) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const result = await connection.getTokenAccountsByOwner(wallet.publicKey!, {
          programId: TOKEN_PROGRAM_ID,
        });
        const tokens: TokenOption[] = [];
        for (const { account } of result.value) {
          const data = account.data;
          const mintHex = Buffer.from(data.slice(0, 32)).toString("hex");
          const mint = new PublicKey(mintHex);
          const mintStr = mint.toBase58();
          const known = KNOWN_TOKENS[mintStr];
          if (known) {
            tokens.push({ mint, symbol: known.symbol, decimals: known.decimals });
          }
        }
        if (!cancelled) {
          tokens.sort((a, b) => a.symbol.localeCompare(b.symbol));
          setTokenOptions(tokens);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [wallet.publicKey, connection]);

  return (
    <select
      value={selectedToken.mint.toBase58()}
      onChange={(e) => {
        const mintStr = e.target.value;
        if (mintStr === SOL_MINT.toBase58()) {
          setField("selectedToken", DEFAULT_TOKEN);
        } else {
          const found = tokenOptions.find((t) => t.mint.toBase58() === mintStr);
          if (found) setField("selectedToken", found);
        }
      }}
      className="rounded-xl border border-border bg-muted/30 px-3 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50 min-w-[100px]"
      aria-label="Select token"
    >
      <option value={SOL_MINT.toBase58()}>SOL</option>
      {loading && <option disabled>Loading...</option>}
      {tokenOptions.map((t) => (
        <option key={t.mint.toBase58()} value={t.mint.toBase58()}>
          {t.symbol}
        </option>
      ))}
      {!loading && tokenOptions.length === 0 && (
        <option value="" disabled>No SPL tokens</option>
      )}
    </select>
  );
}
