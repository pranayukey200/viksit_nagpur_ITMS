"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrafficDiamondSignLogo } from "@/components/brand";

export function SurakshaNetraIntro() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // 2-second timer for intro splash
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro-splash"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.04,
            filter: "blur(10px)",
            transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0f1d] px-4 select-none"
        >
          {/* Ambient Signal Aura */}
          <div className="absolute -top-10 h-72 w-72 rounded-full bg-[#f59e0b]/20 blur-[100px] pointer-events-none" />
          <div className="absolute h-80 w-80 rounded-full bg-[#10b981]/15 blur-[110px] pointer-events-none" />
          <div className="absolute -bottom-10 h-72 w-72 rounded-full bg-[#ef4444]/20 blur-[100px] pointer-events-none" />

          {/* Yellow Diamond Traffic Sign with Cyber Radar Pulse Rings */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative grid place-items-center"
          >
            {/* Animated outer diamond pulse ring */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              className="absolute h-28 w-28 rounded-2xl border-2 border-[#f59e0b]/50 rotate-45"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 2.1, opacity: 0 }}
              transition={{ duration: 1.6, delay: 0.3, repeat: Infinity, ease: "easeOut" }}
              className="absolute h-28 w-28 rounded-2xl border border-[#10b981]/40 rotate-45"
            />

            <div className="relative z-10 drop-shadow-[0_0_35px_rgba(245,158,11,0.5)]">
              <TrafficDiamondSignLogo size={76} animated />
            </div>
          </motion.div>

          {/* Typography: SURAKSHA (Green) + नेत्र (Red) */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 text-center"
          >
            <p className="m-0 text-[0.68rem] font-bold uppercase tracking-[0.25em] text-slate-400">
              Government of Maharashtra · Nagpur City
            </p>

            <div className="mt-1.5 flex items-center justify-center gap-2">
              {/* SURAKSHA in English Green */}
              <h1 className="m-0 text-3xl sm:text-5xl font-black tracking-[0.14em] text-[#10b981] drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                SURAKSHA
              </h1>
              {/* नेत्र in Hindi Red */}
              <h1 className="m-0 text-4xl sm:text-6xl font-black tracking-tight text-[#ef4444] drop-shadow-[0_0_25px_rgba(239,68,68,0.6)]">
                नेत्र
              </h1>
            </div>

            <p className="mt-2 m-0 text-xs font-bold tracking-wider text-slate-400">
              AI Traffic Risk Heatmap & Police Deployment DSS
            </p>
          </motion.div>

          {/* Precision loading indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 w-48 overflow-hidden rounded-full bg-slate-900 border border-slate-800 p-0.5"
          >
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              className="h-1.5 rounded-full bg-gradient-to-r from-[#10b981] via-[#f59e0b] to-[#ef4444] shadow-[0_0_10px_rgba(245,158,11,0.8)]"
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-2.5 text-[0.62rem] font-extrabold tracking-widest text-slate-500 uppercase"
          >
            नागपूर वाहतूक नियंत्रण प्रणाली सुरू होत आहे…
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
