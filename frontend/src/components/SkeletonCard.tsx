"use client";

export default function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/3" />
        </div>
        <div className="h-6 w-16 bg-muted rounded-full" />
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-2/3" />
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div className="space-y-1.5">
          <div className="h-5 bg-muted rounded w-24" />
          <div className="h-3 bg-muted rounded w-16" />
        </div>
        <div className="h-4 bg-muted rounded w-20" />
      </div>
      <div className="mt-3 pt-3 border-t border-border/50 flex justify-between">
        <div className="h-3 bg-muted rounded w-16" />
        <div className="h-3 bg-muted rounded w-12" />
      </div>
    </div>
  );
}
