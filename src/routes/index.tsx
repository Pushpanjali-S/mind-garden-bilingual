import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageToggle } from "@/components/wellness/LanguageToggle";
import { CrisisFooter } from "@/components/wellness/CrisisFooter";
import { useLang } from "@/hooks/use-lang";
import { s } from "@/components/wellness/strings";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Milestone: AI Wellness — a calm AI companion for exam season" },
      {
        name: "description",
        content:
          "An empathetic AI companion for Indian students preparing for NEET, JEE, CUET, CAT, GATE, UPSC and board exams. Journal, log moods, and chat in English or Hindi.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [lang, setLang] = useLang();
  const t = s(lang);
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [exam, setExam] = useState("");
  const [busy, setBusy] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setHasSession(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setHasSession(!!session);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: name } },
        });
        if (error) throw error;
        if (data.session && name) {
          // store extra fields on profile
          await supabase
            .from("profiles")
            .update({ display_name: name, exam_target: exam || null })
            .eq("id", data.user!.id);
        }
        toast.success(lang === "hi" ? "स्वागत है!" : "Welcome!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/app" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google");
    if (result.error) toast.error(result.error.message);
    setBusy(false);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between px-5 py-4 sm:px-10">
        <span className="font-serif text-2xl tracking-tight">{t.appName}</span>
        <LanguageToggle lang={lang} onChange={setLang} />
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-5 py-8 sm:px-10 lg:grid-cols-2">
        <section aria-labelledby="hero" className="flex flex-col gap-5">
          <h1
            id="hero"
            className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl"
          >
            {t.tagline}
          </h1>
          <p className="text-base text-foreground/80 sm:text-lg">{t.heroSub}</p>
          <ul className="mt-2 space-y-2 text-sm text-foreground/80">
            <li className="flex gap-2">
              <span aria-hidden>🌿</span>
              {lang === "hi"
                ? "खुलकर लिखें — एआई छिपे हुए तनाव-ट्रिगर खोजता है।"
                : "Journal openly — AI surfaces hidden stress triggers."}
            </li>
            <li className="flex gap-2">
              <span aria-hidden>💬</span>
              {lang === "hi"
                ? "किसी भी समय सहानुभूतिपूर्ण साथी से बात करें।"
                : "Talk to an empathetic companion anytime."}
            </li>
            <li className="flex gap-2">
              <span aria-hidden>📈</span>
              {lang === "hi"
                ? "अपने मूड पैटर्न को धीरे से देखें।"
                : "Notice your mood patterns gently."}
            </li>
          </ul>
        </section>

        <section
          aria-label={mode === "signin" ? t.signIn : t.signUp}
          className="w-full max-w-md justify-self-center rounded-2xl border border-border/70 bg-card p-6 shadow-float sm:p-8"
        >
          {hasSession ? (
            <div className="flex flex-col gap-4 text-center">
              <p className="font-serif text-xl">
                {lang === "hi" ? "आप साइन इन हैं।" : "You're signed in."}
              </p>
              <Button asChild>
                <Link to="/app">
                  {lang === "hi" ? "ऐप खोलें" : "Open the app"}
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <h2 className="font-serif text-2xl">
                {mode === "signin" ? t.signIn : t.signUp}
              </h2>
              <Button
                type="button"
                variant="secondary"
                className="mt-5 w-full"
                onClick={google}
                disabled={busy}
              >
                {t.continueGoogle}
              </Button>
              <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> {t.orDivider}{" "}
                <span className="h-px flex-1 bg-border" />
              </div>
              <form onSubmit={submit} className="flex flex-col gap-3">
                {mode === "signup" && (
                  <>
                    <div>
                      <Label htmlFor="name">{t.displayName}</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="exam">{t.examTarget}</Label>
                      <Input
                        id="exam"
                        value={exam}
                        onChange={(e) => setExam(e.target.value)}
                        placeholder={t.examTargetPh}
                      />
                    </div>
                  </>
                )}
                <div>
                  <Label htmlFor="email">{t.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">{t.password}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={
                      mode === "signin" ? "current-password" : "new-password"
                    }
                    minLength={6}
                    required
                  />
                </div>
                <Button type="submit" disabled={busy} className="mt-2">
                  {mode === "signin" ? t.signIn : t.signUp}
                </Button>
              </form>
              <button
                type="button"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="mt-4 w-full text-center text-xs text-muted-foreground underline-offset-2 hover:underline"
              >
                {mode === "signin" ? t.noAccount : t.haveAccount}
              </button>
            </>
          )}
        </section>
      </main>

      <CrisisFooter lang={lang} />
    </div>
  );
}
