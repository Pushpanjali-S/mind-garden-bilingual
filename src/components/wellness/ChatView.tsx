import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { s } from "@/components/wellness/strings";
import type { Lang } from "@/components/wellness/i18n";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export function ChatView({
  threadId,
  initialMessages,
  lang,
}: {
  threadId: string;
  initialMessages: UIMessage[];
  lang: Lang;
}) {
  const t = s(lang);
  const langRef = useRef(lang);
  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        fetch: async (input, init) => {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          const headers = new Headers(init?.headers);
          if (token) headers.set("Authorization", `Bearer ${token}`);
          return fetch(input as RequestInfo, { ...init, headers });
        },
        prepareSendMessagesRequest: ({ messages, id }) => ({
          body: { messages, thread_id: id, lang: langRef.current },
        }),
      }),
    [],
  );

  const { messages, sendMessage, status, stop, error } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
  });

  const [input, setInput] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || status === "submitted" || status === "streaming") return;
    sendMessage({ text });
    setInput("");
  };

  return (
    <div className="flex h-[calc(100dvh-7rem)] flex-col md:h-[calc(100dvh-3rem)]">
      <div
        ref={scrollerRef}
        className="flex-1 overflow-y-auto px-4 py-6 sm:px-8"
        aria-live="polite"
        aria-busy={status === "streaming" || status === "submitted"}
      >
        {messages.length === 0 && (
          <div className="mx-auto max-w-2xl rounded-2xl border border-border/60 bg-card/70 p-6 text-center text-muted-foreground shadow-float">
            <p className="font-serif text-lg text-foreground">{t.chat.title}</p>
            <p className="mt-2 text-sm">{t.chat.empty}</p>
          </div>
        )}
        <ul className="mx-auto flex max-w-2xl flex-col gap-4">
          {messages.map((m) => (
            <li
              key={m.id}
              className={cn(
                "flex",
                m.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-float",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-card-foreground",
                )}
              >
                {m.parts.map((p, i) =>
                  p.type === "text" ? (
                    <div
                      key={i}
                      className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-headings:font-serif dark:prose-invert"
                    >
                      <ReactMarkdown>{p.text}</ReactMarkdown>
                    </div>
                  ) : null,
                )}
              </div>
            </li>
          ))}
          {(status === "submitted" || status === "streaming") &&
            messages[messages.length - 1]?.role !== "assistant" && (
              <li className="flex justify-start">
                <div className="rounded-2xl bg-card px-4 py-3 text-sm text-muted-foreground shadow-float">
                  {t.chat.thinking}
                </div>
              </li>
            )}
          {error && (
            <li
              role="alert"
              className="rounded-xl border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {error.message}
            </li>
          )}
        </ul>
      </div>

      <form
        onSubmit={submit}
        className="border-t border-border/70 bg-card/60 p-3 backdrop-blur sm:p-4"
      >
        <div className="mx-auto flex max-w-2xl items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder={t.chat.placeholder}
            aria-label={t.chat.placeholder}
            className="max-h-40 min-h-[44px] resize-none rounded-2xl bg-background"
          />
          {status === "streaming" || status === "submitted" ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => stop()}
              aria-label={t.chat.stop}
            >
              <Square className="size-4" aria-hidden />
            </Button>
          ) : (
            <Button type="submit" aria-label={t.chat.send} disabled={!input.trim()}>
              <Send className="size-4" aria-hidden />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}