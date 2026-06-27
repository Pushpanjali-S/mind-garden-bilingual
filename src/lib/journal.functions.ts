import { createServerFn } from "@tanstack/react-start";
import { generateObject } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const ResultSchema = z.object({
  triggers: z.array(z.string()).min(1).max(5),
  reassurance: z.string(),
  coping: z.string(),
  mood_score: z.number().int().min(1).max(5),
});

export const analyzeJournal = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        content: z.string().min(1).max(8000),
        lang: z.enum(["en", "hi"]).default("en"),
        name: z.string().max(60).optional(),
        exam: z.string().max(80).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(apiKey);
    const langName = data.lang === "hi" ? "Hindi (Devanagari script)" : "English";
    const system = `You analyze a student's journal entry and return STRICTLY the requested JSON.

You are an empathetic mental-wellness companion for Indian students preparing for high-stakes exams (NEET, JEE, CUET, CAT, GATE, UPSC, board exams).

Rules for the JSON output:
- triggers: 1-4 short, specific tags grounded in the actual entry text. No generic filler.
- reassurance: 1-2 warm, validating sentences in second person. Reference the student's name (${data.name ?? "the student"}) or exam target (${data.exam ?? "their exam"}) only if it lands naturally. Never dismissive.
- coping: ONE concrete actionable step in under 30 words. Adapt to the stress level you detect.
- mood_score: integer 1 (very low) to 5 (good) reflecting the entry's emotional tone.
- Write triggers, reassurance, and coping in ${langName}.
- CRISIS OVERRIDE: if the entry mentions self-harm, suicide, "ending it", or being in immediate danger, set triggers to ["Crisis"], and the coping must urgently encourage calling iCall +91 9152987821 or Vandrevala 1860-2662-345 right now and reaching a trusted adult.`;

    const prompt = `Journal entry:
"""
${data.content}
"""`;

    const { object } = await generateObject({
      model: gateway("google/gemini-2.5-flash"),
      schema: ResultSchema,
      system,
      prompt,
    });

    return object;
  });