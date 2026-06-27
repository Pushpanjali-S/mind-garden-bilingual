import { useEffect, useState, useCallback } from "react";
import type { Lang } from "@/components/wellness/i18n";

const KEY = "milestone:lang";

function readInitial(): Lang {
  if (typeof window === "undefined") return "en";
  const v = window.localStorage.getItem(KEY);
  return v === "hi" ? "hi" : "en";
}

export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    setLang(readInitial());
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && (e.newValue === "en" || e.newValue === "hi")) {
        setLang(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = useCallback((l: Lang) => {
    setLang(l);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(KEY, l);
    }
  }, []);

  return [lang, update];
}