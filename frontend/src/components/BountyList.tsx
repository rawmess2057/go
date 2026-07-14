"use client";

import { useState, useMemo, useCallback } from "react";
import { useBounties, BountyData } from "@/hooks/useBounties";
import BountyCard from "./BountyCard";
import SearchBar from "./SearchBar";
import SortDropdown, { type SortKey } from "./SortDropdown";
import Sidebar from "./Sidebar";
import EmptyState from "./EmptyState";
import SkeletonCard from "./SkeletonCard";
import { useTranslation } from "@/lib/i18n";
import { TAGS, type TagKey } from "@/lib/tags";
import { parseReferenceUri } from "@/hooks/useMetadata";

const ALL = -1;
type FilterValue = typeof ALL | TagKey;

const CATEGORY_FILTERS = [
  { type: "all" as const, key: ALL, label: "bountyList.all" },
  ...TAGS.map(tag => ({ type: "tag" as const, key: tag.key, label: tag.label })),
] as const;

const PAGE_SIZE = 12;

function sortBounties(bounties: BountyData[], sort: SortKey): BountyData[] {
  const copy = [...bounties];
  switch (sort) {
    case "reward-desc":
      return copy.sort((a, b) => Number(b.amount) - Number(a.amount));
    case "reward-asc":
      return copy.sort((a, b) => Number(a.amount) - Number(b.amount));
    case "newest":
      return copy.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
    case "deadline":
      return copy.sort((a, b) => Number(a.deadline) - Number(b.deadline));
    default:
      return copy;
  }
}

export default function BountyList() {
  const { t } = useTranslation();
  const { bounties, loading, refetch } = useBounties();
  const [activeFilter, setActiveFilter] = useState<FilterValue>(ALL);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("reward-desc");
  const [page, setPage] = useState(1);

  const searchMatch = useCallback((b: BountyData, q: string) => {
    if (!q) return true;
    const lower = q.toLowerCase();
    return (
      b.title?.toLowerCase().includes(lower) ||
      b.description?.toLowerCase().includes(lower) ||
      b.creator.toBase58().toLowerCase().includes(lower) ||
      b.moderator.toBase58().toLowerCase().includes(lower)
    );
  }, []);

  const processed = useMemo(() => {
    let result = activeFilter === ALL
      ? bounties
      : bounties.filter((b) => {
          const parsed = parseReferenceUri(b.referenceUri);
          return parsed.tags.includes(activeFilter);
        });
    if (search) result = result.filter((b) => searchMatch(b, search));
    result = sortBounties(result, sort);
    return result;
  }, [bounties, activeFilter, search, sort, searchMatch]);

  const visible = useMemo(() => processed.slice(0, page * PAGE_SIZE), [processed, page]);
  const hasMore = visible.length < processed.length;

  const loadingInitial = loading && bounties.length === 0;

  return (
    <div className="flex gap-8">
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
          <div className="flex-1">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <div className="flex items-center gap-2">
            <SortDropdown value={sort} onChange={setSort} />
            <button
              onClick={refetch}
              className="w-9 h-9 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-all"
              title={t("bountyList.refresh")}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => { setActiveFilter(f.key as FilterValue); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeFilter === f.key
                  ? "bg-brand text-white shadow-sm shadow-brand/20"
                  : "border border-border text-muted-foreground hover:text-foreground hover:border-brand/40"
              }`}
            >
              {f.type === "all" ? t(f.label) : f.label}
            </button>
          ))}
        </div>

        {loadingInitial ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            title={t("bountyList.emptyTitle")}
            description={
              search
                ? t("bountyList.emptySearch")
                : t("bountyList.emptyDescAll")
            }
            actionLabel={t("bountyList.emptyAction")}
            actionHref="/create"
          />
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((b, i) => (
                <BountyCard key={b.publicKey.toBase58()} bounty={b} index={i} />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-xl border border-border bg-card px-6 py-3 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted transition-all"
                >
                  {t("bountyList.loadMore")} ({processed.length - visible.length})
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="hidden lg:block w-72 shrink-0">
        <Sidebar bounties={bounties} loading={loading} />
      </div>
    </div>
  );
}
