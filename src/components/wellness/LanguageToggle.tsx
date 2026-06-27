import type { Lang } from "./i18n";
import { t } from "./i18n";

type Props = { lang: Lang; onChange: (l: Lang) => void };

export function LanguageToggle({ lang, onChange }: Props) {
  const dict = t[lang];
  return (
    <div
      role="group"
      aria-label={dict.langToggleLabel}
      className="inline-flex items-center gap-1 rounded-full border border-border bg-card/70 p-1 backdrop-blur-sm shadow-float"
    >
      {(["en", "hi"] as const).map((code) => {
        const active = lang === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => onChange(code)}
            aria-pressed={active}
            className={`min-h-11 min-w-11 rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {code === "en" ? dict.english : dict.hindi}
          </button>
        );
      })}
    </div>
  );
}