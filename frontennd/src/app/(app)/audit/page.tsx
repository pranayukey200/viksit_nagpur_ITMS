"use client";

import { motion } from "framer-motion";
import { ScrollText, Download, Pencil, CheckCircle2, FileClock } from "lucide-react";
import { Card, Chip, fadeUp, stagger } from "@/components/ui/primitives";
import { useAppStore } from "@/lib/store";

function exportCsv(rows: ReturnType<typeof useAppStore.getState>["audit"]) {
  const header = ["Time", "User", "Action", "Target", "Reason", "Impact"];
  const body = rows.map((r) => [r.time, r.user, r.action, r.target, r.reason, r.impact]);
  const csv = [header, ...body]
    .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "suraksha-netra-audit.csv";
  a.click();
  URL.revokeObjectURL(url);
}

const ICONS: Record<string, typeof Pencil> = {
  "Manual override": Pencil,
  "Accepted recommendation": CheckCircle2,
};

export default function AuditPage() {
  const audit = useAppStore((s) => s.audit);
  const overrides = audit.filter((a) => a.action === "Manual override").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="eyebrow">Governance</span>
          <h1 className="m-0 mt-1 text-2xl font-bold tracking-tight text-ink">Audit Trail</h1>
          <p className="m-0 mt-1 text-sm text-ink-soft">
            Every recommendation, acceptance and override — who, what, when, why.
          </p>
        </div>
        <button onClick={() => exportCsv(audit)} className="btn btn-primary">
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Summary */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-3 gap-4">
        {[
          { icon: FileClock, label: "Total events", value: audit.length },
          { icon: Pencil, label: "Manual overrides", value: overrides },
          { icon: CheckCircle2, label: "Accepted", value: audit.length - overrides },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} variants={fadeUp}>
              <Card className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-tint text-brand">
                  <Icon size={19} />
                </span>
                <div>
                  <p className="m-0 text-2xl font-bold text-ink">{s.value}</p>
                  <p className="m-0 text-xs text-ink-faint">{s.label}</p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <Card className="overflow-hidden p-0">
          <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
            <ScrollText size={16} className="text-ink-soft" />
            <h2 className="m-0 text-sm font-semibold text-ink">Decision log</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead>
                <tr className="border-b border-line text-[0.68rem] uppercase tracking-wide text-ink-faint">
                  <th className="px-5 py-2.5 font-semibold">Time</th>
                  <th className="px-3 py-2.5 font-semibold">User</th>
                  <th className="px-3 py-2.5 font-semibold">Action</th>
                  <th className="px-3 py-2.5 font-semibold">Target</th>
                  <th className="px-3 py-2.5 font-semibold">Reason</th>
                  <th className="px-5 py-2.5 font-semibold">Impact</th>
                </tr>
              </thead>
              <tbody>
                {audit.map((a) => {
                  const Icon = ICONS[a.action] ?? ScrollText;
                  return (
                    <tr key={a.id} className="border-b border-line/60 last:border-0 hover:bg-clay-tint/40">
                      <td className="whitespace-nowrap px-5 py-3 text-xs font-semibold text-ink">{a.time}</td>
                      <td className="px-3 py-3 text-xs text-ink-soft">{a.user}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`chip ${
                            a.action === "Manual override" ? "bg-med-tint text-risk-med" : "bg-low-tint text-risk-low"
                          }`}
                        >
                          <Icon size={11} /> {a.action}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs font-medium text-ink">{a.target}</td>
                      <td className="px-3 py-3 text-xs text-ink-soft">{a.reason}</td>
                      <td className="px-5 py-3">
                        <Chip tone="brand">{a.impact}</Chip>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      <p className="text-center text-xs text-ink-faint">
        Immutable & exportable · feeds future model tuning · satisfies audit & DPDP requirements
      </p>
    </div>
  );
}
