"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n";

const items = [
  { href: "/", key: "browse", icon: "⌂" },
  { href: "/create", key: "create", icon: "+" },
  { href: "/leaderboard", key: "leaderboard", icon: "⊠" },
  { href: "/dashboard", key: "dashboard", icon: "⊞" },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border flex items-center justify-around h-14 safe-area-bottom">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-0.5 px-4 py-1.5 rounded-lg transition-all ${
              active ? "text-brand" : "text-foreground/40 hover:text-foreground/70"
            }`}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="text-[10px] font-medium">{t(`nav.${item.key}`)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
