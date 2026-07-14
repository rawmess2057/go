"use client";

import { useMemo } from "react";
import Link from "next/link";
import { BountyData } from "@/hooks/useBounties";
import UserAvatar from "./UserAvatar";

function shortPk(pk: string) {
  return `${pk.slice(0, 4)}...${pk.slice(-4)}`;
}

interface Activity {
  id: string;
  type: "created" | "completed" | "submitted";
  pubkey: string;
  title: string;
  time: number;
}

export default function RecentActivity({ bounties }: { bounties: BountyData[] }) {
  const activities = useMemo(() => {
    const items: Activity[] = [];

    for (const b of bounties) {
      items.push({
        id: `c-${b.publicKey.toBase58()}`,
        type: "created",
        pubkey: b.creator.toBase58(),
        title: b.title || "Untitled",
        time: Number(b.createdAt) * 1000,
      });

      if (b.status >= 4) {
        items.push({
          id: `done-${b.publicKey.toBase58()}`,
          type: "completed",
          pubkey: b.creator.toBase58(),
          title: b.title || "Untitled",
          time: Number(b.createdAt) * 1000,
        });
      }
    }

    return items.sort((a, b) => b.time - a.time).slice(0, 15);
  }, [bounties]);

  const typeConfig = {
    created: { label: "created", dot: "bg-brand" },
    completed: { label: "completed", dot: "bg-emerald-500" },
    submitted: { label: "submitted", dot: "bg-amber-500" },
  };

  return (
    <div className="rounded-2xl border border-border bg-card backdrop-blur-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border bg-muted/30">
        <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
      </div>
      <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
        {activities.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No activity yet.</p>
        )}
        {activities.map((a) => {
          const cfg = typeConfig[a.type];
          return (
            <Link
              key={a.id}
              href={`/profile/${a.pubkey}`}
              className="flex items-start gap-3 px-5 py-3 hover:bg-muted/30 transition-colors group"
            >
              <div className="relative shrink-0 mt-0.5">
                <UserAvatar pubkey={a.pubkey} size={28} />
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${cfg.dot}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">
                  <span className="font-medium text-foreground group-hover:text-foreground transition-colors">{shortPk(a.pubkey)}</span>{" "}
                  <span className="text-muted-foreground">{cfg.label}</span>{" "}
                  <span className="font-medium text-foreground">{a.title}</span>
                </p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                  {formatTimeAgo(a.time)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
