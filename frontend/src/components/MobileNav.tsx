"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, PlusCircle, Trophy, Layout } from "@phosphor-icons/react";
import { useTranslation } from "@/lib/i18n";

const items = [
  { href: "/", key: "browse", icon: Compass },
  { href: "/create", key: "create", icon: PlusCircle },
  { href: "/leaderboard", key: "leaderboard", icon: Trophy },
  { href: "/dashboard", key: "dashboard", icon: Layout },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border flex items-center justify-around h-14 safe-area-bottom">
      {items.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-0.5 px-4 py-1.5 rounded-lg transition-all ${
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={20} weight={active ? "fill" : "regular"} />
            <span className="text-[10px] font-medium">{t(`nav.${item.key}`)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
