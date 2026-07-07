"use client";

import { useState, useEffect } from "react";

let cachedPrice: number | null = null;
let cachedAt = 0;

export function useSolPrice(): number | null {
  const [price, setPrice] = useState<number | null>(cachedPrice);

  useEffect(() => {
    if (cachedPrice && Date.now() - cachedAt < 60_000) {
      setPrice(cachedPrice);
      return;
    }
    let cancelled = false;
    fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
    )
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) {
          cachedPrice = d.solana.usd;
          cachedAt = Date.now();
          setPrice(cachedPrice);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return price;
}
