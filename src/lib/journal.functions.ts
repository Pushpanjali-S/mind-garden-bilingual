import { createServerFn } from "@tanstack/react-start";
import { generateObject } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const ResultSchema = z.object({
  triggers: z.array(z.string()).min(1).max(5),
  reassurance: z.string(),
  coping: z.string(),
  mood_score: z.number().int().min(1).max(5),
});

export const analyzeJournal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        content: z.string().min(1).max(8000),
        lang: z.enum(["en", "hi"]).default("en"),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const [{ data: profile }, { data: moods }] = await Promise.all([
      context.supabase
        .from("profiles")
        .select("display_name,exam_target")
        .eq("id", context.userId)
        .maybeSingle(),
      context.supabase
        .from("mood_logs")
        .select("score,created_at")
        .order("created_at", { ascending: false })
        .limit(7),
    ]);

    const gateway = createLovableAiGatewayProvider(apiKey);
    const langName = data.lang === "hi" ? "Hindi (Devanagari script)" : "English";
    const system = `You analyze a student's journal entry and return STRICTLY the requested JSON.

You are an empathetic mental-wellness companion for Indian students preparing for high-stakes exams (NEET, JEE, CUET, CAT, GATE, UPSC, board exams).

Rules for the JSON output:
- triggers: 1-4 short, specific tags grounded in the actual entry text. No generic filler.
- reassurance: 1-2 warm, validating sentences in second person. Reference the student's name (${profile?.display_name ?? "the student"}) or exam target (${profile?.exam_target ?? "their exam"}) only if it lands naturally. Never dismissive.
- coping: ONE concrete actionable step in under 30 words. Adapt to the stress level you detect.
- mood_score: integer 1 (very low) to 5 (good) reflecting the entry's emotional tone.
- Write triggers, reassurance, and coping in ${langName}.
- CRISIS OVERRIDE: if the entry mentions self-harm, suicide, "ending it", or being in immediate danger, set triggers to ["Crisis"], and the coping must urgently encourage calling iCall +91 9152987821 or Vandrevala 1860-2662-345 right now and reaching a trusted adult.`;

    const moodLine = (moods ?? []).map((m) => m.score).join(", ") || "none";
    const prompt = `Recent self-rated mood scores (newest first, 1=low/5=good): ${moodLine}

Journal entry:
"""
${data.content}
"""`;

    const { object } = await generateObject({
      model: gateway("google/gemini-3-flash-preview"),
      schema: ResultSchema,
      system,
      prompt,
    });

    const { data: entry, error } = await context.supabase
      .from("journal_entries")
      .insert({
        user_id: context.userId,
        content: data.content,
        ai_triggers: object.triggers,
        ai_reassurance: object.reassurance,
        ai_coping: object.coping,
        ai_mood_score: object.mood_score,
      })
      .select("id,created_at")
      .single();
    if (error) throw new Error(error.message);

    return { ...object, id: entry.id, created_at: entry.created_at };
  });

export const recentJournal = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("journal_entries")
      .select("id,content,ai_triggers,ai_reassurance,ai_coping,ai_mood_score,created_at")
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) throw new Error(error.message);
    return data ?? [];
  });