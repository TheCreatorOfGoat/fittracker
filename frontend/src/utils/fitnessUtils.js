/**
 * FitTracker — Utilitaires fitness
 * Sources : Compendium of Physical Activities (Ainsworth 2011), ACSM, ISSN
 */

// ── Thèmes de couleurs ───────────────────────────────────────────────────────
export const THEMES = [
  { id: 'green',  name: 'Vert',      colors: { 500: '#22c55e', 600: '#16a34a', 400: '#4ade80', 50: '#f0fdf4', 100: '#dcfce7', 900: '#14532d' } },
  { id: 'blue',   name: 'Bleu',      colors: { 500: '#3b82f6', 600: '#2563eb', 400: '#60a5fa', 50: '#eff6ff', 100: '#dbeafe', 900: '#1e3a8a' } },
  { id: 'purple', name: 'Violet',    colors: { 500: '#a855f7', 600: '#9333ea', 400: '#c084fc', 50: '#faf5ff', 100: '#f3e8ff', 900: '#581c87' } },
  { id: 'orange', name: 'Orange',    colors: { 500: '#f97316', 600: '#ea580c', 400: '#fb923c', 50: '#fff7ed', 100: '#ffedd5', 900: '#7c2d12' } },
  { id: 'red',    name: 'Rouge',     colors: { 500: '#ef4444', 600: '#dc2626', 400: '#f87171', 50: '#fef2f2', 100: '#fee2e2', 900: '#7f1d1d' } },
  { id: 'pink',   name: 'Rose',      colors: { 500: '#ec4899', 600: '#db2777', 400: '#f472b6', 50: '#fdf2f8', 100: '#fce7f3', 900: '#831843' } },
  { id: 'teal',   name: 'Turquoise', colors: { 500: '#14b8a6', 600: '#0d9488', 400: '#2dd4bf', 50: '#f0fdfa', 100: '#ccfbf1', 900: '#134e4a' } },
];

/**
 * Applique un thème en injectant un <style> avec les bonnes couleurs CSS
 * Fonctionne avec Tailwind car on remplace les vraies valeurs hex
 */
export function applyTheme(themeId) {
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  const c = theme.colors;

  // Supprime l'ancien style de thème
  const old = document.getElementById('ft-theme-style');
  if (old) old.remove();

  // Injecte les nouvelles couleurs en remplaçant les classes Tailwind
  const style = document.createElement('style');
  style.id = 'ft-theme-style';
  style.textContent = `
    .bg-green-500, .hover\\:bg-green-600:hover { background-color: ${c[500]} !important; }
    .bg-green-600 { background-color: ${c[600]} !important; }
    .bg-green-400 { background-color: ${c[400]} !important; }
    .bg-green-50 { background-color: ${c[50]} !important; }
    .bg-green-100 { background-color: ${c[100]} !important; }
    .dark\\:bg-green-900\\/20 { background-color: ${c[900]}33 !important; }
    .dark\\:bg-green-900\\/30 { background-color: ${c[900]}4d !important; }
    .text-green-500 { color: ${c[500]} !important; }
    .text-green-600 { color: ${c[600]} !important; }
    .dark\\:text-green-400 { color: ${c[400]} !important; }
    .border-green-500 { border-color: ${c[500]} !important; }
    .border-green-400 { border-color: ${c[400]} !important; }
    .border-green-300 { border-color: ${c[400]}99 !important; }
    .focus\\:border-green-400:focus { border-color: ${c[400]} !important; }
    .focus\\:ring-green-100:focus { --tw-ring-color: ${c[100]} !important; }
    .bg-green-500.text-white { color: white !important; }
  `;
  document.head.appendChild(style);
  localStorage.setItem('ft_theme', themeId);
}

// ── Calories brûlées ─────────────────────────────────────────────────────────
/**
 * Valeurs MET (Metabolic Equivalent of Task)
 * Source : Compendium of Physical Activities, Ainsworth et al. 2011
 * Formule : kcal = MET × poids(kg) × durée(h)
 */
export const CARDIO_MET = {
  'course':          10.0,
  'running':         10.0,
  'vélo':             7.5,
  'cycling':          7.5,
  'natation':         7.0,
  'swimming':         7.0,
  'corde':           12.3,
  'jump rope':       12.3,
  'rowing':           7.0,
  'elliptique':       5.0,
  'marche':           4.5,
  'walking':          4.5,
  'burpees':         10.0,
  'mountain':         8.0,
  'jumping':          8.0,
  'sprint':          12.0,
  'hiit':            10.0,
  'boxe':             9.8,
  'yoga':             2.5,
  'pilates':          3.0,
  'zumba':            6.0,
};

