"use client";

import { useRouter } from "next/navigation";

export function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: unknown;
  resetErrorBoundary: () => void;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-zinc-900 mb-1">Something went wrong</h2>
      <p className="text-sm text-zinc-500 mb-6 max-w-md">{error instanceof Error ? error.message : "An unexpected error occurred"}</p>
      <div className="flex gap-3">
        <button
          onClick={resetErrorBoundary}
          className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
        >
          Try again
        </button>
        <button
          onClick={() => { router.push("/"); resetErrorBoundary(); }}
          className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
        >
          Go home
        </button>
      </div>
    </div>
  );
}
