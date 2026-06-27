import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyzeJournal } from "@/lib/journal.functions";
import { s } from "@/components/wellness/strings";
import type { Lang } from "@/components/wellness/i18n";
import { toast } from "sonner";

type Analysis = Awaited<ReturnType<typeof analyzeJournal>>;

export function JournalAnalyzer({
  lang,
  name,
  exam,
}: {
  lang: Lang;
  name?: string;
  exam?: string;
}) {
  const t = s(lang);
  const [text, setText] = useState("");
  const [result, setResult] = useState<Analysis | null>(null);

  const m = useMutation({
    mutationFn: () =>
      analyzeJournal({ data: { content: text, lang, name, exam } }),
    onSuccess: (r) => {
      setResult(r);
      toast.success(t.journal.saved);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section
      aria-label={t.journal.title}
      className="rounded-2xl border border-border/70 bg-card p-5 shadow-float"
    >
      <h2 className="font-serif text-xl">{t.journal.title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{t.journal.sub}</p>

      <label htmlFor="journal" className="sr-only">
        {t.journal.title}
      </label>
      <Textarea
        id="journal"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t.journal.placeholder}
        rows={8}
        className="mt-4 min-h-[180px] resize-none rounded-xl bg-background text-base leading-relaxed"
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

      {result && (
        <div
          aria-live="polite"
          className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
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
        </div>
      )}
    </section>
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
