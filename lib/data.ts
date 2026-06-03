export const userData = {
  name: "Carlos Méndez",
  email: "carlos@empresa.com",
  role: "Desarrollador Senior",
  avatar: "CM",
  joinDate: "Enero 2024",
  age: 32,
  height: "178 cm",
  weight: "82 kg",
  goal: "Prevenir lumbalgia y mejorar postura",
  streak: 12,
  totalSessions: 47,
  goalsCompleted: 8,
  totalGoals: 10,
};

export const weeklyStats = [
  { day: "Lun", minutes: 25, calories: 120 },
  { day: "Mar", minutes: 0, calories: 0 },
  { day: "Mié", minutes: 30, calories: 145 },
  { day: "Jue", minutes: 20, calories: 95 },
  { day: "Vie", minutes: 35, calories: 170 },
  { day: "Sáb", minutes: 45, calories: 210 },
  { day: "Dom", minutes: 0, calories: 0 },
];

export const monthlyProgress = [
  { month: "Ene", sessions: 8, goals: 1 },
  { month: "Feb", sessions: 12, goals: 2 },
  { month: "Mar", sessions: 10, goals: 1 },
  { month: "Abr", sessions: 15, goals: 2 },
  { month: "May", sessions: 18, goals: 2 },
  { month: "Jun", sessions: 14, goals: 1 },
];

export const homeRoutines = [
  {
    id: 1,
    title: "Movilidad Matutina",
    description: "Rutina de activación para empezar el día en la oficina",
    duration: "15 min",
    level: "Principiante",
    category: "hogar",
    exercises: [
      { name: "Rotación de cuello", sets: 1, reps: "10 cada lado", icon: "🔄" },
      { name: "Apertura de pecho", sets: 2, reps: "30 seg", icon: "💪" },
      { name: "Estiramiento lumbar", sets: 2, reps: "45 seg", icon: "🧘" },
      { name: "Rotación de cadera", sets: 1, reps: "10 cada lado", icon: "🔄" },
      { name: "Estiramiento de isquiotibiales", sets: 2, reps: "30 seg", icon: "🦵" },
    ],
  },
  {
    id: 2,
    title: "Pausa Activa Oficina",
    description: "Ejercicios rápidos para hacer en tu escritorio",
    duration: "10 min",
    level: "Principiante",
    category: "hogar",
    exercises: [
      { name: "Elevación de hombros", sets: 2, reps: "15", icon: "⬆️" },
      { name: "Estiramiento de muñecas", sets: 2, reps: "30 seg", icon: "🤲" },
      { name: "Flexión de piernas sentado", sets: 2, reps: "20", icon: "🦵" },
      { name: "Rotación de tobillos", sets: 1, reps: "10 cada lado", icon: "🔄" },
    ],
  },
  {
    id: 3,
    title: "Core Antilesión",
    description: "Fortalece tu core para proteger la espalda baja",
    duration: "20 min",
    level: "Intermedio",
    category: "hogar",
    exercises: [
      { name: "Plancha frontal", sets: 3, reps: "30 seg", icon: "🏋️" },
      { name: "Bird-dog", sets: 3, reps: "10 cada lado", icon: "🐦" },
      { name: "Puente de glúteos", sets: 3, reps: "15", icon: "🌉" },
      { name: "Dead bug", sets: 3, reps: "10 cada lado", icon: "🐛" },
      { name: "Superman", sets: 2, reps: "12", icon: "🦸" },
    ],
  },
  {
    id: 4,
    title: "Relajación Nocturna",
    description: "Estira y relaja los músculos tensos después del trabajo",
    duration: "25 min",
    level: "Principiante",
    category: "hogar",
    exercises: [
      { name: "Postura del niño", sets: 1, reps: "60 seg", icon: "🧘" },
      { name: "Torsión espinal", sets: 2, reps: "45 seg cada lado", icon: "🔄" },
      { name: "Estiramiento de palomas", sets: 2, reps: "60 seg cada lado", icon: "🕊️" },
      { name: "Piernas en la pared", sets: 1, reps: "3 min", icon: "🧘" },
    ],
  },
];

