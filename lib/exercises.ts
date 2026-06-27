export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  equipment: string;
  cues: string[];
  video?: string;
  isUnilateral?: boolean;
}

export const EXERCISE_LIBRARY: Exercise[] = [
  // ─── Día 1 · Cuádriceps ─────────────────────────
  {
    id: "sentadilla-frontal",
    name: "Sentadilla frontal / high-bar",
    muscle: "Cuádriceps",
    equipment: "Barra",
    cues: ["Compuesto principal", "Torso vertical, codos altos"],
    video: "https://www.youtube.com/watch?v=oP-3qImhJ4E",
  },
  {
    id: "prensa-piernas",
    name: "Prensa de piernas",
    muscle: "Cuádriceps",
    equipment: "Máquina",
    cues: ["Pies al ancho de hombros para foco en cuádriceps"],
    video: "https://www.youtube.com/watch?v=ccDlOeZ90hs",
  },
  {
    id: "sentadilla-bulgara",
    name: "Sentadilla búlgara",
    muscle: "Cuádriceps / Glúteo",
    equipment: "Mancuernas",
    cues: ["Pie más cerca = más cuádriceps", "Pie más lejos + torso adelante = más glúteo"],
    video: "https://www.youtube.com/watch?v=qs-adxsCIrc",
    isUnilateral: true,
  },
  {
    id: "extension-cuadriceps",
    name: "Extensión de cuádriceps",
    muscle: "Cuádriceps",
    equipment: "Máquina",
    cues: ["Aislamiento", "Apretá arriba 1-2 seg"],
    video: "https://www.youtube.com/watch?v=MyeQ1zCcfas",
  },

  // ─── Día 2 · Isquiotibiales ─────────────────────
  {
    id: "rdl",
    name: "Peso muerto rumano (RDL)",
    muscle: "Isquiotibiales / Glúteo",
    equipment: "Barra / Mancuernas",
    cues: ["Cadera atrás, rodilla casi recta", "Estirá el posterior"],
    video: "https://www.youtube.com/watch?v=TdGndL9bSmo",
  },
  {
    id: "curl-femoral-sentado",
    name: "Curl femoral sentado",
    muscle: "Isquiotibiales",
    equipment: "Máquina",
    cues: ["Mejor que el acostado para crecer (estudio Maeo)"],
    video: "https://www.youtube.com/watch?v=btw83p9ffTU",
  },
  {
    id: "curl-femoral-acostado",
    name: "Curl femoral acostado",
    muscle: "Isquiotibiales",
    equipment: "Máquina",
    cues: ["Variá el ángulo", "No despegues la cadera del banco"],
    video: "https://www.youtube.com/shorts/6JQflLWhKfg",
  },

  // ─── Día 3 · Glúteos ────────────────────────────
  {
    id: "hip-thrust",
    name: "Hip thrust con barra",
    muscle: "Glúteos",
    equipment: "Barra + banco",
    cues: ["Apretá glúteo arriba 1-2 seg", "Mentón al pecho"],
    video: "https://www.youtube.com/watch?v=lmUx6WAV-BQ",
  },
  {
    id: "hiperextensiones",
    name: "Hiperextensiones",
    muscle: "Glúteos",
    equipment: "Banco 45°",
    cues: ["Espalda algo redondeada para sacar carga lumbar"],
    video: "https://www.youtube.com/watch?v=I5rmcAQg5bY",
  },
  {
    id: "abduccion-cadera",
    name: "Abducción de cadera en máquina",
    muscle: "Glúteos",
    equipment: "Máquina",
    cues: ["Foco glúteo medio", "Cierre lento y controlado"],
    video: "https://www.youtube.com/watch?v=2vCRMi-lgJ4",
  },

  // ─── Día 4 · Pecho + Hombros + Tríceps ──────────
  {
    id: "press-banca",
    name: "Press de banca plano",
    muscle: "Pecho",
    equipment: "Barra / Smith",
    cues: ["Bajá a la parte baja del pecho", "Codos ~45°"],
    video: "https://www.youtube.com/watch?v=3k1WyyqWk-s",
  },
  {
    id: "press-inclinado",
    name: "Press inclinado con mancuernas",
    muscle: "Pecho",
    equipment: "Mancuernas + banco",
    cues: ["Pectoral superior", "Banco a 30°"],
    video: "https://www.youtube.com/watch?v=sL6xN9EVDfE",
  },
  {
    id: "aperturas-fly",
    name: "Aperturas / fly",
    muscle: "Pecho",
    equipment: "Mancuernas",
    cues: ["Estiramiento profundo", "Codos semiflexionados"],
    video: "https://www.youtube.com/watch?v=fHmiVMFfKkE",
  },
  {
    id: "press-militar",
    name: "Press militar",
    muscle: "Hombros",
    equipment: "Barra / Mancuernas",
    cues: ["Press vertical de hombro"],
    video: "https://www.youtube.com/playlist?list=PLEPKqOCM58rickQMUnZMQkyohF_EpaIK9",
  },
  {
    id: "elevaciones-laterales",
    name: "Elevaciones laterales",
    muscle: "Hombros",
    equipment: "Mancuernas",
    cues: ["Lo que más ancho da al hombro", "Sin impulso"],
    video: "https://www.youtube.com/playlist?list=PLEPKqOCM58rickQMUnZMQkyohF_EpaIK9",
  },
  {
    id: "press-frances",
    name: "Press francés (tríceps)",
    muscle: "Tríceps",
    equipment: "Barra / Mancuerna",
    cues: ["En banco inclinado estira más la cabeza larga"],
    video: "https://www.youtube.com/watch?v=PTO862T8U7Y",
  },
  {
    id: "extension-triceps-polea",
    name: "Extensión de tríceps en polea",
    muscle: "Tríceps",
    equipment: "Polea",
    cues: ["Codos pegados al cuerpo", "Solo mueve el antebrazo"],
    video: "https://www.youtube.com/watch?v=KQL18Jw9-r4",
  },

  // ─── Día 5 · Espalda + Bíceps ───────────────────
  {
    id: "jalon-pecho",
    name: "Jalón al pecho (lat pulldown)",
    muscle: "Espalda",
    equipment: "Polea / Máquina",
    cues: ["Ancho / V-taper", "Bajá la barra al pecho"],
    video: "https://www.youtube.com/watch?v=aPe_w7K7tWg",
  },
  {
    id: "remo-barra",
    name: "Remo con barra",
    muscle: "Espalda",
    equipment: "Barra",
    cues: ["Grosor", "Tirá al ombligo, codos pegados"],
    video: "https://www.youtube.com/watch?v=nQSi7XLixYU",
  },
  {
    id: "remo-polea",
    name: "Remo en polea sentado",
    muscle: "Espalda",
    equipment: "Polea",
    cues: ["Mismo patrón que el remo con barra"],
    video: "https://www.youtube.com/watch?v=nQSi7XLixYU",
  },
  {
    id: "face-pull",
    name: "Face pull",
    muscle: "Hombros",
    equipment: "Polea",
    cues: ["Deltoides posterior y salud de hombro"],
    video: "https://www.youtube.com/watch?v=Vp4K-fLzjzg",
  },
  {
    id: "curl-inclinado",
    name: "Curl inclinado / Bayesian",
    muscle: "Bíceps",
    equipment: "Mancuernas / Polea",
    cues: ["Rango estirado = más crecimiento"],
    video: "https://www.youtube.com/playlist?list=PLmY483Js7scPrtVL3LO50FFTaeCQQDPVq",
  },
  {
    id: "curl-predicador",
    name: "Curl predicador o concentración",
    muscle: "Bíceps",
    equipment: "Mancuerna / Máquina",
    cues: ["Cierre y aislamiento, sin trampa"],
    video: "https://www.youtube.com/playlist?list=PLmY483Js7scPrtVL3LO50FFTaeCQQDPVq",
  },
];

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISE_LIBRARY.find((e) => e.id === id);
}

export const MUSCLE_GROUPS = [
  "Todos",
  "Cuádriceps",
  "Isquiotibiales",
  "Glúteos",
  "Pecho",
  "Hombros",
  "Tríceps",
  "Espalda",
  "Bíceps",
] as const;
