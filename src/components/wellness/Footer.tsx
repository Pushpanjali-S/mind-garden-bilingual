import { t, type Lang } from "./i18n";

export function Footer({ lang }: { lang: Lang }) {
  return (
    <footer className="mt-4 rounded-2xl border border-border bg-card/50 p-5 text-center text-sm text-muted-foreground backdrop-blur-sm">
      {t[lang].footer}
    </footer>
  );
}