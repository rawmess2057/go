"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { BountyData } from "@/hooks/useBounties";
import { useSolPrice } from "@/hooks/useSolPrice";

function shortPk(pk: string) {
  return `${pk.slice(0, 4)}...${pk.slice(-4)}`;
}

export default function TrendingBounties({ bounties }: { bounties: BountyData[] }) {
  const solPrice = useSolPrice();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollL, setCanScrollL] = useState(false);
  const [canScrollR, setCanScrollR] = useState(true);

  const top = useMemo(
    () =>
      [...bounties]
        .sort((a, b) => Number(b.amount) - Number(a.amount))
        .slice(0, 8),
    [bounties]
  );

  if (top.length === 0) return null;

  return (
    <div className="relative group">
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
        onScroll={() => {
          const el = scrollRef.current;
          if (el) {
            setCanScrollL(el.scrollLeft > 0);
            setCanScrollR(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
          }
        }}
      >
        {top.map((b) => {
          const sol = Number(b.amount) / 1e9;
          const usd = solPrice ? (sol * solPrice).toFixed(2) : null;
          return (
            <Link
              key={b.publicKey.toBase58()}
              href={`/gig/${b.publicKey.toBase58()}`}
              className="shrink-0 w-44 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-3 hover:bg-white/15 transition-all hover:scale-[1.02]"
            >
              <p className="text-sm font-medium text-white truncate">
                {b.title || "Untitled"}
              </p>
              <p className="text-xs text-white/60 mt-1.5 font-mono">{shortPk(b.creator.toBase58())}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-sm font-bold text-white">{sol.toFixed(2)} SOL</span>
                {usd && <span className="text-[10px] text-white/50">(${usd})</span>}
              </div>
            </Link>
          );
        })}
      </div>

      {canScrollL && (
        <button
          onClick={() => scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" })}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      {canScrollR && (
        <button
          onClick={() => scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" })}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}


