import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyzeJournal, recentJournal } from "@/lib/journal.functions";
import { s } from "@/components/wellness/strings";
import type { Lang } from "@/components/wellness/i18n";
import { toast } from "sonner";

type Analysis = Awaited<ReturnType<typeof analyzeJournal>>;

export function JournalAnalyzer({ lang }: { lang: Lang }) {
  const t = s(lang);
  const [text, setText] = useState("");
  const [result, setResult] = useState<Analysis | null>(null);
  const qc = useQueryClient();

  const m = useMutation({
    mutationFn: () => analyzeJournal({ data: { content: text, lang } }),
    onSuccess: (r) => {
      setResult(r);
      toast.success(t.journal.saved);
      qc.invalidateQueries({ queryKey: ["journal"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const recentQ = useQuery({
    queryKey: ["journal"],
    queryFn: () => recentJournal(),
  });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 sm:px-8">
      <header>
        <h1 className="font-serif text-3xl">{t.journal.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.journal.sub}</p>
      </header>

      <section
        aria-label={t.journal.title}
        className="rounded-2xl border border-border/70 bg-card p-5 shadow-float"
      >
        <label htmlFor="journal" className="sr-only">
          {t.journal.title}
        </label>
        <Textarea
          id="journal"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.journal.placeholder}
          rows={10}
          className="min-h-[200px] resize-none rounded-xl bg-background text-base leading-relaxed"
          maxLength={8000}
        />
        <div className="mt-3 flex justify-end">
          <Button
            type="button"
            onClick={() => m.mutate()}
            disabled={!text.trim() || m.isPending}
          >
            {m.isPending ? t.journal.analyzing : t.journal.analyze}
          </Button>
        </div>
      </section>

      {result && (
        <section
          aria-live="polite"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <Card
            title={t.journal.triggers}
            body={
              <div className="flex flex-wrap gap-2">
                {result.triggers.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            }
          />
          <Card title={t.journal.reassurance} body={<p>{result.reassurance}</p>} />
          <Card title={t.journal.coping} body={<p>{result.coping}</p>} />
          <div className="rounded-2xl border border-border/70 bg-card p-4 text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
            {t.journal.moodScore}:{" "}
            <span className="font-medium text-foreground">
              {t.moodLabels[result.mood_score - 1]}
            </span>
          </div>
        </section>
      )}

      {recentQ.data && recentQ.data.length > 0 && (
        <section aria-labelledby="recent-entries">
          <h2 id="recent-entries" className="font-serif text-xl">
            {t.dashboard.recentEntries}
          </h2>
          <ul className="mt-3 space-y-3">
            {recentQ.data.map((row) => (
              <li
                key={row.id}
                className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-float"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <time dateTime={row.created_at}>
                    {new Date(row.created_at).toLocaleString()}
                  </time>
                  {typeof row.ai_mood_score === "number" && (
                    <span>{t.moodLabels[row.ai_mood_score - 1]}</span>
                  )}
                </div>
                <p className="mt-2 line-clamp-3 text-sm">{row.content}</p>
                {Array.isArray(row.ai_triggers) && row.ai_triggers.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(row.ai_triggers as string[]).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-accent/70 px-2 py-0.5 text-[11px]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Card({ title, body }: { title: string; body: React.ReactNode }) {
  return (
    <article className="rounded-2xl border border-border/70 bg-card p-4 shadow-float">
      <h3 className="font-serif text-base">{title}</h3>
      <div className="mt-2 text-sm leading-relaxed text-foreground/90">{body}</div>
    </article>
  );
}