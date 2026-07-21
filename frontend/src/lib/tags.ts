export interface TagDef {
  key: string;
  label: string;
  color: string;
}

export const TAGS: TagDef[] = [
  { key: "writing", label: "Writing", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
  { key: "design", label: "Design", color: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800" },
  { key: "video", label: "Video", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800" },
  { key: "development", label: "Development", color: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800" },
  { key: "marketing", label: "Marketing", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800" },
  { key: "research", label: "Research", color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800" },
  { key: "translation", label: "Translation", color: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800" },
  { key: "general", label: "General", color: "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700" },
];

const TAG_MAP = new Map(TAGS.map(t => [t.key, t]));

export function getTagDef(key: string): TagDef | undefined {
  return TAG_MAP.get(key);
}

export type TagKey = (typeof TAGS)[number]["key"];
