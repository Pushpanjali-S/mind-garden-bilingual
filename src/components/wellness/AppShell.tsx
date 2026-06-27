import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Home, MessageCircle, BookOpen, Settings, LogOut, Plus, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/wellness/LanguageToggle";
import { CrisisFooter } from "@/components/wellness/CrisisFooter";
import { useLang } from "@/hooks/use-lang";
import { s } from "@/components/wellness/strings";
import { supabase } from "@/integrations/supabase/client";
import { listThreads, createThread } from "@/lib/threads.functions";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const [lang, setLang] = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // close sidebar on navigation (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const threadsQ = useQuery({
    queryKey: ["threads"],
    queryFn: () => listThreads(),
  });

  const newChatM = useMutation({
    mutationFn: () => createThread({ data: {} }),
    onSuccess: async (row) => {
      await qc.invalidateQueries({ queryKey: ["threads"] });
      navigate({ to: "/chat/$threadId", params: { threadId: row.id } });
    },
  });

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const t = s(lang);
  const nav = [
    { to: "/app", label: t.nav.home, icon: Home },
    { to: "/journal", label: t.nav.journal, icon: BookOpen },
    { to: "/settings", label: t.nav.settings, icon: Settings },
  ] as const;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b border-border/70 bg-card/60 px-4 py-3 backdrop-blur md:hidden">
        <button
          type="button"
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          aria-expanded={sidebarOpen}
          onClick={() => setSidebarOpen((v) => !v)}
          className="rounded-lg p-2 hover:bg-accent"
        >
          {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        <span className="font-serif text-lg">{t.appName}</span>
        <LanguageToggle lang={lang} onChange={setLang} />
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          aria-label="Primary navigation"
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border/70 bg-card/80 backdrop-blur transition-transform md:static md:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          )}
        >
          <div className="hidden items-center justify-between border-b border-border/70 px-5 py-4 md:flex">
            <Link to="/app" className="font-serif text-xl tracking-tight">
              {t.appName}
            </Link>
            <LanguageToggle lang={lang} onChange={setLang} />
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Sections">
            <ul className="space-y-1">
              {nav.map((item) => {
                const active =
                  location.pathname === item.to ||
                  (item.to !== "/app" && location.pathname.startsWith(item.to));
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground/80 hover:bg-accent/60",
                      )}
                    >
                      <Icon className="size-4" aria-hidden />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 flex items-center justify-between px-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t.nav.conversations}
              </span>
              <button
                type="button"
                aria-label={t.nav.newChat}
                onClick={() => newChatM.mutate()}
                disabled={newChatM.isPending}
                className="rounded-md p-1 hover:bg-accent"
              >
                <Plus className="size-4" aria-hidden />
              </button>
            </div>
            <ul className="mt-2 space-y-1">
              {threadsQ.data?.length === 0 && (
                <li className="px-3 py-2 text-xs text-muted-foreground">—</li>
              )}
              {threadsQ.data?.map((thr) => {
                const active = location.pathname === `/chat/${thr.id}`;
                return (
                  <li key={thr.id}>
                    <Link
                      to="/chat/$threadId"
                      params={{ threadId: thr.id }}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2 truncate rounded-xl px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground/75 hover:bg-accent/60",
                      )}
                    >
                      <MessageCircle className="size-3.5 shrink-0" aria-hidden />
                      <span className="truncate">{thr.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-border/70 p-3">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={signOut}
            >
              <LogOut className="size-4" aria-hidden /> {t.signOut}
            </Button>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
        )}

        <main className="flex-1">{children}</main>
      </div>

      <CrisisFooter lang={lang} />
    </div>
  );
}