"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Check, Sparkles } from "lucide-react";
import { TrafficDiamondSignLogo } from "@/components/brand";
import { useLanguageStore, type Language } from "@/lib/i18n";

export function LanguageSelectorModal() {
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Language>("en");

  useEffect(() => {
    // Check if prompted before
    const storedLang = localStorage.getItem("suraksha_netra_lang") as Language | null;
    const hasPrompted = localStorage.getItem("suraksha_netra_lang_prompted");

    if (storedLang && ["en", "hi", "mr"].includes(storedLang)) {
      setLanguage(storedLang);
    }

    if (!hasPrompted) {
      // Delay slightly after the 2-second splash screen finishes
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [setLanguage]);

  const handleConfirm = () => {
    setLanguage(selected);
    setIsOpen(false);
  };

  const handleSelectDirect = (lang: Language) => {
    setSelected(lang);
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9995] flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#070b14]/75 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-lg border border-slate-700/80 bg-[#0e1626] p-5 text-white shadow-2xl sm:p-6"
          >
            {/* Header with Traffic Diamond Sign Logo */}
            <div className="text-center">
              <div className="mx-auto mb-3 grid place-items-center">
                <TrafficDiamondSignLogo size={52} animated />
              </div>

              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="font-sans text-xl font-black text-[#10b981]">SURAKSHA</span>
                <span className="font-sans text-2xl font-black text-[#ef4444]">नेत्र</span>
              </div>

              <h3 className="m-0 text-base font-bold text-slate-100">
                Select Your Preferred Language
              </h3>
              <p className="m-0 mt-1 text-xs text-slate-400">
                आपली पसंतीची भाषा निवडा / अपनी पसंदीदा भाषा चुनें
              </p>
            </div>

            {/* Language Options Grid */}
            <div className="mt-5 space-y-2.5">
              {[
                {
                  id: "en" as Language,
                  label: "English",
                  sub: "English (Default Interface)",
                  flag: "🇬🇧",
                  accent: "border-emerald-500/60 bg-emerald-500/10",
                },
                {
                  id: "hi" as Language,
                  label: "हिंदी (Hindi)",
                  sub: "नागपुर ट्रैफिक कंट्रोल व लाइव वेदर",
                  flag: "🇮🇳",
                  accent: "border-amber-500/60 bg-amber-500/10",
                },
                {
                  id: "mr" as Language,
                  label: "मराठी (Marathi)",
                  sub: "नागपूर वाहतूक नियंत्रण व निर्णय प्रणाली",
                  flag: "🚩",
                  accent: "border-orange-500/60 bg-orange-500/10",
                },
              ].map((item) => {
                const isCurrent = selected === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectDirect(item.id)}
                    className={`flex w-full items-center justify-between rounded-md border p-3 text-left transition-all cursor-pointer ${
                      isCurrent
                        ? `${item.accent} ring-1 ring-white/20 shadow-lg`
                        : "border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.flag}</span>
                      <div>
                        <p className="m-0 text-sm font-black text-white">{item.label}</p>
                        <p className="m-0 text-[0.68rem] text-slate-400 font-semibold">{item.sub}</p>
                      </div>
                    </div>

                    <div
                      className={`grid h-6 w-6 place-items-center rounded-full border ${
                        isCurrent
                          ? "border-emerald-400 bg-emerald-500 text-white"
                          : "border-slate-700 bg-slate-800"
                      }`}
                    >
                      {isCurrent && <Check size={14} />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Confirm button */}
            <div className="mt-5 pt-3 border-t border-slate-800">
              <button
                onClick={handleConfirm}
                className="btn btn-primary w-full justify-center text-xs py-2 font-bold cursor-pointer"
              >
                Continue to Portal
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
