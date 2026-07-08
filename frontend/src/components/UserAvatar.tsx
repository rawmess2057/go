"use client";

import { useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import * as identicon from "@dicebear/identicon";

export default function UserAvatar({
  pubkey,
  size = 32,
  className = "",
}: {
  pubkey: string;
  size?: number;
  className?: string;
}) {
  const svg = useMemo(() => {
    const av = createAvatar({ create: identicon.create }, { seed: pubkey, size });
    return `data:image/svg+xml,${encodeURIComponent(av.toString())}`;
  }, [pubkey, size]);

  return (
    <img
      src={svg}
      alt="avatar"
      width={size}
      height={size}
      className={`rounded-full shrink-0 bg-muted ${className}`}
    />
  );
}
