"use client";

import { useMemo } from "react";

export interface BountyMetadata {
  tags: string[];
  referenceUrl: string;
}

export function parseReferenceUri(uri: string | undefined | null): BountyMetadata {
  if (!uri) return { tags: [], referenceUrl: "" };

  if (uri.startsWith("http://") || uri.startsWith("https://")) {
    return { tags: [], referenceUrl: uri };
  }

  if (uri.startsWith("tags=")) {
    const afterPrefix = uri.slice(5);
    const separatorIndex = afterPrefix.indexOf("||");
    if (separatorIndex === -1) {
      return { tags: afterPrefix.split(",").filter(Boolean), referenceUrl: "" };
    }
    return {
      tags: afterPrefix.slice(0, separatorIndex).split(",").filter(Boolean),
      referenceUrl: afterPrefix.slice(separatorIndex + 2),
    };
  }

  return { tags: [], referenceUrl: uri };
}

export function useMetadata(referenceUri: string | undefined): BountyMetadata {
  return useMemo(() => parseReferenceUri(referenceUri), [referenceUri]);
}
