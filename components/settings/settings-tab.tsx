"use client";

import { useState, useEffect, useRef } from "react";
import {
  getSettings,
  saveSettings,
  exportBackup,
  importBackup,
  type UserSettings,
} from "@/lib/storage";
import { Download, Upload, User, Sliders } from "lucide-react";

export default function SettingsTab() {
  const [settings, setSettings] = useState<UserSettings>({
    name: "",
    progressionPct: 2.5,
    minWeightJump: 2.5,
    fcMax: 150,
  });
  const [saved, setSaved] = useState(false);
  const [importMsg, setImportMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  function handleSave() {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleExport() {
    const json = exportBackup();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `entrena-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importBackup(reader.result as string);
      setImportMsg(ok ? "Datos restaurados correctamente" : "Error al importar");
      if (ok) setSettings(getSettings());
      setTimeout(() => setImportMsg(""), 3000);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="px-5 pt-14 pb-4">
      <h1 className="text-3xl font-bold text-primary mb-8">Ajustes</h1>

      {/* Profile */}
      <section className="mb-8">
        <h2 className="text-[16px] font-semibold text-secondary mb-3 flex items-center gap-2">
          <User size={18} />
          Perfil
        </h2>
        <div className="bg-card border border-line rounded-2xl p-5 space-y-4">
          <div>
            <label className="text-[14px] text-muted block mb-1">Tu nombre</label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              placeholder="¿Cómo te llamás?"
              className="w-full bg-elevated border border-line rounded-xl px-4 py-3 text-primary placeholder:text-muted"
            />
          </div>
          <div>
            <label className="text-[14px] text-muted block mb-1">FC máxima</label>
            <input
              type="number"
              value={settings.fcMax}
              onChange={(e) => setSettings({ ...settings, fcMax: Number(e.target.value) })}
              className="w-full bg-elevated border border-line rounded-xl px-4 py-3 text-primary"
            />
          </div>
        </div>
      </section>

      {/* Progression */}
      <section className="mb-8">
        <h2 className="text-[16px] font-semibold text-secondary mb-3 flex items-center gap-2">
          <Sliders size={18} />
          Progresión
        </h2>
        <div className="bg-card border border-line rounded-2xl p-5 space-y-4">
          <div>
            <label className="text-[14px] text-muted block mb-1">
              Incremento de peso (%)
            </label>
            <input
              type="number"
              step="0.5"
              value={settings.progressionPct}
              onChange={(e) =>
                setSettings({ ...settings, progressionPct: Number(e.target.value) })
              }
              className="w-full bg-elevated border border-line rounded-xl px-4 py-3 text-primary"
            />
          </div>
          <div>
            <label className="text-[14px] text-muted block mb-1">
              Salto mínimo de peso (kg)
            </label>
            <input
              type="number"
              step="0.5"
              value={settings.minWeightJump}
              onChange={(e) =>
                setSettings({ ...settings, minWeightJump: Number(e.target.value) })
              }
              className="w-full bg-elevated border border-line rounded-xl px-4 py-3 text-primary"
            />
          </div>
        </div>
      </section>

      <button
        onClick={handleSave}
        className="w-full btn-accent py-4 rounded-2xl text-[18px] font-bold mb-6"
      >
        {saved ? "Guardado ✓" : "Guardar cambios"}
      </button>

      {/* Backup */}
      <section>
        <h2 className="text-[16px] font-semibold text-secondary mb-3">
          Respaldo de datos
        </h2>
        <div className="space-y-3">
          <button
            onClick={handleExport}
            className="w-full bg-card border border-line rounded-xl p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
          >
            <Download size={20} className="text-accent" />
            <div>
              <p className="text-primary font-medium">Exportar backup</p>
              <p className="text-[13px] text-muted">
                Descargá un archivo con todos tus datos
              </p>
            </div>
          </button>
          <button
            onClick={handleImportClick}
            className="w-full bg-card border border-line rounded-xl p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
          >
            <Upload size={20} className="text-violet" />
            <div>
              <p className="text-primary font-medium">Importar backup</p>
              <p className="text-[13px] text-muted">
                Restaurá datos desde un archivo previo
              </p>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />
          {importMsg && (
            <p className="text-center text-accent text-[14px]">{importMsg}</p>
          )}
        </div>
      </section>
    </div>
  );
}
