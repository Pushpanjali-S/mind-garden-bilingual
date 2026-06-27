import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import type { Database } from "@/integrations/supabase/types";

type Body = {
  messages?: UIMessage[];
  thread_id?: string;
  lang?: "en" | "hi";
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return new Response("Unauthorized", { status: 401 });
        }
        const token = authHeader.slice(7);

        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
        const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
        if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
          return new Response("Server misconfigured", { status: 500 });
        }
        if (!LOVABLE_API_KEY) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
        });

        const { data: userData, error: userErr } = await supabase.auth.getUser(token);
        if (userErr || !userData.user) {
          return new Response("Unauthorized", { status: 401 });
        }
        const userId = userData.user.id;

        const body = (await request.json()) as Body;
        const incomingMessages = body.messages ?? [];
        const threadId = body.thread_id;
        const lang = body.lang === "hi" ? "hi" : "en";
        if (!threadId) return new Response("thread_id required", { status: 400 });

        // Verify thread ownership (RLS also enforces). Refresh title for autotitling.
        const { data: thread, error: threadErr } = await supabase
          .from("threads")
          .select("id,title")
          .eq("id", threadId)
          .maybeSingle();
        if (threadErr || !thread) {
          return new Response("Thread not found", { status: 404 });
        }

        // Personalization context.
        const [{ data: profile }, { data: moods }] = await Promise.all([
          supabase
            .from("profiles")
            .select("display_name,exam_target")
            .eq("id", userId)
            .maybeSingle(),
          supabase
            .from("mood_logs")
            .select("score,note,created_at")
            .order("created_at", { ascending: false })
            .limit(7),
        ]);

        const moodLine =
          (moods ?? [])
            .map((m) => `${m.score}${m.note ? `(${m.note.slice(0, 40)})` : ""}`)
            .join(", ") || "no recent logs";

        const langInstruction =
          lang === "hi"
            ? "Respond primarily in Hindi (Devanagari script). Mirror the user's language if they switch."
            : "Respond in English. Mirror the user's language if they switch.";

        const system = `You are "Milestone", an empathetic AI wellness companion for Indian students preparing for high-stakes exams (NEET, JEE, CUET, CAT, GATE, UPSC, board exams).

USER CONTEXT
- Name: ${profile?.display_name ?? "the student"}
- Exam target: ${profile?.exam_target ?? "not specified"}
- Recent self-rated mood scores (newest first, 1=very low to 5=good): ${moodLine}
- ${langInstruction}

CORE BEHAVIOR
- Warm, validating, never dismissive. Use the user's name occasionally, not every line.
- Listen first. When the user is venting, ask ONE gentle question before offering advice.
- Surface hidden stress patterns from their context tentatively ("It sounds like...", "I might be wrong, but...").
- Offer concrete, low-friction coping: box breathing (4-4-4-4), 5-4-3-2-1 grounding, 5-minute walks, study Pomodoros, sleep hygiene. Pick ONE at a time.
- Reply in short, readable paragraphs (max ~120 words unless asked). Use markdown lightly: bold for key actions, short lists.
- You are NOT a therapist; do not diagnose. Encourage professional help when patterns persist.

SAFETY
- If the user mentions self-harm, suicidal thoughts, or being in danger: respond with empathy, then IMMEDIATELY share these helplines and urge them to call — iCall +91 9152987821, Vandrevala Foundation 1860-2662-345 (free, 24/7). Encourage reaching a trusted adult right away.
- Never give medication advice. Never minimize feelings.
- Never claim to be human.`;

        const gateway = createLovableAiGatewayProvider(LOVABLE_API_KEY);

        const result = streamText({
          model: gateway("google/gemini-2.5-flash"),
          system,
          messages: await convertToModelMessages(incomingMessages),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: incomingMessages,
          onFinish: async ({ messages: finalMessages }) => {
            try {
              const { count } = await supabase
                .from("messages")
                .select("*", { count: "exact", head: true })
                .eq("thread_id", threadId);
              const existingCount = count ?? 0;
              const toInsert = finalMessages.slice(existingCount).map((m) => ({
                thread_id: threadId,
                user_id: userId,
                role: m.role as "user" | "assistant" | "system",
                parts: m.parts as unknown as Database["public"]["Tables"]["messages"]["Insert"]["parts"],
              }));
              if (toInsert.length) {
                const { error } = await supabase.from("messages").insert(toInsert);
                if (error) console.error("[chat] persist error:", error.message);
              }
              await supabase
                .from("threads")
                .update({ updated_at: new Date().toISOString() })
                .eq("id", threadId);

              if (thread.title === "New conversation") {
                const firstUser = finalMessages.find((m) => m.role === "user");
                const txt =
                  firstUser?.parts
                    ?.map((p) => (p.type === "text" ? p.text : ""))
                    .join(" ")
                    .trim() ?? "";
                if (txt) {
                  await supabase
                    .from("threads")
                    .update({ title: txt.slice(0, 60) })
                    .eq("id", threadId);
                }
              }
            } catch (e) {
              console.error("[chat] onFinish error:", e);
            }
          },
        });
      },
    },
  },
});