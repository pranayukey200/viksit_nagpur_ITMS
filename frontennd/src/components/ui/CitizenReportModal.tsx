"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  AlertTriangle,
  TrafficCone,
  Droplets,
  Siren,
  Wrench,
  CheckCircle2,
  Send,
  MapPin,
  Camera,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { JUNCTIONS } from "@/lib/data";
import { useTranslation } from "@/lib/i18n";
import type { IncidentType, RiskTier } from "@/lib/types";

export function CitizenReportModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t, lang } = useTranslation();
  const injectIncident = useAppStore((s) => s.injectIncident);

  const [selectedType, setSelectedType] = useState<IncidentType>("traffic");
  const [junctionId, setJunctionId] = useState("sitabuldi");
  const [customLocation, setCustomLocation] = useState("");
  const [severity, setSeverity] = useState<RiskTier>("high");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [reportId, setReportId] = useState("");

  const incidentTypes = [
    { type: "traffic" as IncidentType, label: t.hazardTraffic, icon: TrafficCone, desc: t.hazardTrafficDesc },
    { type: "waterlogging" as IncidentType, label: t.hazardWaterlog, icon: Droplets, desc: t.hazardWaterlogDesc },
    { type: "accident" as IncidentType, label: t.hazardAccident, icon: Siren, desc: t.hazardAccidentDesc },
    { type: "breakdown" as IncidentType, label: t.hazardBreakdown, icon: Wrench, desc: t.hazardBreakdownDesc },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedJunction = JUNCTIONS.find((j) => j.id === junctionId);
    const locName = customLocation.trim() || (lang === "mr" ? selectedJunction?.nameMr : selectedJunction?.name) || "Nagpur Road";
    const id = `cit-${Date.now().toString().slice(-5)}`;

    injectIncident({
      id,
      type: selectedType,
      junctionId: selectedJunction ? selectedJunction.id : "sitabuldi",
      junctionName: locName,
      severity,
      status: "active",
      time: "Just now",
      note: notes.trim() || `Citizen reported ${selectedType} at ${locName}`,
    });

    setReportId(id);
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setNotes("");
    setCustomLocation("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleReset}
            className="absolute inset-0 bg-[#0d1322]/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
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
                <span className="grid h-8 w-8 place-items-center rounded-md bg-red-100 text-red-600">
                  <AlertTriangle size={17} />
                </span>
                <div>
                  <h3 className="m-0 text-sm font-bold text-ink sm:text-base">
                    {t.reportTitle}
                  </h3>
                  <p className="m-0 text-[0.68rem] text-ink-soft">
                    {t.reportSubtitle}
                  </p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="grid h-7 w-7 place-items-center rounded-md text-ink-faint hover:bg-canvas hover:text-ink cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {submitted ? (
              <div className="py-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 14 }}
                  className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-600"
                >
                  <CheckCircle2 size={28} />
                </motion.div>
                <h4 className="mt-3 m-0 text-base font-bold text-ink">{t.reportTransmitted}</h4>
                <p className="mt-1 m-0 text-xs text-ink-soft">
                  Incident ID: <span className="font-mono font-bold text-brand">#{reportId}</span>
                </p>
                <p className="mt-2 m-0 text-xs text-ink-faint max-w-xs mx-auto">
                  {t.reportTransmittedDesc}
                </p>
                <button onClick={handleReset} className="btn btn-primary mt-5 text-xs font-bold cursor-pointer">
                  {t.done}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                {/* Incident Type Grid */}
                <div>
                  <label className="eyebrow block mb-1.5">{t.hazardType}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {incidentTypes.map((item) => {
                      const Icon = item.icon;
                      const active = selectedType === item.type;
                      return (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => setSelectedType(item.type)}
                          className={`flex items-start gap-2.5 rounded-md border p-2.5 text-left transition-all cursor-pointer ${
                            active
                              ? "border-red-500 bg-red-50 text-red-700 shadow-sm ring-1 ring-red-400"
                              : "border-line bg-canvas/60 text-ink-soft hover:border-slate-300"
                          }`}
                        >
                          <Icon size={16} className={`mt-0.5 shrink-0 ${active ? "text-red-600" : "text-ink-faint"}`} />
                          <div>
                            <p className="m-0 text-xs font-bold text-ink">{item.label}</p>
                            <p className="m-0 text-[0.6rem] text-ink-faint line-clamp-1">{item.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Location Selection */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="eyebrow block mb-1">{t.nearestJunction}</label>
                    <select
                      value={junctionId}
                      onChange={(e) => setJunctionId(e.target.value)}
                      className="input text-xs py-2 cursor-pointer"
                    >
                      {JUNCTIONS.map((j) => (
                        <option key={j.id} value={j.id}>
                          {lang === "mr" ? j.nameMr : j.name} ({j.zone})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="eyebrow block mb-1">{t.specificLandmark}</label>
                    <div className="relative">
                      <MapPin size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint" />
                      <input
                        type="text"
                        placeholder="e.g. Near Flyover, Wardha Rd"
                        value={customLocation}
                        onChange={(e) => setCustomLocation(e.target.value)}
                        className="input text-xs py-2 pl-7"
                      />
                    </div>
                  </div>
                </div>

                {/* Severity */}
                <div>
                  <label className="eyebrow block mb-1.5">{t.severityLevel}</label>
                  <div className="flex gap-2">
                    {[
                      { id: "high" as RiskTier, label: t.severityHigh, color: "text-red-700 border-red-300 bg-red-50" },
                      { id: "medium" as RiskTier, label: t.severityMed, color: "text-amber-700 border-amber-300 bg-amber-50" },
                      { id: "low" as RiskTier, label: t.severityLow, color: "text-emerald-700 border-emerald-300 bg-emerald-50" },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSeverity(s.id)}
                        className={`flex-1 rounded-md border py-1.5 text-xs font-bold transition-all cursor-pointer ${
                          severity === s.id
                            ? `${s.color} ring-1 ring-current`
                            : "border-line bg-canvas text-ink-soft opacity-70"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="eyebrow block mb-1">{t.citizenRemarks}</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t.remarksPlaceholder}
                    className="input text-xs resize-none"
                  />
                </div>

                {/* Submit action */}
                <div className="flex items-center justify-between pt-2 border-t border-line">
                  <div className="flex items-center gap-1.5 text-[0.68rem] text-ink-faint">
                    <Camera size={13} />
                    <span>Geo-tagged verification</span>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={handleReset} className="btn btn-ghost text-xs cursor-pointer">
                      {t.cancel}
                    </button>
                    <button type="submit" className="btn btn-primary text-xs cursor-pointer">
                      <Send size={12} /> {t.submitReport}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
