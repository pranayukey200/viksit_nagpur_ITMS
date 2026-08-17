"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Phone,
  Shield,
  MessageSquare,
  MapPin,
  Clock,
  Radio,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export function ContactModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0d1322]/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-lg border border-line/80 bg-white p-5 shadow-2xl sm:p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-md bg-emerald-100 text-emerald-700">
                  <Phone size={16} />
                </span>
                <div>
                  <h3 className="m-0 text-sm font-bold text-ink sm:text-base">
                    {t.contactTitle}
                  </h3>
                  <p className="m-0 text-[0.68rem] text-ink-soft">
                    {t.contactSubtitle}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="grid h-7 w-7 place-items-center rounded-md text-ink-faint hover:bg-canvas hover:text-ink cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Emergency Numbers */}
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <div className="rounded-md border border-red-200 bg-red-50 p-3">
                <div className="flex items-center gap-1.5 text-red-600">
                  <Radio size={14} className="animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider">{t.emergencyResponse}</span>
                </div>
                <p className="mt-1 m-0 text-2xl font-black text-ink">112</p>
                <p className="m-0 text-[0.62rem] text-slate-500">Toll-free 24/7 Police / Ambulance</p>
              </div>

              <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                <div className="flex items-center gap-1.5 text-blue-700">
                  <Shield size={14} />
                  <span className="text-xs font-bold uppercase tracking-wider">{t.trafficControlRoom}</span>
                </div>
                <p className="mt-1 m-0 text-xl font-black text-ink">1095 / 0712-2561222</p>
                <p className="m-0 text-[0.62rem] text-slate-500">Nagpur Traffic HQ Line</p>
              </div>
            </div>

            {/* Contact list */}
            <div className="mt-4 space-y-2.5">
              <div className="flex items-start gap-3 rounded-md bg-canvas/70 p-3 border border-line/60">
                <MessageSquare size={16} className="mt-0.5 text-emerald-600 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-xs font-bold text-ink">{t.whatsappMitra}</p>
                  <p className="m-0 text-[0.68rem] text-ink-soft">
                    {t.whatsappMitraDesc}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-md bg-canvas/70 p-3 border border-line/60">
                <MapPin size={16} className="mt-0.5 text-brand shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-xs font-bold text-ink">{t.policeHq}</p>
                  <p className="m-0 text-[0.68rem] text-ink-soft">
                    {t.policeHqAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-5 flex items-center justify-between border-t border-line pt-3">
              <span className="text-[0.68rem] font-bold text-slate-400">
                {t.missionTagline}
              </span>
              <button onClick={onClose} className="btn btn-soft text-xs font-bold cursor-pointer">
                {t.close}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
