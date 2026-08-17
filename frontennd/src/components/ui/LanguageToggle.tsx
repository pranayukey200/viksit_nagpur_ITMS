"use client";

import { useLanguageStore, type Language } from "@/lib/i18n";
import { Globe } from "lucide-react";

export function LanguageToggle() {
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  return (
    <div className="flex items-center rounded-md border border-slate-300/80 bg-slate-100/90 p-0.5 shadow-sm">
      <span className="pl-1.5 pr-1 text-slate-500">
        <Globe size={13} />
      </span>

      {(
        [
          { id: "en", label: "EN" },
          { id: "hi", label: "HI" },
          { id: "mr", label: "MR" },
        ] as { id: Language; label: string }[]
      ).map((item) => {
        const active = language === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setLanguage(item.id)}
            className={`rounded px-1.5 py-0.5 text-[0.68rem] font-black transition-all cursor-pointer ${
              active
                ? "bg-white text-ink shadow-sm ring-1 ring-slate-300"
                : "text-slate-500 hover:text-ink"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
