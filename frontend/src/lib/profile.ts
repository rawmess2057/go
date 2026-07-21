export interface ProfileData {
  displayName: string;
  bio: string;
  skills: string[];
  twitter: string;
  github: string;
  website: string;
}

export const DEFAULT_PROFILE: ProfileData = {
  displayName: "",
  bio: "",
  skills: [],
  twitter: "",
  github: "",
  website: "",
};

function storageKey(pubkey: string) {
  return `gig_profile_${pubkey}`;
}

export function loadProfile(pubkey: string): ProfileData {
  if (typeof window === "undefined") return { ...DEFAULT_PROFILE };
  try {
    const raw = localStorage.getItem(storageKey(pubkey));
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_PROFILE, ...parsed };
    }
  } catch {}
  return { ...DEFAULT_PROFILE };
}

export function saveProfile(pubkey: string, data: ProfileData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(pubkey), JSON.stringify(data));
}

export function computeCompletionRate(
  completedCount: number,
  totalCount: number
): number {
  if (totalCount === 0) return 0;
  return Math.round((completedCount / totalCount) * 100);
}
