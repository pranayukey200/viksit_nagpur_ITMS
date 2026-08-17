"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Lock, Mail, ArrowLeft } from "lucide-react";
import { NetraMark } from "@/components/brand";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("inspector.pawar@nagpurtraffic.gov.in");
  const [password, setPassword] = useState("netra2026");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/dashboard"), 650);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand to-brand-deep p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-16 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-water/30 blur-3xl" />
        <Link href="/" className="relative flex items-center gap-2.5 text-white">
          <NetraMark size={34} />
          <span className="text-lg font-bold tracking-tight">Suraksha Netra</span>
        </Link>

        <div className="relative text-white">
          <h1 className="m-0 text-4xl font-bold leading-tight tracking-tight">
            Welcome back, <br /> Control Room.
          </h1>
          <p className="mt-4 m-0 max-w-md text-brand-tint">
            Sign in to see where Nagpur's risk is rising, where to send your limited officers,
            and how to clear the way for every ambulance — all explainable and auditable.
          </p>
          <div className="mt-8 space-y-3">
            {[
              "Living risk scores with plain-language reasons",
              "Constrained, explainable officer allocation",
              "Ambulance corridors & smart signal control",
            ].map((t) => (
              <div key={t} className="flex items-center gap-3 text-sm text-brand-tint">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/15">
                  <ShieldCheck size={14} className="text-white" />
                </span>
                {t}
              </div>
            ))}
          </div>
        </div>

        <p className="relative m-0 text-xs text-brand-tint/70">
          Government-grade · DPDP-safe · human always in control
        </p>
      </div>

      {/* Form */}
      <div className="relative flex items-center justify-center px-5 py-12">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-faint transition-colors hover:text-ink"
          >
            <ArrowLeft size={14} /> Back to overview
          </Link>

          <div className="lg:hidden">
            <div className="mb-6 flex items-center gap-2.5">
              <NetraMark size={34} />
              <span className="text-lg font-bold tracking-tight text-ink">Suraksha Netra</span>
            </div>
          </div>

          <h2 className="m-0 text-2xl font-bold tracking-tight text-ink">Sign in</h2>
          <p className="mt-1.5 m-0 text-sm text-ink-soft">
            Access the Nagpur Traffic command dashboard.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label className="eyebrow mb-1.5 block" htmlFor="email">
                Official Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
                />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-9"
                  placeholder="you@nagpurtraffic.gov.in"
                />
              </div>
            </div>
            <div>
              <label className="eyebrow mb-1.5 block" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
                />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-9"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
                <input type="checkbox" defaultChecked className="accent-brand" />
                Remember device
              </label>
              <button type="button" className="text-sm font-semibold text-brand hover:underline">
                Forgot?
              </button>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? "Authenticating…" : "Enter Command Center"}
              {!loading && <ArrowRight size={15} />}
            </button>
          </form>

          <div className="mt-5 rounded-xl bg-clay-tint px-4 py-3 text-center text-xs text-ink-soft">
            <span className="font-semibold text-ink">Demo access</span> — credentials are
            pre-filled. Just press sign in.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
