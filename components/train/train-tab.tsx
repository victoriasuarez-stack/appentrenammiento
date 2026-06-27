"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/contexts/user-context";
import {
  fetchRoutines,
  fetchSettings,
  fetchSessions,
  fetchCurrentWeights,
  createSession,
  completeSession,
  updateSessionSet,
  fetchSessionSets,
  saveCurrentWeight,
  upsertRecord,
} from "@/lib/supabase-storage";
import { getExerciseById } from "@/lib/exercises";
import type { Routine } from "@/lib/storage";
import {
  Dumbbell,
  ChevronRight,
  Loader2,
  Sparkles,
  Check,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Play,
} from "lucide-react";

interface SessionSet {
  id: string;
  exercise_id: string;
  set_number: number;
  weight: number;
  reps: number;
  completed: boolean;
}

type View = "home" | "workout";

export default function TrainTab() {
  const { userId } = useUser();
  const [view, setView] = useState<View>("home");
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [userName, setUserName] = useState("");
  const [lastRoutineId, setLastRoutineId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // workout state
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sets, setSets] = useState<SessionSet[]>([]);
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const [routineData, settings, sessions] = await Promise.all([
      fetchRoutines(userId),
      fetchSettings(userId),
      fetchSessions(userId),
    ]);
    setRoutines(routineData);
    setUserName(settings.name);
    if (sessions.length > 0) {
      setLastRoutineId(sessions[0].routine_id);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const today = new Date();
  const dayNames = [
    "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado",
  ];
  const monthNames = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];

  const greeting = () => {
    const hour = today.getHours();
    if (hour < 12) return "Buen día";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const suggestedRoutine = routines.length > 0
    ? lastRoutineId
      ? routines.find((r) => r.id !== lastRoutineId) || routines[0]
      : routines[0]
    : null;

  async function startWorkout(routine: Routine) {
    if (!userId) return;
    setSaving(true);
    const [sid, w] = await Promise.all([
      createSession(
        userId,
        routine.id,
        routine.exercises.map((e) => ({ exerciseId: e.exerciseId, sets: e.sets })),
      ),
      fetchCurrentWeights(userId),
    ]);
    const sessionSets = await fetchSessionSets(sid);
    setSessionId(sid);
    setActiveRoutine(routine);
    setSets(sessionSets);
    setWeights(w);
    setExpandedExercise(routine.exercises[0]?.exerciseId || null);
    setSaving(false);
    setView("workout");
  }

  function updateSet(setId: string, field: "weight" | "reps", value: number) {
    setSets((prev) =>
      prev.map((s) => (s.id === setId ? { ...s, [field]: value } : s)),
    );
  }

  async function toggleSetComplete(set: SessionSet) {
    const updated = { ...set, completed: !set.completed };
    setSets((prev) => prev.map((s) => (s.id === set.id ? updated : s)));
    await updateSessionSet(set.id, updated.weight, updated.reps, updated.completed);
  }

  async function finishWorkout() {
    if (!sessionId || !userId || !activeRoutine) return;
    setFinishing(true);

    for (const set of sets) {
      if (set.completed) {
        await updateSessionSet(set.id, set.weight, set.reps, true);
      }
    }

    const exerciseMaxes: Record<string, { weight: number; reps: number }> = {};
    for (const set of sets) {
      if (set.completed && set.weight > 0) {
        const prev = exerciseMaxes[set.exercise_id];
        if (!prev || set.weight > prev.weight) {
          exerciseMaxes[set.exercise_id] = { weight: set.weight, reps: set.reps };
        }
      }
    }

    for (const [exerciseId, best] of Object.entries(exerciseMaxes)) {
      await saveCurrentWeight(userId, exerciseId, best.weight);
      await upsertRecord(userId, exerciseId, best.weight, best.reps);
    }

    await completeSession(sessionId);
    setFinishing(false);
    setView("home");
    setSessionId(null);
    setActiveRoutine(null);
    setSets([]);
    load();
  }

  if (loading) {
    return (
      <div className="px-5 pt-14 pb-4">
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="text-accent animate-spin" />
        </div>
      </div>
    );
  }

  if (view === "workout" && activeRoutine) {
    const exerciseIds = Array.from(new Set(sets.map((s) => s.exercise_id)));
    const allCompleted = sets.length > 0 && sets.every((s) => s.completed);

    return (
      <div className="px-5 pt-14 pb-28">
        <button
          onClick={() => {
            setView("home");
            setSessionId(null);
            setActiveRoutine(null);
            setSets([]);
          }}
          className="flex items-center gap-1 text-accent text-[16px] mb-4"
        >
          <ArrowLeft size={18} />
          Volver
        </button>

        <h1 className="text-2xl font-bold text-primary mb-1">
          {activeRoutine.name}
        </h1>
        <p className="text-secondary text-[14px] mb-6">
          Registrá el peso y las reps de cada serie
        </p>

        <div className="space-y-3">
          {exerciseIds.map((exerciseId) => {
            const exercise = getExerciseById(exerciseId);
            const exerciseSets = sets.filter((s) => s.exercise_id === exerciseId);
            const isExpanded = expandedExercise === exerciseId;
            const completedCount = exerciseSets.filter((s) => s.completed).length;
            const currentWeight = weights[exerciseId];

            return (
              <div
                key={exerciseId}
                className="bg-card border border-line rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedExercise(isExpanded ? null : exerciseId)
                  }
                  className="w-full p-4 flex items-center gap-3 text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Dumbbell size={18} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[16px] font-semibold text-primary truncate">
                      {exercise?.name ?? exerciseId}
                    </h3>
                    <p className="text-[13px] text-muted">
                      {completedCount}/{exerciseSets.length} series
                      {currentWeight ? ` · Último: ${currentWeight} kg` : ""}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={20} className="text-muted" />
                  ) : (
                    <ChevronDown size={20} className="text-muted" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-2">
                    {exercise?.video && (
                      <a
                        href={exercise.video}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-violet/20 border border-violet/30 rounded-xl px-3 py-2.5 mb-2 active:scale-[0.98] transition-transform"
                      >
                        <Play size={16} className="text-violet flex-shrink-0" />
                        <span className="text-[13px] text-violet font-medium">
                          Ver video del ejercicio
                        </span>
                      </a>
                    )}
                    {exercise?.cues && exercise.cues.length > 0 && (
                      <div className="bg-elevated rounded-xl p-3 mb-2">
                        <p className="text-[12px] text-muted font-medium mb-1">
                          Tips
                        </p>
                        <ul className="text-[12px] text-secondary space-y-0.5">
                          {exercise.cues.map((cue, i) => (
                            <li key={i}>· {cue}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center text-[13px] text-muted font-medium px-1">
                      <span>Serie</span>
                      <span className="text-center">Kg</span>
                      <span className="text-center">Reps</span>
                      <span className="w-10" />
                    </div>

                    {exerciseSets.map((set) => (
                      <div
                        key={set.id}
                        className={`grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center ${
                          set.completed ? "opacity-60" : ""
                        }`}
                      >
                        <span className="text-[14px] text-muted font-medium w-8 text-center">
                          {set.set_number}
                        </span>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={set.weight || ""}
                          placeholder={currentWeight ? String(currentWeight) : "0"}
                          onChange={(e) =>
                            updateSet(set.id, "weight", Number(e.target.value))
                          }
                          className="bg-elevated border border-line rounded-xl px-3 py-2.5 text-center text-primary text-[16px] w-full"
                        />
                        <input
                          type="number"
                          inputMode="numeric"
                          value={set.reps || ""}
                          placeholder="0"
                          onChange={(e) =>
                            updateSet(set.id, "reps", Number(e.target.value))
                          }
                          className="bg-elevated border border-line rounded-xl px-3 py-2.5 text-center text-primary text-[16px] w-full"
                        />
                        <button
                          onClick={() => toggleSetComplete(set)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                            set.completed
                              ? "bg-accent text-deep"
                              : "bg-elevated border border-line text-muted"
                          }`}
                        >
                          <Check size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="fixed bottom-20 left-0 right-0 px-5 pb-4">
          <button
            onClick={finishWorkout}
            disabled={finishing || !sets.some((s) => s.completed)}
            className="w-full btn-accent py-4 rounded-2xl text-[18px] font-bold disabled:opacity-40"
          >
            {finishing ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={20} className="animate-spin" />
                Guardando...
              </span>
            ) : allCompleted ? (
              "Terminar sesión"
            ) : (
              `Terminar (${sets.filter((s) => s.completed).length}/${sets.length} series)`
            )}
          </button>
        </div>
      </div>
    );
  }

  // ─── Home view ───────────────────────────────────
  return (
    <div className="px-5 pt-14 pb-4">
      <p className="text-secondary text-[16px]">
        {dayNames[today.getDay()]} {today.getDate()} de{" "}
        {monthNames[today.getMonth()]}
      </p>
      <h1 className="text-3xl font-bold text-primary mt-1 mb-2">
        {greeting()}
        {userName ? `, ${userName}` : ""}
      </h1>
      <p className="text-secondary text-[16px] mb-8">
        {routines.length > 0
          ? "¿Qué querés entrenar hoy?"
          : "Creá tu primera rutina para empezar"}
      </p>

      {saving && (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="text-accent animate-spin" />
        </div>
      )}

      {!saving && routines.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-elevated flex items-center justify-center mb-5">
            <Dumbbell size={36} className="text-muted" />
          </div>
          <p className="text-xl font-semibold text-primary mb-2">
            No tenés rutinas todavía
          </p>
          <p className="text-secondary text-[16px] max-w-[280px]">
            Andá a la pestaña <strong>Rutinas</strong> para crear tu primera
            rutina de entrenamiento.
          </p>
        </div>
      )}

      {!saving && routines.length > 0 && (
        <>
          {suggestedRoutine && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-violet" />
                <p className="text-[14px] font-medium text-violet">
                  Sugerida para hoy
                </p>
              </div>
              <button
                onClick={() => startWorkout(suggestedRoutine)}
                className="w-full bg-gradient-to-r from-violet/20 to-accent/20 border border-violet/30 rounded-2xl p-5 flex items-center gap-4 text-left active:scale-[0.98] transition-transform"
              >
                <div className="w-14 h-14 rounded-xl bg-violet/30 flex items-center justify-center flex-shrink-0">
                  <Dumbbell size={26} className="text-violet" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[18px] font-bold text-primary">
                    {suggestedRoutine.name}
                  </h3>
                  <p className="text-[14px] text-secondary mt-0.5">
                    {suggestedRoutine.exercises.length} ejercicios
                  </p>
                </div>
                <ChevronRight size={22} className="text-violet flex-shrink-0" />
              </button>
            </div>
          )}

          <p className="text-[14px] font-medium text-muted uppercase tracking-wider mb-3">
            Todas tus rutinas
          </p>
          <div className="space-y-3">
            {routines.map((routine) => (
              <button
                key={routine.id}
                onClick={() => startWorkout(routine)}
                className="w-full bg-card rounded-2xl p-5 flex items-center gap-4 border border-line text-left active:scale-[0.98] transition-transform"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Dumbbell size={22} className="text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[18px] font-semibold text-primary">
                    {routine.name}
                  </h3>
                  <p className="text-[14px] text-muted mt-0.5">
                    {routine.exercises.length} ejercicios
                  </p>
                </div>
                <ChevronRight size={20} className="text-muted flex-shrink-0" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
