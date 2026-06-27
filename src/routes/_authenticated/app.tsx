import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { MessageCircle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoodLogger } from "@/components/wellness/MoodLogger";
import { useLang } from "@/hooks/use-lang";
import { s } from "@/components/wellness/strings";
import { getProfile } from "@/lib/profile.functions";
import { createThread } from "@/lib/threads.functions";
import { recentJournal } from "@/lib/journal.functions";

export const Route = createFileRoute("/_authenticated/app")({
  component: AppHome,
});

function greeting(lang: "en" | "hi", name: string) {
  const t = s(lang).dashboard;
  const h = new Date().getHours();
  if (h < 12) return t.greetMorning(name);
  if (h < 18) return t.greetAfternoon(name);
  return t.greetEvening(name);
}

function AppHome() {
  const [lang] = useLang();
  const t = s(lang);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const profileQ = useQuery({ queryKey: ["profile"], queryFn: () => getProfile() });
  const journalQ = useQuery({ queryKey: ["journal"], queryFn: () => recentJournal() });
  const newChat = useMutation({
    mutationFn: () => createThread({ data: {} }),
    onSuccess: async (row) => {
      await qc.invalidateQueries({ queryKey: ["threads"] });
      navigate({ to: "/chat/$threadId", params: { threadId: row.id } });
    },
  });

  const name = profileQ.data?.display_name ?? "friend";

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-8">
      <header>
        <h1 className="font-serif text-3xl tracking-tight">{greeting(lang, name)}</h1>
        {profileQ.data?.exam_target && (
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === "hi" ? "लक्ष्य" : "Target"}: {profileQ.data.exam_target}
          </p>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <MoodLogger lang={lang} />

        <section
          aria-labelledby="quick"
          className="rounded-2xl border border-border/70 bg-card p-5 shadow-float"
        >
          <h2 id="quick" className="font-serif text-xl">
            {t.dashboard.quickActions}
          </h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              className="flex-1 gap-2"
              onClick={() => newChat.mutate()}
              disabled={newChat.isPending}
            >
              <MessageCircle className="size-4" aria-hidden />
              {t.dashboard.startChat}
            </Button>
            <Button asChild variant="secondary" className="flex-1 gap-2">
              <Link to="/journal">
                <BookOpen className="size-4" aria-hidden />
                {t.dashboard.openJournal}
              </Link>
            </Button>
          </div>
        </section>
      </div>

      <section aria-labelledby="entries">
        <h2 id="entries" className="font-serif text-xl">
          {t.dashboard.recentEntries}
        </h2>
        {journalQ.data && journalQ.data.length === 0 && (
          <p className="mt-2 text-sm text-muted-foreground">{t.dashboard.noEntries}</p>
        )}
        <ul className="mt-3 space-y-3">
          {journalQ.data?.slice(0, 5).map((row) => (
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
              <p className="mt-2 line-clamp-2 text-sm">{row.content}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}