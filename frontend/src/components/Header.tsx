"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "./MobileNav";
import NotificationBell from "./NotificationBell";

const WalletMultiButtonDynamic = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const navLinks = [
  { href: "/", key: "browse", icon: "⌂" },
  { href: "/create", key: "create", icon: "+" },
  { href: "/leaderboard", key: "leaderboard", icon: "⊠" },
  { href: "/dashboard", key: "dashboard", icon: "⊞" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, locale, setLocale } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-lg font-bold tracking-tight text-white">gig</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    active
                      ? "text-white bg-white/20"
                      : "text-white/70 hover:text-white hover:bg-white/20"
                  }`}
                >
                  {t(`nav.${link.key}`)}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-brand rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (pathname !== "/") { router.push("/"); return; }
                const el = document.querySelector<HTMLInputElement>("input[type='text']");
                el?.focus();
                el?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              className="hidden sm:inline-flex w-9 h-9 rounded-lg border border-white/20 text-white/60 hover:text-white hover:bg-white/20 items-center justify-center transition-all"
              aria-label="Search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
            <NotificationBell />

            <button
              onClick={() => setLocale(locale === "en" ? "ne" : "en")}
              className="hidden sm:inline-flex h-9 px-3 items-center text-xs font-medium text-white/60 hover:text-white border border-white/20 rounded-lg hover:bg-white/20 transition-all"
            >
              {t("header.switchLanguage")}
            </button>

            <div className="hidden md:block">
              <WalletMultiButtonDynamic />
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-9 h-9 rounded-lg border border-white/20 text-white/60 hover:text-white hover:bg-white/20 flex items-center justify-center transition-all"
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? "text-white bg-white/20"
                        : "text-white/70 hover:text-white hover:bg-white/20"
                    }`}
                  >
                    <span className="w-6 text-center">{link.icon}</span>
                    {t(`nav.${link.key}`)}
                  </Link>
                );
              })}
              <div className="pt-2">
                <WalletMultiButtonDynamic />
              </div>
            </div>
          </div>
        )}
      </header>
      <MobileNav />
    </>
  );
}
