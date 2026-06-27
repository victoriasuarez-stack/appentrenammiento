"use client";

import { useState } from "react";
import BottomNav, { type TabKey } from "@/components/bottom-nav";
import TrainTab from "@/components/train/train-tab";
import RoutinesTab from "@/components/routines/routines-tab";
import ProgressTab from "@/components/progress/progress-tab";
import SettingsTab from "@/components/settings/settings-tab";
import BreatheTab from "@/components/breathing/breathe-tab";

export default function App() {
  const [tab, setTab] = useState<TabKey>("train");

  return (
    <div className="min-h-[100dvh] bg-deep">
      <div className="mx-auto max-w-[520px] pb-20">
        {tab === "train" && <TrainTab />}
        {tab === "routines" && <RoutinesTab />}
        {tab === "breathe" && <BreatheTab />}
        {tab === "progress" && <ProgressTab />}
        {tab === "settings" && <SettingsTab />}
      </div>
      <BottomNav active={tab} onNavigate={setTab} />
    </div>
  );
}
