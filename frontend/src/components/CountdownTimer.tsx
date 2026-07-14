"use client";

import { useState, useEffect } from "react";

export default function CountdownTimer({ target }: { target: number }) {
  const [remaining, setRemaining] = useState(target - Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(target - Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [target]);

  if (remaining <= 0) return <span className="text-error text-xs font-medium">Expired</span>;

  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const mins = Math.floor((remaining % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  parts.push(`${mins}m`);

  return (
    <span className="text-xs font-medium tabular-nums text-muted-foreground">
      {parts.join(" ")}
    </span>
  );
}
