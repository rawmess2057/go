"use client";

import { useState, useCallback, useEffect } from "react";

export interface Notification {
  id: string;
  type: "submission" | "completed" | "created" | "info";
  title: string;
  body: string;
  href?: string;
  read: boolean;
  time: number;
}

const STORAGE_KEY = "gig_notifications";

function load(): Notification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(items: Notification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function useNotifications() {
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    setItems(load());
  }, []);

  const addNotification = useCallback((n: Omit<Notification, "id" | "time" | "read">) => {
    setItems((prev) => {
      const next: Notification[] = [
        { ...n, id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`, time: Date.now(), read: false },
        ...prev,
      ].slice(0, 50);
      save(next);
      return next;
    });
  }, []);

  const markAsRead = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      save(next);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setItems((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      save(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
    save([]);
  }, []);

  const unreadCount = items.filter((n) => !n.read).length;

  return { items, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll };
}
