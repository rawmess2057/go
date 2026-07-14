"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BountyData } from "@/hooks/useBounties";
import { useSolPrice } from "@/hooks/useSolPrice";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
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
    <LiquidGlassCard
      glowIntensity="sm"
      shadowIntensity="sm"
      borderRadius="12px"
      blurIntensity="sm"
      className="shrink-0 w-56 p-3 transition-all hover:scale-[1.02] bg-brand-dark"
    >
      <Link
        href={`/gig/${b.publicKey.toBase58()}`}
        className="flex gap-3"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {b.title || "Untitled"}
          </p>
          <p className="text-xs text-white/60 mt-1.5 font-mono">{shortPk(b.creator.toBase58())}</p>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-sm font-bold text-white">{sol.toFixed(2)} SOL</span>
            {usd && <span className="text-[10px] text-white/50">(${usd})</span>}
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
    </LiquidGlassCard>
  );
}

export default function TrendingBounties({ bounties }: { bounties: BountyData[] }) {
  const solPrice = useSolPrice();
  const [isPaused, setIsPaused] = useState(false);

  const top = useMemo(
    () =>
      [...bounties]
        .sort((a, b) => Number(b.amount) - Number(a.amount))
        .slice(0, 8),
    [bounties]
  );

  const scrollItems = useMemo(() => [...top, ...top], [top]);
  const scrollDistance = useMemo(
    () => -(top.length * 224 + (top.length - 1) * 12),
    [top.length]
  );

  if (top.length === 0) return null;

  return (
    <div className="relative overflow-hidden">
      <motion.div
        className="flex gap-3"
        animate={isPaused ? {} : { x: [0, scrollDistance] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear", repeatDelay: 0 }}
        onHoverStart={() => setIsPaused(true)}
        onHoverEnd={() => setIsPaused(false)}
      >
        {scrollItems.map((b, i) => (
          <TrendingCard key={`${b.publicKey.toBase58()}-${i}`} b={b} solPrice={solPrice} />
        ))}
      </motion.div>
    </div>
  );
}
