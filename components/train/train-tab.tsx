"use client";

import { useState, useEffect } from "react";
import { getRoutines, type Routine } from "@/lib/storage";
import { Dumbbell, ChevronRight } from "lucide-react";

export default function TrainTab() {
  const [routines, setRoutines] = useState<Routine[]>([]);

  useEffect(() => {
    setRoutines(getRoutines());
  }, []);

  const today = new Date();
  const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

  return (
    <div className="px-5 pt-14 pb-4">
      <p className="text-secondary text-[16px]">
        {dayNames[today.getDay()]} {today.getDate()} de {monthNames[today.getMonth()]}
      </p>
      <h1 className="text-3xl font-bold text-primary mt-1 mb-8">
        Entrenar
      </h1>

      {routines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-elevated flex items-center justify-center mb-5">
            <Dumbbell size={36} className="text-muted" />
          </div>
          <p className="text-xl font-semibold text-primary mb-2">
            No tenés rutinas todavía
          </p>
          <p className="text-secondary text-[16px] max-w-[280px]">
            Andá a la pestaña <strong>Rutinas</strong> para crear tu primera rutina de entrenamiento.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-secondary text-[16px] mb-4">
            Elegí una rutina para hoy:
          </p>
          {routines.map((routine) => (
            <button
              key={routine.id}
              className="w-full bg-card rounded-2xl p-5 flex items-center gap-4 border border-line text-left active:scale-[0.98] transition-transform"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Dumbbell size={22} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[18px] font-semibold text-primary">{routine.name}</h3>
                <p className="text-[14px] text-muted mt-0.5">
                  {routine.exercises.length} ejercicios
                </p>
              </div>
              <ChevronRight size={20} className="text-muted flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
