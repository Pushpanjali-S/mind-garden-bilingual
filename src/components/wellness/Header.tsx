import { LanguageToggle } from "./LanguageToggle";
import { t, type Lang } from "./i18n";

type Props = { lang: Lang; onLangChange: (l: Lang) => void; name: string };

export function Header({ lang, onLangChange, name }: Props) {
  const dict = t[lang];
  const greeting = name.trim() ? dict.greet(name.trim()) : dict.welcome;
  return (
    <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-sm tracking-wide text-muted-foreground">{greeting}</p>
        <h1 className="mt-1 font-serif text-4xl font-medium leading-tight text-foreground sm:text-5xl">
          {dict.appName}
          <span className="ml-2 italic text-primary">{dict.appNameAccent}</span>
        </h1>
        <p className="mt-2 max-w-md text-base text-muted-foreground">{dict.tagline}</p>
      </div>
      <LanguageToggle lang={lang} onChange={onLangChange} />
    </header>
  );
}