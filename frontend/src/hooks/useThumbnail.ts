"use client";

import { useState, useEffect } from "react";
import { getImage } from "@/lib/localStore";

export function useThumbnailUrl(uri: string | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!uri) { setUrl(null); return; }
    if (uri.startsWith("local:")) {
      const key = uri.slice(6);
      let cancelled = false;
      getImage(key).then((blob) => {
        if (!cancelled && blob) setUrl(URL.createObjectURL(blob));
      });
      return () => { cancelled = true; };
    } else {
      setUrl(uri);
    }
  }, [uri]);

  return url;
}
