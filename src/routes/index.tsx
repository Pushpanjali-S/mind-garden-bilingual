import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageToggle } from "@/components/wellness/LanguageToggle";
import { CrisisFooter } from "@/components/wellness/CrisisFooter";
import { JournalAnalyzer } from "@/components/wellness/JournalAnalyzer";
import { MoodLogger } from "@/components/wellness/MoodLogger";
import { ChatView } from "@/components/wellness/ChatView";
import { useLang } from "@/hooks/use-lang";
import { s } from "@/components/wellness/strings";

const PROFILE_KEY = "milestone.profile.v1";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "MindGarden — a calm AI companion for exam season" },
      {
        name: "description",
        content:
          "An empathetic AI companion for Indian students preparing for NEET, JEE, CUET, CAT, GATE, UPSC and board exams. Journal, log moods, and chat in English or Hindi.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [lang, setLang] = useLang();
  const t = s(lang);
  const [name, setName] = useState("");
  const [exam, setExam] = useState("");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PROFILE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        setName(p.name ?? "");
        setExam(p.exam ?? "");
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify({ name, exam }));
  }, [name, exam]);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between px-5 py-4 sm:px-10">
        <span className="font-serif text-2xl tracking-tight">{t.appName}</span>
        <LanguageToggle lang={lang} onChange={setLang} />
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-10 sm:px-10">
        <section className="mb-8">
          <h1 className="font-serif text-3xl leading-tight tracking-tight sm:text-4xl">
            {t.tagline}
          </h1>
          <p className="mt-2 text-base text-foreground/80">{t.heroSub}</p>
        </section>

        <section
          aria-label={lang === "hi" ? "आपकी जानकारी" : "About you"}
          className="mb-6 rounded-2xl border border-border/70 bg-card p-5 shadow-float"
        >
          <h2 className="font-serif text-lg">
            {lang === "hi" ? "आपके बारे में (वैकल्पिक)" : "About you (optional)"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === "hi"
              ? "इन्हें भरने से एआई के जवाब और भी व्यक्तिगत बनते हैं। यह जानकारी केवल आपके ब्राउज़र में रहती है।"
              : "Adding these helps the AI personalize responses. Stored only in your browser."}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">{t.displayName}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="given-name"
                maxLength={60}
              />
            </div>
            <div>
              <Label htmlFor="exam">{t.examTarget}</Label>
              <Input
                id="exam"
                value={exam}
                onChange={(e) => setExam(e.target.value)}
                placeholder={t.examTargetPh}
                maxLength={80}
              />
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <JournalAnalyzer lang={lang} name={name || undefined} exam={exam || undefined} />
            <MoodLogger lang={lang} />
          </div>
          <ChatView lang={lang} name={name || undefined} exam={exam || undefined} />
        </div>
      </main>

      <CrisisFooter lang={lang} />
    </div>
  );
}
