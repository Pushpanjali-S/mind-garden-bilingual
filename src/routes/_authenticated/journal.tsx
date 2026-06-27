import { createFileRoute } from "@tanstack/react-router";
import { JournalAnalyzer } from "@/components/wellness/JournalAnalyzer";
import { useLang } from "@/hooks/use-lang";

export const Route = createFileRoute("/_authenticated/journal")({
  component: JournalPage,
});

function JournalPage() {
  const [lang] = useLang();
  return <JournalAnalyzer lang={lang} />;
}