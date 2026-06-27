import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const logMood = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({ score: z.number().int().min(1).max(5), note: z.string().max(500).optional() })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("mood_logs")
      .insert({ user_id: context.userId, score: data.score, note: data.note ?? null });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const recentMoods = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("mood_logs")
      .select("id,score,note,created_at")
      .order("created_at", { ascending: false })
      .limit(14);
    if (error) throw new Error(error.message);
    return data ?? [];
  });