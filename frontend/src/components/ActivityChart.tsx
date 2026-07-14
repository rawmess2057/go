"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { BountyData } from "@/hooks/useBounties";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ActivityChart({ bounties }: { bounties: BountyData[] }) {
  const data = useMemo(() => {
    const now = new Date();
    const map = new Map<string, { created: number; completed: number }>();

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map.set(key, { created: 0, completed: 0 });
    }

    for (const b of bounties) {
      const createdKey = new Date(Number(b.createdAt) * 1000).toISOString().slice(0, 10);
      if (map.has(createdKey)) map.get(createdKey)!.created += 1;

      if (b.status >= 4) {
        const completedKey = new Date(Number(b.createdAt) * 1000).toISOString().slice(0, 10);
        if (map.has(completedKey)) map.get(completedKey)!.completed += 1;
      }
    }

    return [...map.entries()].map(([date, vals]) => ({
      date,
      day: dayNames[new Date(date).getDay()],
      ...vals,
    }));
  }, [bounties]);

  return (
    <div className="rounded-2xl border border-border bg-card backdrop-blur-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border bg-muted/30">
        <h3 className="text-sm font-semibold text-foreground">Activity (30d)</h3>
      </div>
      <div className="p-5">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "rgba(0,0,0,0.3)" }} interval={3} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "rgba(0,0,0,0.3)" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ""}
            />
            <Bar dataKey="created" fill="var(--brand)" radius={[4, 4, 0, 0]} maxBarSize={8} name="Created" />
            <Bar dataKey="completed" fill="rgba(85,210,146,0.3)" radius={[4, 4, 0, 0]} maxBarSize={8} name="Completed" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-brand" /> Created
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-brand/30" /> Completed
          </span>
        </div>
      </div>
    </div>
  );
}
