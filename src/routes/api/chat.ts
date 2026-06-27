import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

type Body = {
  messages?: UIMessage[];
  lang?: "en" | "hi";
  name?: string;
  exam?: string;
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
        if (!LOVABLE_API_KEY) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        const body = (await request.json()) as Body;
        const incoming = body.messages ?? [];
        const lang = body.lang === "hi" ? "hi" : "en";
        const name = (body.name ?? "").slice(0, 60).trim();
        const exam = (body.exam ?? "").slice(0, 80).trim();

        const langLine =
          lang === "hi"
            ? "Always reply in conversational Hindi using Devanagari script."
            : "Always reply in warm conversational English.";

        const system = `You are Milestone, an empathetic mental-wellness companion for Indian students preparing for high-stakes exams (NEET, JEE, CUET, CAT, GATE, UPSC, board exams).
${name ? `The student's name is ${name}.` : ""}${exam ? ` They are preparing for ${exam}.` : ""}

Style:
- Warm, validating, never preachy. Short paragraphs.
- Offer ONE concrete coping idea or mindfulness micro-exercise when stress is high.
- Never diagnose. Never moralize.
- CRISIS OVERRIDE: if they mention self-harm, suicide, or being in danger, gently encourage them to call iCall +91 9152987821 or Vandrevala 1860-2662-345 right now and reach a trusted adult.
${langLine}`;

        const gateway = createLovableAiGatewayProvider(LOVABLE_API_KEY);
        const result = streamText({
          model: gateway("google/gemini-2.5-flash"),
          system,
          messages: convertToModelMessages(incoming),
        });
        return result.toUIMessageStreamResponse();
      },
    },
  },
});
