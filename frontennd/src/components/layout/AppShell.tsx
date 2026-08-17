"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Bell, LogOut, ChevronRight, CloudRain, Globe } from "lucide-react";
import { Wordmark } from "@/components/brand";
import { NAV } from "@/components/layout/nav";
import { WEATHER } from "@/lib/data";
import { useAppStore } from "@/lib/store";
import { useTranslation, useLanguageStore, type Language } from "@/lib/i18n";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { LanguageSelectorModal } from "@/components/ui/LanguageSelectorModal";
import { cn } from "@/lib/utils";

function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!now) return <span className="text-sm text-ink-soft">--:--:--</span>;
  return (
    <span className="font-mono text-sm font-semibold tabular-nums text-ink">
      {now.toLocaleTimeString("en-IN", { hour12: false })}
    </span>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { lang } = useTranslation();

  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
      {NAV.map((group) => (
        <div key={group.group}>
          <p className="px-3 pb-2 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-ink-faint">
            {group.group}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "text-brand" : "text-ink-soft hover:text-ink"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      transition={{ type: "spring", stiffness: 480, damping: 38 }}
                      className="absolute inset-0 rounded-xl bg-brand-tint"
                    />
                  )}
                  <Icon size={18} className="relative z-10 shrink-0" strokeWidth={2} />
                  <span className="relative z-10">{item.label}</span>
                  {active && (
                    <ChevronRight
                      size={15}
                      className="relative z-10 ml-auto text-brand"
                      strokeWidth={2.5}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Link href="/dashboard" onClick={onNavigate}>
          <Wordmark />
        </Link>
      </div>

      {/* Language Switcher in Sidebar */}
      <div className="px-5 pb-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
          <div className="flex items-center justify-between mb-1.5 text-[0.68rem] font-bold text-slate-500">
            <span className="flex items-center gap-1">
              <Globe size={12} /> Language
            </span>
            <span className="text-brand font-black uppercase">{language}</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: "en" as Language, label: "EN" },
              { id: "hi" as Language, label: "हिंदी" },
              { id: "mr" as Language, label: "मराठी" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setLanguage(item.id)}
                className={`rounded py-1 text-center text-xs font-black transition-all cursor-pointer ${
                  language === item.id
                    ? "bg-[#10b981] text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:text-ink"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <NavList onNavigate={onNavigate} />

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-3 rounded-xl bg-clay-tint px-3 py-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-bold text-white">
            RP
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="m-0 truncate text-sm font-semibold text-ink">Insp. R. Pawar</p>
            <p className="m-0 truncate text-xs text-ink-faint">Control Room · Zone Central</p>
          </div>
          <button
            onClick={() => router.push("/")}
            aria-label="Sign out"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-clay hover:text-risk-high cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const incidents = useAppStore((s) => s.incidents);
  const activeCount = incidents.filter((i) => i.status === "active").length;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-surface/80 backdrop-blur-xl lg:block">
        <SidebarBody />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 36 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-surface shadow-2xl lg:hidden"
            >
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="absolute right-3 top-4 grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-clay cursor-pointer"
              >
                <X size={18} />
              </button>
              <SidebarBody onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-line bg-surface/75 backdrop-blur-xl">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="grid h-9 w-9 place-items-center rounded-lg bg-clay text-ink lg:hidden cursor-pointer"
            >
              <Menu size={18} />
            </button>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-risk-low opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-risk-low" />
              </span>
              <span className="text-sm font-semibold text-ink">Live Surveillance</span>
            </div>
            <div className="ml-auto flex items-center gap-2 sm:gap-4">
              <LanguageToggle />

              <div className="hidden items-center gap-2 rounded-full bg-water-tint px-3 py-1.5 md:flex">
                <CloudRain size={15} className="text-water" />
                <span className="text-xs font-semibold text-water">
                  {WEATHER.condition} · {WEATHER.tempC}°
                </span>
              </div>
              <div className="hidden sm:block">
                <LiveClock />
              </div>
              <button
                aria-label="Alerts"
                className="relative grid h-9 w-9 place-items-center rounded-lg bg-clay text-ink-soft hover:text-ink cursor-pointer"
              >
                <Bell size={17} />
                {activeCount > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-risk-high px-1 text-[0.6rem] font-bold text-white">
                    {activeCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
