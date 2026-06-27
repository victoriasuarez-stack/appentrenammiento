"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import BreathingFlower from "./breathing-flower";
import { Square, Waves, Zap, Activity } from "lucide-react";

type Phase = "inhale" | "hold" | "exhale" | "hold2";

interface BreathingMode {
  id: string;
  name: string;
  desc: string;
  timing: string;
  icon: typeof Square;
  gradient: string;
  phases: { phase: Phase; duration: number }[];
}

const PHASE_LABELS: Record<Phase, string> = {
  inhale: "Inhalá",
  hold: "Sostené",
  exhale: "Exhalá",
  hold2: "Sostené",
};

const modes: BreathingMode[] = [
  {
    id: "box",
    name: "Respiración Cuadrada",
    desc: "Calma y concentración",
    timing: "4-4-4-4",
    icon: Square,
    gradient: "linear-gradient(135deg, #4ECDC4, #7B5AFF)",
    phases: [
      { phase: "inhale", duration: 4 },
      { phase: "hold", duration: 4 },
      { phase: "exhale", duration: 4 },
      { phase: "hold2", duration: 4 },
    ],
  },
  {
    id: "478",
    name: "Respiración 4-7-8",
    desc: "Relajación profunda",
    timing: "4-7-8",
    icon: Waves,
    gradient: "linear-gradient(135deg, #7B5AFF, #A78BFA)",
    phases: [
      { phase: "inhale", duration: 4 },
      { phase: "hold", duration: 7 },
      { phase: "exhale", duration: 8 },
    ],
  },
  {
    id: "energy",
    name: "Respiración Energizante",
    desc: "Activación rápida",
    timing: "2-2",
    icon: Zap,
    gradient: "linear-gradient(135deg, #FFB347, #FF6B6B)",
    phases: [
      { phase: "inhale", duration: 2 },
      { phase: "exhale", duration: 2 },
    ],
  },
  {
    id: "coherence",
    name: "Respiración Coherencia",
    desc: "Calma sostenida",
    timing: "5-5",
    icon: Activity,
    gradient: "linear-gradient(135deg, #00D4AA, #4ECDC4)",
    phases: [
      { phase: "inhale", duration: 5 },
      { phase: "exhale", duration: 5 },
    ],
  },
];

export default function BreatheTab() {
  const [activeMode, setActiveMode] = useState<BreathingMode | null>(null);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [flowerProgress, setFlowerProgress] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef(0);
  const sessionStartRef = useRef<number>(0);

  const startSession = useCallback((mode: BreathingMode) => {
    setActiveMode(mode);
    setPhaseIndex(0);
    setCycleCount(0);
    setSessionDuration(0);
    tickRef.current = 0;
    sessionStartRef.current = Date.now();
    const firstPhase = mode.phases[0];
    setCountdown(firstPhase.duration);
    setFlowerProgress(firstPhase.phase === "inhale" ? 0 : 1);
  }, []);

  useEffect(() => {
    if (!activeMode) return;

    intervalRef.current = setInterval(() => {
      tickRef.current += 0.05;
      const currentPhase = activeMode.phases[phaseIndex];
      const elapsed = tickRef.current;
      const remaining = Math.max(0, currentPhase.duration - elapsed);

      setCountdown(Math.ceil(remaining));
      setSessionDuration(Math.round((Date.now() - sessionStartRef.current) / 1000));

      const phaseFraction = elapsed / currentPhase.duration;
      if (currentPhase.phase === "inhale") {
        setFlowerProgress(Math.min(1, phaseFraction));
      } else if (currentPhase.phase === "exhale") {
        setFlowerProgress(Math.max(0, 1 - phaseFraction));
      }

      if (remaining <= 0) {
        tickRef.current = 0;
        const nextIdx = phaseIndex + 1;
        if (nextIdx >= activeMode.phases.length) {
          setPhaseIndex(0);
          setCycleCount((c) => c + 1);
          const next = activeMode.phases[0];
          setCountdown(next.duration);
        } else {
          setPhaseIndex(nextIdx);
          const next = activeMode.phases[nextIdx];
          setCountdown(next.duration);
        }
      }
    }, 50);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeMode, phaseIndex]);

  const stopSession = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setActiveMode(null);
    setPhaseIndex(0);
    tickRef.current = 0;
  };

  function formatDuration(secs: number) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  if (activeMode) {
    const currentPhase = activeMode.phases[phaseIndex];
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-5"
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={currentPhase.phase + phaseIndex}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="text-[18px] font-medium text-violet mb-8 tracking-wide"
          >
            {PHASE_LABELS[currentPhase.phase]}
          </motion.p>
        </AnimatePresence>

        <BreathingFlower
          progress={flowerProgress}
          size={270}
          countdown={countdown}
        />

        <div className="mt-8 flex items-center gap-4 text-[13px] text-secondary">
          <span>Ciclo {cycleCount + 1}</span>
          <span>·</span>
          <span>{formatDuration(sessionDuration)}</span>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={stopSession}
          className="mt-10 px-8 py-3 rounded-[14px] text-[14px] font-medium text-secondary bg-card border border-line"
        >
          Terminar
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="px-5 pt-14 pb-4">
      <h1 className="text-3xl font-bold text-primary mb-2">Respirar</h1>
      <p className="text-secondary text-[16px] mb-6">
        Elegí un patrón de respiración
      </p>

      <div className="space-y-3">
        {modes.map((mode, i) => {
          const Icon = mode.icon;
          return (
            <motion.button
              key={mode.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startSession(mode)}
              className="w-full bg-card rounded-2xl p-4 flex items-center gap-4 border border-line text-left active:scale-[0.98] transition-transform"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: mode.gradient }}
              >
                <Icon size={22} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[16px] font-semibold text-primary">{mode.name}</h3>
                <p className="text-[13px] text-muted mt-0.5">{mode.desc}</p>
              </div>
              <span className="text-[13px] text-muted font-medium whitespace-nowrap">
                {mode.timing}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
