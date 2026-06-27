"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface BreathingFlowerProps {
  progress: number;
  size?: number;
  countdown: number;
}

const PETAL_COUNT = 7;
const PETAL_COLORS = [
  "rgba(123, 90, 255, 0.35)",
  "rgba(0, 212, 170, 0.30)",
  "rgba(78, 205, 196, 0.28)",
  "rgba(123, 90, 255, 0.30)",
  "rgba(0, 212, 170, 0.25)",
  "rgba(78, 205, 196, 0.32)",
  "rgba(123, 90, 255, 0.28)",
];

export default function BreathingFlower({ progress, size = 270, countdown }: BreathingFlowerProps) {
  const center = size / 2;

  const petals = useMemo(() => {
    return Array.from({ length: PETAL_COUNT }, (_, i) => ({
      baseAngle: (360 / PETAL_COUNT) * i,
      color: PETAL_COLORS[i % PETAL_COLORS.length],
    }));
  }, []);

  const petalRx = size * 0.15;
  const petalRy = size * 0.23;
  const maxOffset = size * 0.18;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(123,90,255,${0.06 + progress * 0.08}) 0%, transparent 70%)`,
          transform: `scale(${1 + progress * 0.3})`,
          transition: "all 0.15s ease-out",
        }}
      />

      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ overflow: "visible" }}
        >
          <defs>
            <filter id="petal-blur">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
            </filter>
          </defs>

          {petals.map((petal, i) => {
            const angle = petal.baseAngle;
            const rad = (angle * Math.PI) / 180;
            const t = progress;
            const offset = maxOffset * t;
            const tx = Math.cos(rad) * offset;
            const ty = Math.sin(rad) * offset;
            const rotation = angle + t * 20;
            const scaleX = 0.55 + t * 0.45;
            const scaleY = 0.55 + t * 0.45;

            return (
              <ellipse
                key={i}
                cx={center + tx}
                cy={center + ty}
                rx={petalRx * scaleX}
                ry={petalRy * scaleY}
                fill={petal.color}
                filter="url(#petal-blur)"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transformOrigin: `${center + tx}px ${center + ty}px`,
                  transition: "all 0.15s ease-out",
                }}
              />
            );
          })}

          <circle
            cx={center}
            cy={center}
            r={size * 0.08 + progress * size * 0.04}
            fill="rgba(123, 90, 255, 0.1)"
            style={{ transition: "all 0.15s ease-out" }}
          />
        </svg>
      </motion.div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.span
          key={countdown}
          initial={{ opacity: 0.4, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="text-[42px] font-light tabular-nums select-none"
          style={{ color: "#D0CDD6" }}
        >
          {countdown}
        </motion.span>
      </div>
    </div>
  );
}