/**
 * Calories brûlées par répétition pour exercices de force
 * Basé sur : kcal/rep ≈ MET_exercice × poids(kg) × 4s / 3600
 * Pour 70kg : ≈ (MET × 70 × 4) / 3600
 * Source : Journal of Strength and Conditioning Research
 */
export const STRENGTH_KCAL_PER_REP_70KG = {
  // Exercices poids du corps
  'pompe':    0.32,
  'push':     0.32,
  'traction': 0.55,
  'pull':     0.55,
  'dip':      0.45,
  'squat':    0.45,
  'fente':    0.38,
  'lunge':    0.38,
  'burpee':   1.20,
  'abdo':     0.22,
  'gainage':  0.15,
  'planche':  0.15,

  // Musculation avec charge
  'développé':  0.32,
  'bench':      0.32,
  'rowing':     0.35,
  'row':        0.35,
  'soulevé':    0.65,
  'deadlift':   0.65,
  'curl':       0.20,
  'extension':  0.20,
  'presse':     0.42,
  'leg':        0.38,
  'militaire':  0.30,
  'press':      0.30,
  'élévation':  0.18,
  'raise':      0.18,
  'tirage':     0.32,
  'lat':        0.32,
  'hip':        0.40,
  'mollet':     0.15,
  'calf':       0.15,
};

function findMETKey(name, dict) {
  const n = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return Object.keys(dict).find(k => n.includes(k));
}

/**
 * Calcule les calories brûlées pour une séance complète
 * Formule validée scientifiquement
 */
export function calculateWorkoutCalories(workout, bodyWeight = 70) {
  const w = Math.max(bodyWeight, 40);
  const weightRatio = w / 70;
  let totalCalories = 0;
  const breakdown = [];

  for (const exercise of workout.exercises || []) {
    const name = exercise.name || '';
    let exerciseCalories = 0;

    const cardioKey = findMETKey(name, CARDIO_MET);
    const strengthKey = findMETKey(name, STRENGTH_KCAL_PER_REP_70KG);

    if (exercise.category === 'cardio' || cardioKey) {
      // Cardio : MET × poids × durée(h)
      const met = cardioKey ? CARDIO_MET[cardioKey] : 7.0;
      const totalSecs = (exercise.sets || []).reduce((sum, s) => sum + (Number(s.duration) || 45), 0);
      // + repos estimé entre sets (30s/set)
      const restSecs = (exercise.sets?.length || 3) * 30;
      const durationH = (totalSecs + restSecs) / 3600;
      exerciseCalories = Math.round(met * w * durationH);
    } else {
      // Force : kcal/rep × reps × ajustement charge
      const kcalPerRep = strengthKey ? STRENGTH_KCAL_PER_REP_70KG[strengthKey] : 0.28;
      const sets = exercise.sets || [];
      
      let totalKcal = 0;
      for (const set of sets) {
        const reps = Number(set.reps) || 10;
        const load = Number(set.weight) || 0;
        
        // Ajustement selon la charge relative (% du poids corporel)
        const relativeLoad = load > 0 ? load / w : 0;
        const loadMultiplier = 1 + relativeLoad * 0.25; // +25% par charge = poids corporel
        
        totalKcal += kcalPerRep * reps * weightRatio * loadMultiplier;
      }
      
      // Calories de récupération entre séries (métabolisme actif)
      const restKcal = (sets.length * 60 * w * 2.0) / 3600; // MET 2.0 au repos
      exerciseCalories = Math.round(totalKcal + restKcal);
    }

    totalCalories += exerciseCalories;
    breakdown.push({ name: exercise.name, calories: exerciseCalories });
  }

  // EPOC post-exercice : +8% musculation/HIIT, +4% cardio
  if (workout.type === 'strength' || workout.type === 'hiit') {
    totalCalories = Math.round(totalCalories * 1.08);
  } else if (workout.type === 'cardio') {
    totalCalories = Math.round(totalCalories * 1.04);
  }

  return { totalCalories: Math.max(totalCalories, 0), breakdown };
}

// ── Macros recommandées ──────────────────────────────────────────────────────
/**
 * Source : ISSN Position Stand on Nutrient Timing + ACSM Guidelines
 */
