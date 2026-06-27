import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));

const envFile = readFileSync(resolve(__dirname, "../.env.local"), "utf-8");
const env = {};
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, "");
}

const sql = `
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  progression_pct NUMERIC DEFAULT 2.5,
  min_weight_jump NUMERIC DEFAULT 2.5,
  fc_max INTEGER DEFAULT 150,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS routines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS routine_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  routine_id UUID REFERENCES routines(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  sets INTEGER DEFAULT 3,
  reps_min INTEGER DEFAULT 8,
  reps_max INTEGER DEFAULT 12,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS current_weights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  weight NUMERIC DEFAULT 0,
  UNIQUE(user_id, exercise_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  routine_id UUID REFERENCES routines(id) ON DELETE SET NULL,
  date TIMESTAMPTZ DEFAULT now(),
  completed BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS session_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  set_number INTEGER NOT NULL,
  weight NUMERIC DEFAULT 0,
  reps INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS personal_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  weight NUMERIC NOT NULL,
  reps INTEGER NOT NULL,
  date TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, exercise_id)
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE current_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS allow_all_users ON users;
CREATE POLICY allow_all_users ON users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS allow_all_routines ON routines;
CREATE POLICY allow_all_routines ON routines FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS allow_all_routine_exercises ON routine_exercises;
CREATE POLICY allow_all_routine_exercises ON routine_exercises FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS allow_all_current_weights ON current_weights;
CREATE POLICY allow_all_current_weights ON current_weights FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS allow_all_sessions ON sessions;
CREATE POLICY allow_all_sessions ON sessions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS allow_all_session_sets ON session_sets;
CREATE POLICY allow_all_session_sets ON session_sets FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS allow_all_personal_records ON personal_records;
CREATE POLICY allow_all_personal_records ON personal_records FOR ALL USING (true) WITH CHECK (true);
`;

async function run() {
  const client = new pg.Client({ connectionString: env.POSTGRES_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log("Connected. Running migration...");
  await client.query(sql);
  console.log("Migration complete! Tables created:");
  const res = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
  res.rows.forEach(r => console.log("  -", r.tablename));
  await client.end();
}

run().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
