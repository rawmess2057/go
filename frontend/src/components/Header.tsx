"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useTranslation } from "@/lib/i18n";

const navLinks = [
  { href: "/", key: "browse" },
  { href: "/create", key: "create" },
  { href: "/dashboard", key: "dashboard" },
];

export default function Header() {
  const pathname = usePathname();
  const { t, locale, setLocale } = useTranslation();

  return (
    <header className="bg-brand sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm">
            इ
          </div>
          <span className="text-lg font-bold tracking-tight text-white">इनाम</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "text-white font-semibold"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {t(`nav.${link.key}`)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocale(locale === "en" ? "ne" : "en")}
            className="text-xs font-medium text-white/80 hover:text-white transition-colors px-2 py-1 rounded border border-white/20 hover:border-white/40"
          >
            {t("header.switchLanguage")}
          </button>
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
}
