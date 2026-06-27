"use client";

import { useState, useEffect } from "react";
import {
  getSessions,
  getRecords,
  getRoutines,
  type Session,
  type PersonalRecord,
} from "@/lib/storage";
import { getExerciseById } from "@/lib/exercises";
import { Trophy, TrendingUp, Calendar } from "lucide-react";

export default function ProgressTab() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [routines, setRoutines] = useState<ReturnType<typeof getRoutines>>([]);

  useEffect(() => {
    setSessions(getSessions().filter((s) => s.completed));
    setRecords(getRecords());
    setRoutines(getRoutines());
  }, []);

  const totalSessions = sessions.length;
  const thisMonth = sessions.filter((s) => {
    const d = new Date(s.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  function getRoutineName(routineId: string): string {
    return routines.find((r) => r.id === routineId)?.name ?? "Rutina eliminada";
  }

  return (
    <div className="px-5 pt-14 pb-4">
      <h1 className="text-3xl font-bold text-primary mb-8">Progreso</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-card border border-line rounded-2xl p-4">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center mb-3">
            <Calendar size={20} className="text-accent" />
          </div>
          <p className="text-2xl font-bold text-primary">{totalSessions}</p>
          <p className="text-[13px] text-muted">Sesiones totales</p>
        </div>
        <div className="bg-card border border-line rounded-2xl p-4">
          <div className="w-10 h-10 rounded-xl bg-violet/20 flex items-center justify-center mb-3">
            <TrendingUp size={20} className="text-violet" />
          </div>
          <p className="text-2xl font-bold text-primary">{thisMonth}</p>
          <p className="text-[13px] text-muted">Este mes</p>
        </div>
      </div>

      {/* Records */}
      <h2 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
        <Trophy size={20} className="text-amber-400" />
        Récords personales
      </h2>

      {records.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted">
            Todavía no tenés récords. Completá una sesión para empezar a registrar.
          </p>
        </div>
      ) : (
        <div className="space-y-2 mb-8">
          {records.map((record) => {
            const ex = getExerciseById(record.exerciseId);
            return (
              <div
                key={record.exerciseId}
                className="bg-card border border-line rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-primary font-medium">{ex?.name ?? record.exerciseId}</p>
                  <p className="text-[13px] text-muted">
                    {new Date(record.date).toLocaleDateString("es-AR")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-accent font-bold text-[18px]">{record.weight} kg</p>
                  <p className="text-[13px] text-muted">{record.reps} reps</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent sessions */}
      <h2 className="text-xl font-semibold text-primary mb-4">Últimas sesiones</h2>

      {sessions.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted">
            Completá tu primera sesión de entrenamiento para ver tu historial acá.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 10)
            .map((session) => (
              <div
                key={session.id}
                className="bg-card border border-line rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-primary font-medium">
                    {getRoutineName(session.routineId)}
                  </p>
                  <p className="text-[13px] text-muted">
                    {new Date(session.date).toLocaleDateString("es-AR")}
                  </p>
                </div>
                <p className="text-[13px] text-muted">
                  {session.exercises.length} ejercicios
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
