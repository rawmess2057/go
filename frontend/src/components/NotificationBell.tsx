"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, FileDown, CheckCircle, Plus, Info } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

const typeIcons: Record<string, React.ReactNode> = {
  submission: <FileDown className="w-4 h-4" />,
  completed: <CheckCircle className="w-4 h-4" />,
  created: <Plus className="w-4 h-4" />,
  info: <Info className="w-4 h-4" />,
};

export default function NotificationBell() {
  const { items, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-brand rounded-full ring-2 ring-background" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-border bg-card shadow-xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="text-sm font-semibold">Notifications</span>
            <div className="flex gap-2 text-xs">
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-brand hover:underline">
                  Mark all read
                </button>
              )}
              <button onClick={clearAll} className="text-muted-foreground/60 hover:text-muted-foreground">
                Clear
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {items.length === 0 && (
              <p className="text-sm text-muted-foreground/60 text-center py-8">No notifications yet.</p>
            )}
            {items.map((n) => {
              const content = (
                <div
                  className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer ${
                    n.read ? "opacity-60" : "bg-brand/[0.02]"
                  } hover:bg-muted/30`}
                  onClick={() => {
                    markAsRead(n.id);
                    setOpen(false);
                  }}
                >
                  <span className="shrink-0 mt-0.5">{typeIcons[n.type] ?? <Info className="w-4 h-4" />}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{n.title}</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">{n.body}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-brand shrink-0 mt-1.5" />}
                </div>
              );

              return n.href ? (
                <Link key={n.id} href={n.href}>
                  {content}
                </Link>
              ) : (
                <div key={n.id}>{content}</div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
