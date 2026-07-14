"use client";

import { useMemo } from "react";
import Link from "next/link";
import { BountyData } from "@/hooks/useBounties";
import { useSolPrice } from "@/hooks/useSolPrice";
import { useThumbnailUrl } from "@/hooks/useThumbnail";
import { isValidImageUri } from "@/lib/validate";

function shortPk(pk: string) {
  return `${pk.slice(0, 4)}...${pk.slice(-4)}`;
}

function TrendingCard({ b, solPrice }: { b: BountyData; solPrice: number | null }) {
  const thumbUrl = useThumbnailUrl(b.thumbnailUri);
  const sol = Number(b.amount) / 1e9;
  const usd = solPrice ? (sol * solPrice).toFixed(2) : null;

  return (
    <div className="shrink-0 w-56 rounded-xl border border-border bg-surface p-3 transition-all hover:border-brand/30 active:scale-[0.98]">
      <Link href={`/gig/${b.publicKey.toBase58()}`} className="flex gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {b.title || "Untitled"}
          </p>
          <p className="text-xs text-muted-foreground mt-1.5 font-mono">{shortPk(b.creator.toBase58())}</p>
          <div className="mt-2 flex items-center gap-1.5 tabular-nums">
            <span className="text-sm font-bold text-brand">{sol.toFixed(2)} SOL</span>
            {usd && <span className="text-[10px] text-muted-foreground">(${usd})</span>}
          </div>
        </div>
        {thumbUrl && isValidImageUri(thumbUrl) && (
          <div className="shrink-0">
            <img
              src={thumbUrl}
              alt=""
              className="w-16 h-16 rounded-lg object-cover"
            />
          </div>
        )}
      </Link>
    </div>
  );
}

export default function TrendingBounties({ bounties }: { bounties: BountyData[] }) {
  const solPrice = useSolPrice();

  const top = useMemo(
    () =>
      [...bounties]
        .sort((a, b) => Number(b.amount) - Number(a.amount))
        .slice(0, 8),
    [bounties]
  );

  if (top.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none">
      {top.map((b, i) => (
        <div key={b.publicKey.toBase58()} className="snap-start">
          <TrendingCard b={b} solPrice={solPrice} />
        </div>
      ))}
    </div>
  );
}
