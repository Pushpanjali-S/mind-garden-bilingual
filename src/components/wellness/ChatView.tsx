import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { s } from "@/components/wellness/strings";
import type { Lang } from "@/components/wellness/i18n";
import { cn } from "@/lib/utils";

export function ChatView({
  lang,
  name,
  exam,
}: {
  lang: Lang;
  name?: string;
  exam?: string;
}) {
  const t = s(lang);
  const langRef = useRef(lang);
  const nameRef = useRef(name);
  const examRef = useRef(exam);
  useEffect(() => {
    langRef.current = lang;
    nameRef.current = name;
    examRef.current = exam;
  }, [lang, name, exam]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages }) => ({
          body: {
            messages,
            lang: langRef.current,
            name: nameRef.current,
            exam: examRef.current,
          },
        }),
      }),
    [],
  );

  const { messages, sendMessage, status, stop, error } = useChat({ transport });

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
    <section
      aria-label={t.chat.title}
      className="flex h-[520px] flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-float"
    >
      <header className="border-b border-border/60 px-5 py-3">
        <h2 className="font-serif text-xl">{t.chat.title}</h2>
      </header>
      <div
        ref={scrollerRef}
        className="flex-1 overflow-y-auto px-4 py-5"
        aria-live="polite"
        aria-busy={status === "streaming" || status === "submitted"}
      >
        {messages.length === 0 && (
          <p className="mx-auto max-w-md text-center text-sm text-muted-foreground">
            {t.chat.empty}
          </p>
        )}
        <ul className="flex flex-col gap-3">
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
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-foreground",
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
                <div className="rounded-2xl bg-background px-4 py-3 text-sm text-muted-foreground">
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
        className="border-t border-border/60 bg-card/60 p-3 backdrop-blur"
      >
        <div className="flex items-end gap-2">
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
    </section>
  );
}
