import { useId } from "react";
import { t, type Lang } from "./i18n";

type Props = {
  lang: Lang;
  value: string;
  onChange: (v: string) => void;
  onAnalyze: () => void;
  loading: boolean;
};

export function JournalInput({ lang, value, onChange, onAnalyze, loading }: Props) {
  const dict = t[lang];
  const id = useId();
  return (
    <section
      aria-labelledby={`${id}-label`}
      className="rounded-2xl border border-border bg-card p-6 shadow-float sm:p-8"
    >
      <label
        id={`${id}-label`}
        htmlFor={id}
        className="font-serif text-xl font-medium text-foreground"
      >
        {dict.journalLabel}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={dict.journalPh}
        rows={8}
        className="mt-4 w-full resize-y rounded-xl border border-input bg-background/40 p-4 text-base leading-relaxed text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <div className="mt-5 flex items-center justify-between gap-4">
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {loading ? dict.analyzing : "\u00A0"}
        </p>
        <button
          type="button"
          onClick={onAnalyze}
          disabled={loading}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-float transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {loading ? dict.analyzing : dict.analyze}
        </button>
      </div>
    </section>
  );
}