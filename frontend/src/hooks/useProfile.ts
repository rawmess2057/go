"use client";

import { useState, useEffect, useCallback } from "react";
import type { ProfileData } from "@/lib/profile";
import { loadProfile, saveProfile, DEFAULT_PROFILE } from "@/lib/profile";

export function useProfile(pubkey: string | null) {
  const [profile, setProfile] = useState<ProfileData>({ ...DEFAULT_PROFILE });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!pubkey) return;
    setProfile(loadProfile(pubkey));
    setLoaded(true);
  }, [pubkey]);

  const update = useCallback(
    (data: Partial<ProfileData>) => {
      if (!pubkey) return;
      const next = { ...profile, ...data };
      setProfile(next);
      saveProfile(pubkey, next);
    },
    [pubkey, profile]
  );

  const reset = useCallback(() => {
    if (!pubkey) return;
    setProfile({ ...DEFAULT_PROFILE });
    saveProfile(pubkey, { ...DEFAULT_PROFILE });
  }, [pubkey]);

  return { profile, loaded, update, reset };
}