export const gymRoutines = [
  {
    id: 5,
    title: "Fuerza Funcional A",
    description: "Día A de fuerza para oficinistas - enfoque en cadena posterior",
    duration: "50 min",
    level: "Intermedio",
    category: "gimnasio",
    exercises: [
      { name: "Peso muerto rumano", sets: 4, reps: "10", icon: "🏋️" },
      { name: "Remo en polea baja", sets: 4, reps: "12", icon: "💪" },
      { name: "Face pull", sets: 3, reps: "15", icon: "🎯" },
      { name: "Hip thrust", sets: 4, reps: "12", icon: "🌉" },
      { name: "Plancha con peso", sets: 3, reps: "30 seg", icon: "⚖️" },
    ],
  },
  {
    id: 6,
    title: "Fuerza Funcional B",
    description: "Día B de fuerza - enfoque en cadena anterior y movilidad",
    duration: "55 min",
    level: "Intermedio",
    category: "gimnasio",
    exercises: [
      { name: "Sentadilla goblet", sets: 4, reps: "12", icon: "🏋️" },
      { name: "Press de hombro sentado", sets: 3, reps: "12", icon: "💪" },
      { name: "Jalón al pecho neutro", sets: 4, reps: "10", icon: "📉" },
      { name: "Zancadas caminando", sets: 3, reps: "12 cada lado", icon: "🦵" },
      { name: "Rotación con cable", sets: 3, reps: "12 cada lado", icon: "🔄" },
    ],
  },
  {
    id: 7,
    title: "Movilidad y Flexibilidad",
    description: "Sesión de gimnasio enfocada en recuperación activa",
    duration: "40 min",
    level: "Principiante",
    category: "gimnasio",
    exercises: [
      { name: "Foam roller espalda", sets: 1, reps: "3 min", icon: "🧻" },
      { name: "Movilidad de cadera", sets: 2, reps: "10 cada lado", icon: "🔄" },
      { name: "Apertura torácica en foam", sets: 1, reps: "2 min", icon: "🧘" },
      { name: "Estiramiento en máquina", sets: 2, reps: "45 seg", icon: "🏋️" },
      { name: "Caminadora inclinada", sets: 1, reps: "15 min", icon: "🚶" },
    ],
  },
];

export const reminders = [
  {
    id: 1,
    title: "Pausa activa",
    description: "Levántate y estira por 5 minutos",
    time: "10:30",
    days: ["Lun", "Mar", "Mié", "Jue", "Vie"],
    active: true,
    icon: "🧘",
    color: "orange",
  },
  {
    id: 2,
    title: "Hidratación",
    description: "Bebe un vaso de agua",
    time: "09:00",
    days: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    active: true,
    icon: "💧",
    color: "blue",
  },
  {
    id: 3,
    title: "Corrección de postura",
    description: "Revisa tu postura y ajusta la silla",
    time: "14:00",
    days: ["Lun", "Mar", "Mié", "Jue", "Vie"],
    active: true,
    icon: "🪑",
    color: "green",
  },
  {
    id: 4,
    title: "Entrenamiento vespertino",
    description: "Sesión de rutina en casa o gimnasio",
    time: "18:30",
    days: ["Lun", "Mié", "Vie"],
    active: false,
    icon: "💪",
    color: "purple",
  },
  {
    id: 5,
    title: "Relajación nocturna",
    description: "10 minutos de estiramientos antes de dormir",
    time: "21:00",
    days: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    active: true,
    icon: "🌙",
    color: "indigo",
  },
];

export const goals = [
  { id: 1, title: "7 días seguidos de pausa activa", completed: true, date: "Mayo 2024" },
  { id: 2, title: "Completar 10 sesiones este mes", completed: true, date: "Mayo 2024" },
  { id: 3, title: "Eliminar dolor de espalda baja", completed: true, date: "Abril 2024" },
  { id: 4, title: "Mejorar postura al sentarme", completed: false, date: "En progreso" },
  { id: 5, title: "30 días de hidratación constante", completed: false, date: "En progreso" },
  { id: 6, title: "Aprender 5 ejercicios de movilidad", completed: true, date: "Marzo 2024" },
];

export const painAreas = [
  { area: "Cuello", level: 2, max: 10 },
  { area: "Hombros", level: 4, max: 10 },
  { area: "Espalda alta", level: 3, max: 10 },
  { area: "Espalda baja", level: 6, max: 10 },
  { area: "Muñecas", level: 3, max: 10 },
];
