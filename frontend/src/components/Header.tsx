"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useTheme } from "next-themes";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "./MobileNav";
import NotificationBell from "./NotificationBell";

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
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-brand/20">
              इ
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">इनाम</span>
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
                      ? "text-brand bg-brand/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
              className="hidden sm:inline-flex w-9 h-9 rounded-lg border border-border text-foreground/60 hover:text-foreground hover:bg-muted items-center justify-center transition-all"
              aria-label="Search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-9 h-9 rounded-lg border border-border text-foreground/60 hover:text-foreground hover:bg-muted flex items-center justify-center transition-all"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>

            <NotificationBell />

            <button
              onClick={() => setLocale(locale === "en" ? "ne" : "en")}
              className="hidden sm:inline-flex h-9 px-3 items-center text-xs font-medium text-foreground/60 hover:text-foreground border border-border rounded-lg hover:bg-muted transition-all"
            >
              {t("header.switchLanguage")}
            </button>

            <div className="hidden md:block">
              <WalletMultiButton />
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-9 h-9 rounded-lg border border-border text-foreground/60 hover:text-foreground hover:bg-muted flex items-center justify-center transition-all"
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
                        ? "text-brand bg-brand/10"
                        : "text-foreground/70 hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="w-6 text-center">{link.icon}</span>
                    {t(`nav.${link.key}`)}
                  </Link>
                );
              })}
              <div className="pt-2">
                <WalletMultiButton />
              </div>
            </div>
          </div>
        )}
      </header>
      <MobileNav />
    </>
  );
}
