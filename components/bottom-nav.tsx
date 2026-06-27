"use client";

import { Dumbbell, ListChecks, BarChart3, Settings, Wind } from "lucide-react";

export type TabKey = "train" | "routines" | "breathe" | "progress" | "settings";

const tabs: { key: TabKey; label: string; icon: typeof Dumbbell }[] = [
  { key: "train", label: "Entrenar", icon: Dumbbell },
  { key: "routines", label: "Rutinas", icon: ListChecks },
  { key: "breathe", label: "Respirar", icon: Wind },
  { key: "progress", label: "Progreso", icon: BarChart3 },
  { key: "settings", label: "Ajustes", icon: Settings },
];

interface Props {
  active: TabKey;
  onNavigate: (tab: TabKey) => void;
}

export default function BottomNav({ active, onNavigate }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-[520px]">
        <div
          className="flex items-center justify-around px-2 py-3 safe-bottom"
          style={{
            background: "rgba(5, 5, 8, 0.92)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {tabs.map(({ key, label, icon: Icon }) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                onClick={() => onNavigate(key)}
                className="flex flex-col items-center gap-1 min-w-[64px] min-h-[48px] justify-center"
              >
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  style={{ color: isActive ? "#4ECDC4" : "#9490A0" }}
                />
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: isActive ? "#FFFFFF" : "#9490A0" }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
