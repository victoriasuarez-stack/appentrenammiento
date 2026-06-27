"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/contexts/user-context";
import {
  fetchRoutines,
  createRoutine,
  editRoutine,
  removeRoutine,
  fetchCurrentWeights,
  saveCurrentWeight,
} from "@/lib/supabase-storage";
import type { Routine, RoutineExercise } from "@/lib/storage";
import {
  EXERCISE_LIBRARY,
  MUSCLE_GROUPS,
  getExerciseById,
  type Exercise,
} from "@/lib/exercises";
import {
  Plus,
  X,
  ChevronLeft,
  Trash2,
  Search,
  Check,
  Minus,
  Pencil,
  Loader2,
  Play,
} from "lucide-react";

type View = "list" | "create" | "browse" | "detail";

export default function RoutinesTab() {
  const { userId } = useUser();
  const [view, setView] = useState<View>("list");
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [routineName, setRoutineName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<RoutineExercise[]>([]);
  const [muscleFilter, setMuscleFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [detailRoutine, setDetailRoutine] = useState<Routine | null>(null);
  const [editingWeights, setEditingWeights] = useState<Record<string, number>>({});

  const loadRoutines = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const data = await fetchRoutines(userId);
    setRoutines(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadRoutines();
  }, [loadRoutines]);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    await removeRoutine(id);
    setConfirmDeleteId(null);
    if (detailRoutine?.id === id) {
      setDetailRoutine(null);
      setView("list");
    }
    loadRoutines();
  }

  function toggleExercise(exercise: Exercise) {
    const exists = selectedExercises.find((e) => e.exerciseId === exercise.id);
    if (exists) {
      setSelectedExercises(selectedExercises.filter((e) => e.exerciseId !== exercise.id));
    } else {
      setSelectedExercises([
        ...selectedExercises,
        { exerciseId: exercise.id, sets: 3, repsMin: 8, repsMax: 12, startingWeight: 0 },
      ]);
    }
  }

  function updateExerciseField(
    exerciseId: string,
    field: keyof Omit<RoutineExercise, "exerciseId">,
    value: number,
  ) {
    setSelectedExercises(
      selectedExercises.map((e) =>
        e.exerciseId === exerciseId ? { ...e, [field]: Math.max(0, value) } : e,
      ),
    );
  }

  async function handleSave() {
    if (!routineName.trim() || selectedExercises.length === 0 || !userId) return;
    setSaving(true);
    if (detailRoutine) {
      await editRoutine(detailRoutine.id, routineName.trim(), selectedExercises);
      setDetailRoutine(null);
    } else {
      await createRoutine(userId, routineName.trim(), selectedExercises);
    }
    setRoutineName("");
    setSelectedExercises([]);
    await loadRoutines();
    setSaving(false);
    setView("list");
  }

  function startCreate() {
    setRoutineName("");
    setSelectedExercises([]);
    setDetailRoutine(null);
    setView("create");
  }

  async function openDetail(routine: Routine) {
    if (!userId) return;
    setDetailRoutine(routine);
    const weights = await fetchCurrentWeights(userId);
    const mapped: Record<string, number> = {};
    routine.exercises.forEach((re) => {
      mapped[re.exerciseId] = weights[re.exerciseId] || re.startingWeight;
    });
    setEditingWeights(mapped);
    setView("detail");
  }

  async function saveWeights() {
    if (!detailRoutine || !userId) return;
    setSaving(true);
    for (const [exerciseId, weight] of Object.entries(editingWeights)) {
      await saveCurrentWeight(userId, exerciseId, weight);
    }
    setSaving(false);
    setView("list");
  }

  function startEdit() {
    if (!detailRoutine) return;
    setRoutineName(detailRoutine.name);
    setSelectedExercises([...detailRoutine.exercises]);
    setView("create");
  }

  const filteredLibrary = EXERCISE_LIBRARY.filter((e) => {
    const matchesMuscle = muscleFilter === "Todos" || e.muscle.toLowerCase().includes(muscleFilter.toLowerCase());
    const matchesSearch = !search || e.name.toLowerCase().includes(search.toLowerCase());
    return matchesMuscle && matchesSearch;
  });

  // ── Routine detail ────────────────────────────────
  if (view === "detail" && detailRoutine) {
    return (
      <div className="px-5 pt-14 pb-4">
        <button
          onClick={() => setView("list")}
          className="flex items-center gap-1 text-accent mb-4"
        >
          <ChevronLeft size={20} />
          <span>Volver</span>
        </button>

        <div className="flex items-start justify-between mb-6">
          <h1 className="text-2xl font-bold text-primary">{detailRoutine.name}</h1>
          <button
            onClick={startEdit}
            className="flex items-center gap-1 text-accent text-[15px] font-medium"
          >
            <Pencil size={16} />
            Editar
          </button>
        </div>

        <p className="text-secondary text-[15px] mb-5">
          {detailRoutine.exercises.length} ejercicios · Ajustá el peso de cada uno
        </p>

        <div className="space-y-3 mb-6">
          {detailRoutine.exercises.map((re) => {
            const ex = getExerciseById(re.exerciseId);
            if (!ex) return null;
            const weight = editingWeights[re.exerciseId] ?? 0;
            return (
              <div key={re.exerciseId} className="bg-card border border-line rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-primary font-medium">{ex.name}</p>
                    <p className="text-[13px] text-muted">{ex.muscle} · {ex.equipment}</p>
                  </div>
                  {ex.video && (
                    <a
                      href={ex.video}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-violet/20 flex items-center justify-center flex-shrink-0"
                    >
                      <Play size={14} className="text-violet" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-[12px] text-muted mb-1">Series × Reps</p>
                    <p className="text-primary text-[16px]">
                      {re.sets} × {re.repsMin}-{re.repsMax}
                    </p>
                  </div>

                  <div className="flex-1">
                    <p className="text-[12px] text-muted mb-1">Peso (kg)</p>
                    <div className="flex items-center bg-elevated rounded-lg">
                      <button
                        onClick={() =>
                          setEditingWeights({
                            ...editingWeights,
                            [re.exerciseId]: Math.max(0, weight - 2.5),
                          })
                        }
                        className="p-2 text-muted"
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="number"
                        value={weight}
                        onChange={(e) =>
                          setEditingWeights({
                            ...editingWeights,
                            [re.exerciseId]: Math.max(0, Number(e.target.value)),
                          })
                        }
                        className="w-16 text-center bg-transparent text-accent text-[18px] font-bold"
                      />
                      <button
                        onClick={() =>
                          setEditingWeights({
                            ...editingWeights,
                            [re.exerciseId]: weight + 2.5,
                          })
                        }
                        className="p-2 text-muted"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={saveWeights}
          disabled={saving}
          className="w-full btn-accent py-4 rounded-2xl text-[18px] font-bold disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar pesos"}
        </button>

        <button
          onClick={() => setConfirmDeleteId(detailRoutine.id)}
          className="w-full mt-3 py-3 rounded-2xl text-[16px] text-red-400 font-medium"
        >
          Eliminar rutina
        </button>

        {confirmDeleteId && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6">
            <div className="bg-card border border-line rounded-2xl p-6 max-w-sm w-full">
              <h3 className="text-[18px] font-bold text-primary mb-2">
                Eliminar rutina
              </h3>
              <p className="text-secondary text-[15px] mb-6">
                ¿Seguro que querés eliminar esta rutina? No se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 bg-elevated border border-line rounded-xl py-3 text-primary font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(confirmDeleteId)}
                  className="flex-1 bg-red-500/20 border border-red-500/40 rounded-xl py-3 text-red-400 font-medium"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Exercise browser ─────────────────────────────
  if (view === "browse") {
    return (
      <div className="px-5 pt-14 pb-4">
        <button
          onClick={() => setView("create")}
          className="flex items-center gap-1 text-accent mb-4"
        >
          <ChevronLeft size={20} />
          <span>Volver</span>
        </button>

        <h1 className="text-2xl font-bold text-primary mb-5">Ejercicios</h1>

        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Buscar ejercicio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-line rounded-xl pl-10 pr-4 py-3 text-primary placeholder:text-muted"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-5 pb-1">
          {MUSCLE_GROUPS.map((group) => (
            <button
              key={group}
              onClick={() => setMuscleFilter(group)}
              className={`px-3 py-1.5 rounded-full text-[14px] font-medium whitespace-nowrap transition-colors ${
                muscleFilter === group
                  ? "bg-accent text-deep"
                  : "bg-elevated text-secondary"
              }`}
            >
              {group}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filteredLibrary.map((exercise) => {
            const isSelected = selectedExercises.some((e) => e.exerciseId === exercise.id);
            return (
              <div
                key={exercise.id}
                className={`w-full rounded-xl p-4 flex items-center gap-3 text-left transition-colors border ${
                  isSelected
                    ? "bg-accent/15 border-accent/40"
                    : "bg-card border-line"
                }`}
              >
                <button
                  onClick={() => toggleExercise(exercise)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isSelected ? "bg-accent" : "bg-elevated"
                  }`}
                >
                  {isSelected && <Check size={16} className="text-deep" />}
                </button>
                <button
                  onClick={() => toggleExercise(exercise)}
                  className="flex-1 min-w-0 text-left"
                >
                  <p className="text-primary font-medium">{exercise.name}</p>
                  <p className="text-[13px] text-muted mt-0.5">
                    {exercise.muscle} · {exercise.equipment}
                  </p>
                </button>
                {exercise.video && (
                  <a
                    href={exercise.video}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-8 h-8 rounded-lg bg-violet/20 flex items-center justify-center flex-shrink-0"
                  >
                    <Play size={14} className="text-violet" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Create / edit routine ────────────────────────
  if (view === "create") {
    return (
      <div className="px-5 pt-14 pb-4">
        <button
          onClick={() => { setDetailRoutine(null); setView("list"); }}
          className="flex items-center gap-1 text-accent mb-4"
        >
          <ChevronLeft size={20} />
          <span>Cancelar</span>
        </button>

        <h1 className="text-2xl font-bold text-primary mb-6">
          {detailRoutine ? "Editar rutina" : "Nueva rutina"}
        </h1>

        <input
          type="text"
          placeholder="Nombre de la rutina"
          value={routineName}
          onChange={(e) => setRoutineName(e.target.value)}
          className="w-full bg-card border border-line rounded-xl px-4 py-3 text-primary placeholder:text-muted mb-6"
        />

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-semibold text-primary">
            Ejercicios ({selectedExercises.length})
          </h2>
          <button
            onClick={() => setView("browse")}
            className="flex items-center gap-1 text-accent text-[15px] font-medium"
          >
            <Plus size={18} />
            Agregar
          </button>
        </div>

        {selectedExercises.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted">No hay ejercicios. Tocá &ldquo;Agregar&rdquo; para buscar.</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {selectedExercises.map((re) => {
              const ex = getExerciseById(re.exerciseId);
              if (!ex) return null;
              return (
                <div key={re.exerciseId} className="bg-card border border-line rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-primary font-medium">{ex.name}</p>
                      <p className="text-[13px] text-muted">{ex.muscle}</p>
                    </div>
                    <button
                      onClick={() =>
                        setSelectedExercises(
                          selectedExercises.filter((e) => e.exerciseId !== re.exerciseId),
                        )
                      }
                      className="text-muted p-1"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <NumberField
                      label="Series"
                      value={re.sets}
                      onChange={(v) => updateExerciseField(re.exerciseId, "sets", v)}
                    />
                    <NumberField
                      label="Rep mín"
                      value={re.repsMin}
                      onChange={(v) => updateExerciseField(re.exerciseId, "repsMin", v)}
                    />
                    <NumberField
                      label="Rep máx"
                      value={re.repsMax}
                      onChange={(v) => updateExerciseField(re.exerciseId, "repsMax", v)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={!routineName.trim() || selectedExercises.length === 0 || saving}
          className="w-full btn-accent py-4 rounded-2xl text-[18px] font-bold disabled:opacity-40"
        >
          {saving ? "Guardando..." : "Guardar rutina"}
        </button>
      </div>
    );
  }

  // ── Routine list ─────────────────────────────────
  return (
    <div className="px-5 pt-14 pb-4">
      <h1 className="text-3xl font-bold text-primary mb-8">Rutinas</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="text-accent animate-spin" />
        </div>
      ) : routines.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl font-semibold text-primary mb-2">
            Creá tu primera rutina
          </p>
          <p className="text-secondary text-[16px] mb-6 max-w-[280px] mx-auto">
            Armá una rutina personalizada eligiendo los ejercicios que quieras.
          </p>
          <button
            onClick={startCreate}
            className="btn-accent px-6 py-3 rounded-xl text-[16px] font-semibold inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Nueva rutina
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {routines.map((routine) => (
              <button
                key={routine.id}
                onClick={() => openDetail(routine)}
                className="w-full bg-card rounded-2xl p-5 border border-line text-left active:scale-[0.98] transition-transform"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-[18px] font-semibold text-primary">{routine.name}</h3>
                  <span
                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(routine.id); }}
                    className="text-muted p-1"
                  >
                    <Trash2 size={18} />
                  </span>
                </div>
                <p className="text-[14px] text-muted">
                  {routine.exercises.length} ejercicios
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {routine.exercises.slice(0, 4).map((re) => {
                    const ex = getExerciseById(re.exerciseId);
                    return ex ? (
                      <span key={re.exerciseId} className="text-[12px] text-secondary bg-elevated px-2 py-1 rounded-md">
                        {ex.name}
                      </span>
                    ) : null;
                  })}
                  {routine.exercises.length > 4 && (
                    <span className="text-[12px] text-muted bg-elevated px-2 py-1 rounded-md">
                      +{routine.exercises.length - 4} más
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={startCreate}
            className="w-full btn-accent py-4 rounded-2xl text-[18px] font-bold inline-flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Nueva rutina
          </button>
        </>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6">
          <div className="bg-card border border-line rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-[18px] font-bold text-primary mb-2">
              Eliminar rutina
            </h3>
            <p className="text-secondary text-[15px] mb-6">
              ¿Seguro que querés eliminar esta rutina? No se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 bg-elevated border border-line rounded-xl py-3 text-primary font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="flex-1 bg-red-500/20 border border-red-500/40 rounded-xl py-3 text-red-400 font-medium"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <p className="text-[12px] text-muted mb-1">{label}</p>
      <div className="flex items-center bg-elevated rounded-lg">
        <button
          onClick={() => onChange(value - 1)}
          className="p-2 text-muted"
        >
          <Minus size={14} />
        </button>
        <span className="flex-1 text-center text-primary text-[16px] font-medium">
          {value}
        </span>
        <button
          onClick={() => onChange(value + 1)}
          className="p-2 text-muted"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
