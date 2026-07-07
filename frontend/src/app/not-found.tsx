import Link from "next/link";

export const dynamic = "force-static";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand/20 to-purple-500/20 flex items-center justify-center text-3xl mb-6">
        🔍
      </div>
      <h1 className="text-3xl font-bold mb-2">404</h1>
      <p className="text-muted-foreground/60 mb-8 max-w-xs">
        This page doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex h-10 px-6 items-center text-sm font-medium rounded-xl bg-brand text-white hover:opacity-90 transition-opacity"
      >
        Back home
      </Link>
    </div>
  );
}
