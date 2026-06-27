import { t, type Lang } from "./i18n";
import type { Analysis } from "./analyze";
import { ReflectionCard } from "./ReflectionCard";

type Props = { lang: Lang; analysis: Analysis };

export function ReflectionDashboard({ lang, analysis }: Props) {
  const dict = t[lang];
  const tags = analysis.triggers.length
    ? analysis.triggers.map((k) => dict.triggers[k])
    : [dict.noTrigger];

  return (
    <section aria-label={dict.reflection} className="flex flex-col gap-5">
      <h2 className="font-serif text-2xl font-medium text-foreground">{dict.reflection}</h2>
      <div className="grid gap-5 md:grid-cols-3">
        <ReflectionCard index={1} title={dict.card1}>
          <ul className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground"
              >
                {tag}
              </li>
            ))}
          </ul>
        </ReflectionCard>
        <ReflectionCard index={2} title={dict.card2}>
          <p>{analysis.reassurance}</p>
        </ReflectionCard>
        <ReflectionCard index={3} title={dict.card3}>
          <p>{analysis.coping}</p>
        </ReflectionCard>
      </div>
    </section>
  );
}