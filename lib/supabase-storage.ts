import { supabase } from "./supabase";
import type { Routine, RoutineExercise, UserSettings } from "./storage";

// ─── User ───────────────────────────────────────

const USER_KEY = "gym-user-id";

export async function getOrCreateUser(name?: string): Promise<string> {
  const stored = localStorage.getItem(USER_KEY);
  if (stored) return stored;

  const { data, error } = await supabase
    .from("users")
    .insert({ name: name || "" })
    .select("id")
    .single();

  if (error) throw error;
  localStorage.setItem(USER_KEY, data.id);
  return data.id;
}

export function getLocalUserId(): string | null {
  return localStorage.getItem(USER_KEY);
}

// ─── Routines ───────────────────────────────────

export async function fetchRoutines(userId: string): Promise<Routine[]> {
  const { data: routines, error } = await supabase
    .from("routines")
    .select("id, name, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const result: Routine[] = [];
  for (const r of routines || []) {
    const { data: exercises } = await supabase
      .from("routine_exercises")
      .select("exercise_id, sets, reps_min, reps_max, sort_order")
      .eq("routine_id", r.id)
      .order("sort_order");

    result.push({
      id: r.id,
      name: r.name,
      createdAt: r.created_at,
      exercises: (exercises || []).map((e) => ({
        exerciseId: e.exercise_id,
        sets: e.sets,
        repsMin: e.reps_min,
        repsMax: e.reps_max,
        startingWeight: 0,
      })),
    });
  }
  return result;
}

export async function createRoutine(
  userId: string,
  name: string,
  exercises: RoutineExercise[],
): Promise<string> {
  const { data, error } = await supabase
    .from("routines")
    .insert({ user_id: userId, name })
    .select("id")
    .single();

  if (error) throw error;

  const rows = exercises.map((e, i) => ({
    routine_id: data.id,
    exercise_id: e.exerciseId,
    sets: e.sets,
    reps_min: e.repsMin,
    reps_max: e.repsMax,
    sort_order: i,
  }));

  await supabase.from("routine_exercises").insert(rows);
  return data.id;
}

export async function editRoutine(
  routineId: string,
  name: string,
  exercises: RoutineExercise[],
): Promise<void> {
  await supabase.from("routines").update({ name }).eq("id", routineId);
  await supabase.from("routine_exercises").delete().eq("routine_id", routineId);

  const rows = exercises.map((e, i) => ({
    routine_id: routineId,
    exercise_id: e.exerciseId,
    sets: e.sets,
    reps_min: e.repsMin,
    reps_max: e.repsMax,
    sort_order: i,
  }));

  await supabase.from("routine_exercises").insert(rows);
}

export async function removeRoutine(routineId: string): Promise<void> {
  await supabase.from("routines").delete().eq("id", routineId);
}

// ─── Weights ────────────────────────────────────

export async function fetchCurrentWeights(
  userId: string,
): Promise<Record<string, number>> {
  const { data } = await supabase
    .from("current_weights")
    .select("exercise_id, weight")
    .eq("user_id", userId);

  const weights: Record<string, number> = {};
  (data || []).forEach((row) => {
    weights[row.exercise_id] = Number(row.weight);
  });
  return weights;
}

export async function saveCurrentWeight(
  userId: string,
  exerciseId: string,
  weight: number,
): Promise<void> {
  await supabase.from("current_weights").upsert(
    { user_id: userId, exercise_id: exerciseId, weight },
    { onConflict: "user_id,exercise_id" },
  );
}

// ─── Sessions ───────────────────────────────────

export async function createSession(
  userId: string,
  routineId: string,
  exercises: { exerciseId: string; sets: number }[],
): Promise<string> {
  const { data, error } = await supabase
    .from("sessions")
    .insert({ user_id: userId, routine_id: routineId })
    .select("id")
    .single();

  if (error) throw error;

  const rows: {
    session_id: string;
    exercise_id: string;
    set_number: number;
    weight: number;
    reps: number;
    completed: boolean;
  }[] = [];

  for (const ex of exercises) {
    for (let s = 1; s <= ex.sets; s++) {
      rows.push({
        session_id: data.id,
        exercise_id: ex.exerciseId,
        set_number: s,
        weight: 0,
        reps: 0,
        completed: false,
      });
    }
  }

  await supabase.from("session_sets").insert(rows);
  return data.id;
}

export async function completeSession(sessionId: string): Promise<void> {
  await supabase.from("sessions").update({ completed: true }).eq("id", sessionId);
}

export async function fetchSessions(userId: string) {
  const { data } = await supabase
    .from("sessions")
    .select("id, routine_id, date, completed")
    .eq("user_id", userId)
    .eq("completed", true)
    .order("date", { ascending: false })
    .limit(20);

  return data || [];
}

// ─── Records ────────────────────────────────────

export async function fetchRecords(userId: string) {
  const { data } = await supabase
    .from("personal_records")
    .select("exercise_id, weight, reps, date")
    .eq("user_id", userId);

  return data || [];
}

export async function upsertRecord(
  userId: string,
  exerciseId: string,
  weight: number,
  reps: number,
): Promise<void> {
  await supabase.from("personal_records").upsert(
    { user_id: userId, exercise_id: exerciseId, weight, reps, date: new Date().toISOString() },
    { onConflict: "user_id,exercise_id" },
  );
}

// ─── Settings ───────────────────────────────────

export async function fetchSettings(userId: string): Promise<UserSettings> {
  const { data } = await supabase
    .from("users")
    .select("name, progression_pct, min_weight_jump, fc_max")
    .eq("id", userId)
    .single();

  if (!data) return { name: "", progressionPct: 2.5, minWeightJump: 2.5, fcMax: 150 };
  return {
    name: data.name,
    progressionPct: Number(data.progression_pct),
    minWeightJump: Number(data.min_weight_jump),
    fcMax: data.fc_max,
  };
}

export async function updateSettings(
  userId: string,
  settings: Partial<UserSettings>,
): Promise<void> {
  const update: Record<string, unknown> = {};
  if (settings.name !== undefined) update.name = settings.name;
  if (settings.progressionPct !== undefined) update.progression_pct = settings.progressionPct;
  if (settings.minWeightJump !== undefined) update.min_weight_jump = settings.minWeightJump;
  if (settings.fcMax !== undefined) update.fc_max = settings.fcMax;

  await supabase.from("users").update(update).eq("id", userId);
}
