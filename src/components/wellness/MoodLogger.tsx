import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { logMood, recentMoods } from "@/lib/mood.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { s } from "@/components/wellness/strings";
import type { Lang } from "@/components/wellness/i18n";
import { toast } from "sonner";

export function MoodLogger({ lang }: { lang: Lang }) {
  const t = s(lang);
  const [score, setScore] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const qc = useQueryClient();

  const recentQ = useQuery({ queryKey: ["moods"], queryFn: () => recentMoods() });

  const m = useMutation({
    mutationFn: () => logMood({ data: { score: score!, note: note || undefined } }),
    onSuccess: () => {
      toast.success(t.dashboard.moodLogged);
      setScore(null);
      setNote("");
      qc.invalidateQueries({ queryKey: ["moods"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

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
        <Button
          type="button"
          onClick={() => m.mutate()}
          disabled={!score || m.isPending}
        >
          {t.dashboard.logMood}
        </Button>
      </div>

      {recentQ.data && recentQ.data.length > 0 && (
        <div className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t.dashboard.recentMoods}
          </h3>
          <div
            className="mt-2 flex items-end gap-1.5"
            role="img"
            aria-label="Recent mood trend"
          >
            {[...recentQ.data].reverse().map((row) => (
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