import type { ReactNode } from "react";

type Props = {
  index: number;
  title: string;
  children: ReactNode;
};

export function ReflectionCard({ index, title, children }: Props) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-sm shadow-float">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-accent font-serif text-sm text-accent-foreground"
        >
          {index}
        </span>
        <h3 className="font-serif text-lg font-medium text-foreground">{title}</h3>
      </div>
      <div className="text-[15px] leading-relaxed text-foreground/90">{children}</div>
    </article>
  );
}