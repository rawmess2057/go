"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import en from "../../messages/en.json";
import ne from "../../messages/ne.json";

const messages: Record<string, Record<string, any>> = { en, ne };
const STORAGE_KEY = "gig-locale";

type Locale = "en" | "ne";

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType>(null!);

function resolve(obj: any, path: string): any {
  return path.split(".").reduce((o, key) => o?.[key], obj);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "ne" || stored === "en") setLocaleState(stored);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = useCallback(
    (path: string, params?: Record<string, string | number>): string => {
      let val = resolve(messages[locale], path);
      if (val === undefined) {
        val = resolve(messages.en, path);
      }
      if (val === undefined) return path;
      if (typeof val === "string" && params) {
        return Object.entries(params).reduce(
          (s, [k, v]) => s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v)),
          val
        );
      }
      return val;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
