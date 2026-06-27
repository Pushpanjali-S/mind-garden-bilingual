import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Lang } from "@/components/wellness/i18n";
import { cn } from "@/lib/utils";

type SR = any;

function getRecognition(): SR | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export function MicButton({
  lang,
  onTranscript,
  className,
}: {
  lang: Lang;
  onTranscript: (text: string) => void;
  className?: string;
}) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recRef = useRef<SR | null>(null);

  useEffect(() => {
    const r = getRecognition();
    if (!r) {
      setSupported(false);
      return;
    }
    r.continuous = false;
    r.interimResults = false;
    r.lang = lang === "hi" ? "hi-IN" : "en-IN";
    r.onresult = (e: any) => {
      const text = Array.from(e.results)
        .map((res: any) => res[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (text) onTranscript(text);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recRef.current = r;
    return () => {
      try {
        r.abort();
      } catch {
        /* noop */
      }
    };
  }, [lang, onTranscript]);

  if (!supported) return null;

  const label = listening
    ? lang === "hi"
      ? "सुनना बंद करें"
      : "Stop listening"
    : lang === "hi"
      ? "बोलकर लिखें"
      : "Speak to write";

  const toggle = () => {
    const r = recRef.current;
    if (!r) return;
    if (listening) {
      try {
        r.stop();
      } catch {
        /* noop */
      }
      setListening(false);
    } else {
      try {
        r.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    }
  };

  return (
    <Button
      type="button"
      variant={listening ? "default" : "secondary"}
      size="icon"
      onClick={toggle}
      aria-label={label}
      aria-pressed={listening}
      title={label}
      className={cn(
        "rounded-full",
        listening && "animate-pulse",
        className,
      )}
    >
      {listening ? (
        <MicOff className="size-4" aria-hidden />
      ) : (
        <Mic className="size-4" aria-hidden />
      )}
    </Button>
  );
}