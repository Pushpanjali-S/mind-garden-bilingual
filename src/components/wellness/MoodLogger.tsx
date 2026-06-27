import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { s } from "@/components/wellness/strings";
import type { Lang } from "@/components/wellness/i18n";
import { toast } from "sonner";

type MoodEntry = { id: string; score: number; note?: string; created_at: string };

const STORAGE_KEY = "milestone.moods.v1";

function load(): MoodEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function MoodLogger({ lang }: { lang: Lang }) {
  const t = s(lang);
  const [score, setScore] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [moods, setMoods] = useState<MoodEntry[]>([]);

  useEffect(() => {
    setMoods(load());
  }, []);

  const save = () => {
    if (!score) return;
    const entry: MoodEntry = {
      id: crypto.randomUUID(),
      score,
      note: note || undefined,
      created_at: new Date().toISOString(),
    };
    const next = [entry, ...moods].slice(0, 30);
    setMoods(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setScore(null);
    setNote("");
    toast.success(t.dashboard.moodLogged);
  };

  return (
    <section
      aria-labelledby="mood-title"
      className="rounded-2xl border border-border/70 bg-card p-5 shadow-float"
    >
      <h2 id="mood-title" className="font-serif text-xl">
        {t.dashboard.moodTitle}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{t.dashboard.moodHint}</p>

      <div
        role="radiogroup"
        aria-label={t.dashboard.moodTitle}
        className="mt-4 grid grid-cols-5 gap-2"
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const selected = score === n;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={t.moodLabels[n - 1]}
              onClick={() => setScore(n)}
              className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-sm transition ${
                selected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/60 hover:bg-accent/50"
              }`}
            >
              <span className="text-xl" aria-hidden>
                {["😔", "😕", "😐", "🙂", "😊"][n - 1]}
              </span>
              <span className="text-[11px] leading-tight">{t.moodLabels[n - 1]}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t.dashboard.moodNotePh}
          aria-label={t.dashboard.moodNotePh}
          maxLength={200}
        />
        <Button type="button" onClick={save} disabled={!score}>
          {t.dashboard.logMood}
        </Button>
      </div>

      {moods.length > 0 && (
        <div className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t.dashboard.recentMoods}
          </h3>
          <div
            className="mt-2 flex items-end gap-1.5"
            role="img"
            aria-label="Recent mood trend"
          >
            {[...moods].slice(0, 14).reverse().map((row) => (
              <div
                key={row.id}
                title={`${t.moodLabels[row.score - 1]} — ${new Date(row.created_at).toLocaleString()}`}
                className="flex-1 rounded-t-md bg-primary/70"
                style={{ height: `${row.score * 12}px` }}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
