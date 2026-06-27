"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/contexts/user-context";
import { fetchSessions, fetchRecords, fetchRoutines } from "@/lib/supabase-storage";
import { getExerciseById } from "@/lib/exercises";
import { Trophy, TrendingUp, Calendar, Loader2 } from "lucide-react";

interface SessionRow {
  id: string;
  routine_id: string;
  date: string;
  completed: boolean;
}

interface RecordRow {
  exercise_id: string;
  weight: number;
  reps: number;
  date: string;
}

export default function ProgressTab() {
  const { userId } = useUser();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [routineNames, setRoutineNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const [s, r, routines] = await Promise.all([
      fetchSessions(userId),
      fetchRecords(userId),
      fetchRoutines(userId),
    ]);
    setSessions(s);
    setRecords(r);
    const names: Record<string, string> = {};
    routines.forEach((rt) => { names[rt.id] = rt.name; });
    setRoutineNames(names);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const totalSessions = sessions.length;
  const thisMonth = sessions.filter((s) => {
    const d = new Date(s.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  if (loading) {
    return (
      <div className="px-5 pt-14 pb-4">
        <h1 className="text-3xl font-bold text-primary mb-8">Progreso</h1>
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="text-accent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-14 pb-4">
      <h1 className="text-3xl font-bold text-primary mb-8">Progreso</h1>

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
            const ex = getExerciseById(record.exercise_id);
            return (
              <div
                key={record.exercise_id}
                className="bg-card border border-line rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-primary font-medium">{ex?.name ?? record.exercise_id}</p>
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

      <h2 className="text-xl font-semibold text-primary mb-4">Últimas sesiones</h2>

      {sessions.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted">
            Completá tu primera sesión de entrenamiento para ver tu historial acá.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.slice(0, 10).map((session) => (
            <div
              key={session.id}
              className="bg-card border border-line rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-primary font-medium">
                  {routineNames[session.routine_id] ?? "Rutina eliminada"}
                </p>
                <p className="text-[13px] text-muted">
                  {new Date(session.date).toLocaleDateString("es-AR")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
