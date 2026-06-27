import { useId, useState } from "react";
import { t, type Lang } from "./i18n";
import type { Context } from "./analyze";

type Props = {
  lang: Lang;
  value: Context;
  onChange: (c: Context) => void;
};

export function ContextPanel({ lang, value, onChange }: Props) {
  const dict = t[lang];
  const [open, setOpen] = useState(false);
  const nameId = useId();
  const roleId = useId();
  const focusId = useId();

  return (
    <section
      aria-labelledby={`${nameId}-title`}
      className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-sm shadow-float"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 id={`${nameId}-title`} className="font-serif text-lg font-medium text-foreground">
            {dict.contextTitle}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{dict.contextHint}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="min-h-11 shrink-0 rounded-full border border-border bg-background/60 px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {open ? dict.hideContext : dict.showContext}
        </button>
      </div>

      {open && (
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            { id: nameId, label: dict.name, ph: dict.namePh, key: "name" as const },
            { id: roleId, label: dict.role, ph: dict.rolePh, key: "role" as const },
            { id: focusId, label: dict.focus, ph: dict.focusPh, key: "focus" as const },
          ].map((f) => (
            <div key={f.key} className="flex flex-col gap-1.5">
              <label htmlFor={f.id} className="text-sm font-medium text-foreground">
                {f.label}
              </label>
              <input
                id={f.id}
                type="text"
                value={value[f.key]}
                onChange={(e) => onChange({ ...value, [f.key]: e.target.value })}
                placeholder={f.ph}
                className="min-h-11 rounded-xl border border-input bg-background/70 px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}