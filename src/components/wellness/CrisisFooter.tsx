import { s } from "@/components/wellness/strings";
import type { Lang } from "@/components/wellness/i18n";

export function CrisisFooter({ lang }: { lang: Lang }) {
  return (
    <footer
      role="contentinfo"
      aria-label="Crisis helpline"
      className="mt-auto border-t border-border/70 bg-card/60 backdrop-blur px-4 py-3 text-center text-xs text-muted-foreground"
    >
      {s(lang).crisis}
    </footer>
  );
}