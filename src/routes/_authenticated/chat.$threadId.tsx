import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { UIMessage } from "ai";
import { ChatView } from "@/components/wellness/ChatView";
import { useLang } from "@/hooks/use-lang";
import { getThreadMessages } from "@/lib/threads.functions";

export const Route = createFileRoute("/_authenticated/chat/$threadId")({
  component: ChatPage,
});

function ChatPage() {
  const { threadId } = Route.useParams();
  const [lang] = useLang();

  const q = useQuery({
    queryKey: ["thread-messages", threadId],
    queryFn: () => getThreadMessages({ data: { threadId } }),
  });

  if (q.isPending) {
    return (
      <div className="p-8 text-sm text-muted-foreground" aria-busy>
        Loading…
      </div>
    );
  }
  if (q.error) {
    return (
      <div className="p-8 text-sm text-destructive" role="alert">
        {(q.error as Error).message}
      </div>
    );
  }

  const initialMessages: UIMessage[] = (q.data ?? []).map((row) => ({
    id: row.id,
    role: row.role as UIMessage["role"],
    parts: row.parts as unknown as UIMessage["parts"],
  }));

  return (
    <ChatView
      key={threadId}
      threadId={threadId}
      initialMessages={initialMessages}
      lang={lang}
    />
  );
}