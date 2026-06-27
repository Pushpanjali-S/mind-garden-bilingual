import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Header } from "@/components/wellness/Header";
import { ContextPanel } from "@/components/wellness/ContextPanel";
import { JournalInput } from "@/components/wellness/JournalInput";
import { ReflectionDashboard } from "@/components/wellness/ReflectionDashboard";
import { Footer } from "@/components/wellness/Footer";
import { analyze, type Analysis, type Context } from "@/components/wellness/analyze";
import type { Lang } from "@/components/wellness/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Milestone: AI Wellness — a quiet space to reflect" },
      {
        name: "description",
        content:
          "A calm bilingual journaling space. Write freely and receive a gentle, on-device reflection in English or Hindi.",
      },
      { property: "og:title", content: "Milestone: AI Wellness" },
      {
        property: "og:description",
        content: "A calm bilingual journaling space — reflect in English or Hindi.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [lang, setLang] = useState<Lang>("en");
  const [context, setContext] = useState<Context>({ name: "", role: "", focus: "" });
  const [journal, setJournal] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = () => {
    setLoading(true);
    setAnalysis(null);
    window.setTimeout(() => {
      const result = analyze(journal, context, lang);
      setAnalysis(result);
      setLoading(false);
      window.requestAnimationFrame(() => {
        dashboardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }, 1200);
  };

  const currentAnalysis = analysis ? analyze(journal, context, lang) : null;

  return (
    <div className="min-h-dvh bg-background">
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-5 py-10 sm:px-8 sm:py-16">
        <Header lang={lang} onLangChange={setLang} name={context.name} />
        <ContextPanel lang={lang} value={context} onChange={setContext} />
        <JournalInput
          lang={lang}
          value={journal}
          onChange={setJournal}
          onAnalyze={handleAnalyze}
          loading={loading}
        />
        <div ref={dashboardRef}>
          {currentAnalysis && <ReflectionDashboard lang={lang} analysis={currentAnalysis} />}
        </div>
        <Footer lang={lang} />
      </main>
    </div>
  );
}
