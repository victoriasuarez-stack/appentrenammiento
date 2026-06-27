export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  equipment: string;
  cues: string[];
  isUnilateral?: boolean;
  isIsometric?: boolean;
}

export const EXERCISE_LIBRARY: Exercise[] = [
  {
    id: "squat-smith",
    name: "Sentadilla en Smith",
    muscle: "Cuádriceps / Glúteo",
    equipment: "Smith",
    cues: ["Pies adelantados al ancho de hombros", "Bajar hasta muslo paralelo", "Rodillas en línea con puntas de pies", "Empujar desde los talones"],
  },
  {
    id: "bulgarian-split",
    name: "Sentadilla búlgara",
    muscle: "Pierna (unilateral)",
    equipment: "Mancuernas",
    cues: ["Pie trasero apoyado en banco", "Torso erguido", "Rodilla delantera no pasa la punta del pie", "Bajar controlado"],
    isUnilateral: true,
  },
  {
    id: "step-up",
    name: "Subida al banco",
    muscle: "Pierna / Equilibrio",
    equipment: "Mancuernas",
    cues: ["Pie completo sobre el banco", "Empujar desde el talón", "No impulsar con la pierna de abajo", "Subir y bajar controlado"],
    isUnilateral: true,
  },
  {
    id: "calf-raise-standing",
    name: "Elevación de gemelos (de pie)",
    muscle: "Pantorrilla",
    equipment: "Smith / Mancuerna",
    cues: ["Subir hasta máxima contracción", "Bajar lento estirando bien", "Pausa arriba 1 segundo", "No flexionar rodillas"],
  },
  {
    id: "plank",
    name: "Plancha frontal",
    muscle: "Core",
    equipment: "Peso corporal",
    cues: ["Codos bajo los hombros", "Cuerpo en línea recta", "Apretar abdomen y glúteos", "No dejar caer la cadera"],
    isIsometric: true,
  },
  {
    id: "bench-press-smith",
    name: "Press de banca en Smith",
    muscle: "Pecho",
    equipment: "Smith",
    cues: ["Agarre al ancho de hombros", "Bajar la barra al pecho medio", "Pies firmes en el suelo", "Escápulas retraídas"],
  },
  {
    id: "dumbbell-row",
    name: "Remo con mancuerna (1 brazo)",
    muscle: "Espalda",
    equipment: "Mancuerna + banco",
    cues: ["Espalda paralela al suelo", "Tirar el codo hacia atrás", "Apretar escápula arriba", "No rotar el torso"],
    isUnilateral: true,
  },
  {
    id: "shoulder-press",
    name: "Press de hombros",
    muscle: "Hombros",
    equipment: "Mancuernas",
    cues: ["Sentado con espalda apoyada", "Mancuernas a la altura de orejas", "Empujar vertical", "No arquear la espalda"],
  },
  {
    id: "inverted-row-smith",
    name: "Remo invertido en Smith",
    muscle: "Espalda / Bíceps",
    equipment: "Smith",
    cues: ["Cuerpo recto como una tabla", "Tirar el pecho hacia la barra", "Apretar escápulas arriba", "Bajar controlado"],
  },
  {
    id: "bicep-curl",
    name: "Curl de bíceps",
    muscle: "Bíceps",
    equipment: "Mancuernas",
    cues: ["Codos pegados al cuerpo", "Subir contrayendo el bíceps", "No balancear el torso", "Bajar lento y controlado"],
  },
  {
    id: "tricep-extension",
    name: "Extensión de tríceps",
    muscle: "Tríceps",
    equipment: "Mancuerna",
    cues: ["Mancuerna detrás de la cabeza", "Codos apuntando al techo", "Extender solo el antebrazo", "No abrir los codos"],
  },
  {
    id: "bird-dog",
    name: "Bird-dog",
    muscle: "Core / Equilibrio",
    equipment: "Peso corporal",
    cues: ["En 4 puntos, espalda neutra", "Extender brazo y pierna opuestos", "Mantener 2-3 segundos", "No rotar la cadera"],
    isUnilateral: true,
  },
  {
    id: "rdl",
    name: "Peso muerto rumano",
    muscle: "Isquios / Glúteo",
    equipment: "Mancuernas",
    cues: ["Rodillas levemente flexionadas", "Bisagra de cadera, no de cintura", "Mancuernas cerca de las piernas", "Espalda recta siempre"],
  },
  {
    id: "hip-thrust-smith",
    name: "Hip thrust en Smith",
    muscle: "Glúteo",
    equipment: "Smith + banco",
    cues: ["Espalda alta apoyada en el banco", "Pies al ancho de cadera", "Empujar con los glúteos", "Apretar fuerte arriba 1 segundo"],
  },
  {
    id: "goblet-squat",
    name: "Sentadilla goblet",
    muscle: "Cuádriceps / Glúteo",
    equipment: "Mancuerna",
    cues: ["Mancuerna al pecho con ambas manos", "Codos entre las rodillas", "Pecho erguido", "Bajar hasta paralelo"],
  },
  {
    id: "glute-bridge-single",
    name: "Puente de glúteo (1 pierna)",
    muscle: "Glúteo / Isquios",
    equipment: "Peso corporal",
    cues: ["Acostado, una pierna extendida", "Empujar con el pie apoyado", "Apretar glúteo arriba", "Cadera nivelada, no rotar"],
    isUnilateral: true,
  },
  {
    id: "calf-raise-seated",
    name: "Elevación de gemelos sentado",
    muscle: "Pantorrilla (sóleo)",
    equipment: "Mancuerna",
    cues: ["Mancuerna sobre las rodillas", "Subir empujando con la punta", "Pausa arriba", "Rango completo"],
  },
  {
    id: "incline-press",
    name: "Press inclinado",
    muscle: "Pecho alto / Hombro",
    equipment: "Mancuernas",
    cues: ["Banco a 30-45 grados", "Mancuernas a la altura del pecho", "Empujar en arco hacia arriba", "Bajar controlado"],
  },
  {
    id: "row-smith",
    name: "Remo en Smith",
    muscle: "Espalda",
    equipment: "Smith",
    cues: ["Inclinado 45 grados", "Tirar la barra al ombligo", "Apretar escápulas", "No redondear la espalda"],
  },
  {
    id: "lateral-raise",
    name: "Elevaciones laterales",
    muscle: "Deltoide medio",
    equipment: "Mancuernas",
    cues: ["De pie, brazos a los lados", "Subir hasta la altura de hombros", "Codos levemente flexionados", "Bajar lento, no dejar caer"],
  },
  {
    id: "reverse-fly",
    name: "Pájaros (reverse fly)",
    muscle: "Deltoide posterior",
    equipment: "Mancuernas",
    cues: ["Inclinado hacia adelante", "Abrir brazos a los lados", "Apretar entre las escápulas", "Movimiento controlado"],
  },
  {
    id: "hammer-curl",
    name: "Curl martillo",
    muscle: "Bíceps / Antebrazo",
    equipment: "Mancuernas",
    cues: ["Agarre neutro (pulgares arriba)", "Codos pegados al cuerpo", "Subir controlado", "No balancear"],
  },
  {
    id: "explosive-step-up",
    name: "Subida explosiva al banco",
    muscle: "Potencia de pierna",
    equipment: "Peso corporal",
    cues: ["Subir con potencia y velocidad", "Extender completamente la pierna", "Bajar controlado", "Alternar piernas"],
    isUnilateral: true,
  },
  {
    id: "dead-bug",
    name: "Dead bug",
    muscle: "Core profundo",
    equipment: "Peso corporal",
    cues: ["Espalda baja pegada al suelo", "Extender brazo y pierna opuestos", "Movimiento lento y controlado", "Exhalar al extender"],
    isUnilateral: true,
  },
];

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISE_LIBRARY.find((e) => e.id === id);
}

export const MUSCLE_GROUPS = [
  "Todos",
  "Pierna",
  "Pecho",
  "Espalda",
  "Hombros",
  "Bíceps",
  "Tríceps",
  "Core",
  "Glúteo",
  "Pantorrilla",
] as const;