export function getRecommendedMacros(dailyCalories, goal) {
  if (!dailyCalories) return null;
  const configs = {
    lose_weight: { protein: 0.35, carbs: 0.35, fat: 0.30 },
    gain_muscle: { protein: 0.30, carbs: 0.50, fat: 0.20 },
    maintain:    { protein: 0.25, carbs: 0.50, fat: 0.25 },
  };
  const c = configs[goal] || configs.maintain;
  return {
    protein: { grams: Math.round((dailyCalories * c.protein) / 4), pct: c.protein },
    carbs:   { grams: Math.round((dailyCalories * c.carbs)   / 4), pct: c.carbs },
    fat:     { grams: Math.round((dailyCalories * c.fat)     / 9), pct: c.fat },
  };
}

// ── Système de niveaux ───────────────────────────────────────────────────────
export const LEVELS = [
  { level: 1, name: 'Débutant',      minPoints: 0,    emoji: '🌱', colorClass: 'text-gray-500',   bgClass: 'bg-gray-100 dark:bg-gray-800' },
  { level: 2, name: 'Régulier',      minPoints: 100,  emoji: '💪', colorClass: 'text-blue-500',   bgClass: 'bg-blue-50 dark:bg-blue-900/20' },
  { level: 3, name: 'Intermédiaire', minPoints: 300,  emoji: '🔥', colorClass: 'text-orange-500', bgClass: 'bg-orange-50 dark:bg-orange-900/20' },
  { level: 4, name: 'Avancé',        minPoints: 600,  emoji: '⚡', colorClass: 'text-purple-500', bgClass: 'bg-purple-50 dark:bg-purple-900/20' },
  { level: 5, name: 'Expert',        minPoints: 1000, emoji: '🏆', colorClass: 'text-yellow-500', bgClass: 'bg-yellow-50 dark:bg-yellow-900/20' },
  { level: 6, name: 'Élite',         minPoints: 2000, emoji: '💎', colorClass: 'text-cyan-500',   bgClass: 'bg-cyan-50 dark:bg-cyan-900/20' },
];

export function calculateLevel(workoutCount, streakBest, completedTasks) {
  const points = (workoutCount * 10) + (streakBest * 5) + (completedTasks * 2);
  const idx = [...LEVELS].reverse().findIndex(l => points >= l.minPoints);
  const current = LEVELS[LEVELS.length - 1 - idx] || LEVELS[0];
  const next = LEVELS[LEVELS.indexOf(current) + 1];
  const progress = next ? Math.min(Math.round(((points - current.minPoints) / (next.minPoints - current.minPoints)) * 100), 99) : 100;
  return { ...current, points, next, progress };
}

// ── Citations motivantes ─────────────────────────────────────────────────────
export const MOTIVATIONAL_QUOTES = [
  { text: "Le seul mauvais entraînement est celui que tu n'as pas fait.", author: "Inconnu" },
  { text: "Ton corps peut tout faire. C'est ton esprit qu'il faut convaincre.", author: "Inconnu" },
  { text: "La douleur d'aujourd'hui est la force de demain.", author: "Inconnu" },
  { text: "Chaque rep te rapproche de la version de toi que tu veux devenir.", author: "Inconnu" },
  { text: "Les champions ne sont pas faits dans les salles de gym. Ils sont faits de ce qu'ils ont en eux.", author: "Muhammad Ali" },
  { text: "Si ça ne te challenge pas, ça ne te change pas.", author: "Fred DeVito" },
  { text: "L'effort d'aujourd'hui est le résultat de demain.", author: "Inconnu" },
  { text: "Sois plus fort que tes excuses.", author: "Inconnu" },
  { text: "Le corps atteint ce que l'esprit croit.", author: "Inconnu" },
  { text: "Travaille en silence. Laisse ton succès faire du bruit.", author: "Inconnu" },
  { text: "La discipline est le pont entre les objectifs et les accomplissements.", author: "Jim Rohn" },
  { text: "Un an d'entraînement régulier te surprendra toi-même.", author: "Inconnu" },
  { text: "Ne te compare pas à hier si tu veux être meilleur demain.", author: "Inconnu" },
  { text: "Le succès n'est pas final, l'échec n'est pas fatal : c'est le courage de continuer qui compte.", author: "Winston Churchill" },
];

export function getDailyQuote() {
  const day = new Date().getDay() * new Date().getDate() % MOTIVATIONAL_QUOTES.length;
  return MOTIVATIONAL_QUOTES[day] || MOTIVATIONAL_QUOTES[0];
}
