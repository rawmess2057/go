export interface TagDef {
  key: string;
  label: string;
  color: string;
}

export const TAGS: TagDef[] = [
  { key: "design", label: "Design", color: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800" },
  { key: "content", label: "Content", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
  { key: "development", label: "Development", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800" },
  { key: "writing", label: "Writing", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
  { key: "marketing", label: "Marketing", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800" },
  { key: "general", label: "General", color: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700" },
];

const TAG_MAP = new Map(TAGS.map(t => [t.key, t]));

export function getTagDef(key: string): TagDef | undefined {
  return TAG_MAP.get(key);
}

export type TagKey = (typeof TAGS)[number]["key"];
