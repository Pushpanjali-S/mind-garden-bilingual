import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLang } from "@/hooks/use-lang";
import { s } from "@/components/wellness/strings";
import { LanguageToggle } from "@/components/wellness/LanguageToggle";
import { getProfile, updateProfile } from "@/lib/profile.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [lang, setLang] = useLang();
  const t = s(lang);
  const qc = useQueryClient();

  const q = useQuery({ queryKey: ["profile"], queryFn: () => getProfile() });
  const [name, setName] = useState("");
  const [exam, setExam] = useState("");

  useEffect(() => {
    if (q.data) {
      setName(q.data.display_name ?? "");
      setExam(q.data.exam_target ?? "");
    }
  }, [q.data]);

  const m = useMutation({
    mutationFn: () =>
      updateProfile({
        data: {
          display_name: name || null,
          exam_target: exam || null,
          lang,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success(lang === "hi" ? "सहेज लिया।" : "Saved.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8 sm:px-8">
      <h1 className="font-serif text-3xl">{t.nav.settings}</h1>

      <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-float">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg">{lang === "hi" ? "भाषा" : "Language"}</h2>
          <LanguageToggle lang={lang} onChange={setLang} />
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-float">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            m.mutate();
          }}
          className="flex flex-col gap-4"
        >
          <div>
            <Label htmlFor="name">{t.displayName}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
            />
          </div>
          <div>
            <Label htmlFor="exam">{t.examTarget}</Label>
            <Input
              id="exam"
              value={exam}
              onChange={(e) => setExam(e.target.value)}
              maxLength={80}
              placeholder={t.examTargetPh}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={m.isPending}>
              {lang === "hi" ? "सहेजें" : "Save"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}