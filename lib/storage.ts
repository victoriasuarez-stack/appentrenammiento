// ─── Storage Service ─────────────────────────────
// Single point of access to all persisted data.

export interface RoutineExercise {
  exerciseId: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  startingWeight: number;
}

export interface Routine {
  id: string;
  name: string;
  exercises: RoutineExercise[];
  createdAt: string;
}

export interface SetLog {
  weight: number;
  reps: number;
  completed: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  sets: SetLog[];
}

export interface Session {
  id: string;
  routineId: string;
  date: string;
  exercises: ExerciseLog[];
  completed: boolean;
}

export interface PersonalRecord {
  exerciseId: string;
  weight: number;
  reps: number;
  date: string;
}

export interface UserSettings {
  name: string;
  progressionPct: number;
  minWeightJump: number;
  fcMax: number;
}

// ─── Keys ────────────────────────────────────────

const KEYS = {
  routines: "gym-routines",
  sessions: "gym-sessions",
  currentWeights: "gym-current-weights",
  records: "gym-records",
  settings: "gym-settings",
  activeSession: "gym-active-session",
} as const;

// ─── Helpers ─────────────────────────────────────

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Routines ────────────────────────────────────

export function getRoutines(): Routine[] {
  return read<Routine[]>(KEYS.routines, []);
}

export function getRoutine(id: string): Routine | undefined {
  return getRoutines().find((r) => r.id === id);
}

export function saveRoutine(routine: Omit<Routine, "id" | "createdAt">): Routine {
  const full: Routine = {
    ...routine,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  const all = getRoutines();
  all.push(full);
  write(KEYS.routines, all);
  return full;
}

export function updateRoutine(id: string, updates: Partial<Omit<Routine, "id" | "createdAt">>): void {
  const all = getRoutines();
  const idx = all.findIndex((r) => r.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...updates };
    write(KEYS.routines, all);
  }
}

export function deleteRoutine(id: string): void {
  write(KEYS.routines, getRoutines().filter((r) => r.id !== id));
}

// ─── Sessions ────────────────────────────────────

export function getSessions(): Session[] {
  return read<Session[]>(KEYS.sessions, []);
}

export function getSessionsByRoutine(routineId: string): Session[] {
  return getSessions().filter((s) => s.routineId === routineId);
}

export function getLastSession(routineId: string): Session | undefined {
  const sessions = getSessionsByRoutine(routineId);
  return sessions.filter((s) => s.completed).sort((a, b) => b.date.localeCompare(a.date))[0];
}

export function startSession(routineId: string, exercises: ExerciseLog[]): Session {
  const session: Session = {
    id: generateId(),
    routineId,
    date: new Date().toISOString(),
    exercises,
    completed: false,
  };
  const all = getSessions();
  all.push(session);
  write(KEYS.sessions, all);
  write(KEYS.activeSession, session.id);
  return session;
}

export function updateSession(id: string, exercises: ExerciseLog[]): void {
  const all = getSessions();
  const session = all.find((s) => s.id === id);
  if (session) {
    session.exercises = exercises;
    write(KEYS.sessions, all);
  }
}

export function completeSession(id: string): void {
  const all = getSessions();
  const session = all.find((s) => s.id === id);
  if (session) {
    session.completed = true;
    write(KEYS.sessions, all);
    write(KEYS.activeSession, "");
    updateRecordsFromSession(session);
  }
}

export function getActiveSessionId(): string {
  return read<string>(KEYS.activeSession, "");
}

// ─── Current Weights ─────────────────────────────

export function getCurrentWeight(exerciseId: string): number {
  const weights = read<Record<string, number>>(KEYS.currentWeights, {});
  return weights[exerciseId] || 0;
}

export function setCurrentWeight(exerciseId: string, weight: number): void {
  const weights = read<Record<string, number>>(KEYS.currentWeights, {});
  weights[exerciseId] = weight;
  write(KEYS.currentWeights, weights);
}

// ─── Progression ─────────────────────────────────

export function suggestNextWeight(
  exerciseId: string,
  currentWeight: number,
  allSetsAtMax: boolean,
): number {
  if (!allSetsAtMax || currentWeight === 0) return currentWeight;
  const settings = getSettings();
  const increase = currentWeight * (settings.progressionPct / 100);
  const rounded = Math.ceil(increase / settings.minWeightJump) * settings.minWeightJump;
  return currentWeight + rounded;
}

// ─── Records ─────────────────────────────────────

export function getRecords(): PersonalRecord[] {
  return read<PersonalRecord[]>(KEYS.records, []);
}

export function getRecord(exerciseId: string): PersonalRecord | undefined {
  return getRecords().find((r) => r.exerciseId === exerciseId);
}

function updateRecordsFromSession(session: Session): void {
  const records = getRecords();
  for (const ex of session.exercises) {
    for (const set of ex.sets) {
      if (!set.completed || set.weight === 0) continue;
      const existing = records.find((r) => r.exerciseId === ex.exerciseId);
      if (!existing || set.weight > existing.weight) {
        if (existing) {
          existing.weight = set.weight;
          existing.reps = set.reps;
          existing.date = session.date;
        } else {
          records.push({
            exerciseId: ex.exerciseId,
            weight: set.weight,
            reps: set.reps,
            date: session.date,
          });
        }
      }
    }
  }
  write(KEYS.records, records);
}

// ─── Settings ────────────────────────────────────

const DEFAULT_SETTINGS: UserSettings = {
  name: "",
  progressionPct: 2.5,
  minWeightJump: 2.5,
  fcMax: 150,
};

export function getSettings(): UserSettings {
  return read<UserSettings>(KEYS.settings, DEFAULT_SETTINGS);
}

export function saveSettings(settings: Partial<UserSettings>): void {
  const current = getSettings();
  write(KEYS.settings, { ...current, ...settings });
}

// ─── Backup ──────────────────────────────────────

export function exportBackup(): string {
  const data = {
    routines: getRoutines(),
    sessions: getSessions(),
    currentWeights: read<Record<string, number>>(KEYS.currentWeights, {}),
    records: getRecords(),
    settings: getSettings(),
    exportDate: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

export function importBackup(json: string): boolean {
  try {
    const data = JSON.parse(json);
    if (data.routines) write(KEYS.routines, data.routines);
    if (data.sessions) write(KEYS.sessions, data.sessions);
    if (data.currentWeights) write(KEYS.currentWeights, data.currentWeights);
    if (data.records) write(KEYS.records, data.records);
    if (data.settings) write(KEYS.settings, data.settings);
    return true;
  } catch {
    return false;
  }
}
