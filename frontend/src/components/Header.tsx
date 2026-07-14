"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Compass, PlusCircle, Trophy, Layout, MagnifyingGlass, List, X, Sun, Moon } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "./MobileNav";
import NotificationBell from "./NotificationBell";

const WalletMultiButtonDynamic = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const navLinks = [
  { href: "/", key: "browse", icon: Compass },
  { href: "/create", key: "create", icon: PlusCircle },
  { href: "/leaderboard", key: "leaderboard", icon: Trophy },
  { href: "/dashboard", key: "dashboard", icon: Layout },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { t, locale, setLocale } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-lg font-bold tracking-tight text-foreground">gig</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    active
                      ? "text-foreground bg-muted"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon size={16} weight={active ? "fill" : "regular"} />
                  {t(`nav.${link.key}`)}
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
              className="hidden sm:inline-flex w-9 h-9 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted items-center justify-center transition-all"
              aria-label="Search"
            >
              <MagnifyingGlass size={16} />
            </button>
            <NotificationBell />

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hidden sm:inline-flex w-9 h-9 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted items-center justify-center transition-all"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button
              onClick={() => setLocale(locale === "en" ? "ne" : "en")}
              className="hidden sm:inline-flex h-9 px-3 items-center text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-all"
            >
              {t("header.switchLanguage")}
            </button>

            <div className="hidden md:block">
              <WalletMultiButtonDynamic />
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-9 h-9 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-all"
              aria-label="Menu"
            >
              {menuOpen ? <X size={18} /> : <List size={18} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? "text-foreground bg-muted"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon size={18} weight={active ? "fill" : "regular"} />
                    {t(`nav.${link.key}`)}
                  </Link>
                );
              })}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </button>
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
