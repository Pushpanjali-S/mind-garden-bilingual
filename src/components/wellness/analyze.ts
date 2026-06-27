import { triggerKeywords, type TriggerKey, type Lang, t } from "./i18n";

export type Context = { name: string; role: string; focus: string };

export type Analysis = {
  triggers: TriggerKey[];
  reassurance: string;
  coping: string;
  level: "low" | "mid" | "high";
};

export function analyze(text: string, ctx: Context, lang: Lang): Analysis {
  const lower = text.toLowerCase();
  const matched = (Object.keys(triggerKeywords) as TriggerKey[]).filter((k) =>
    triggerKeywords[k].some((kw) => lower.includes(kw.toLowerCase())),
  );

  const level: Analysis["level"] = matched.length >= 3 ? "high" : matched.length >= 1 ? "mid" : "low";
  const dict = t[lang];

  const name = ctx.name.trim();
  const role = ctx.role.trim();
  const focus = ctx.focus.trim();

  const reassurance =
    name && role && focus
      ? dict.reassuranceWithAll(name, role, focus)
      : name
      ? dict.reassuranceWithName(name)
      : dict.reassuranceGeneric;

  return {
    triggers: matched,
    reassurance,
    coping: dict.coping[level],
    level,
  };
}