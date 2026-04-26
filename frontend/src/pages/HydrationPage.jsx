import { useState, useEffect } from 'react';
import { Droplets, Plus, Minus, RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'ft_hydration';
const GOAL_KEY = 'ft_hydration_goal';

const QUICK_AMOUNTS = [150, 250, 350, 500];

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

function loadToday() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return data[getTodayKey()] || 0;
  } catch { return 0; }
}

function saveToday(ml) {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    data[getTodayKey()] = ml;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function loadHistory() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return Object.entries(data)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 7)
      .map(([date, ml]) => ({ date, ml }));
  } catch { return []; }
}

export default function HydrationPage() {
  const [current, setCurrent] = useState(loadToday);
  const [goal, setGoal] = useState(() => Number(localStorage.getItem(GOAL_KEY)) || 2500);
  const [editGoal, setEditGoal] = useState(false);
  const [newGoal, setNewGoal] = useState(goal);
  const [history, setHistory] = useState(loadHistory);

  const percent = Math.min(Math.round((current / goal) * 100), 100);
  const remaining = Math.max(goal - current, 0);

  function add(ml) {
    const updated = current + ml;
    setCurrent(updated);
    saveToday(updated);
    setHistory(loadHistory());
  }

  function remove(ml) {
    const updated = Math.max(current - ml, 0);
    setCurrent(updated);
    saveToday(updated);
    setHistory(loadHistory());
  }

  function reset() {
    saveToday(0);
    setCurrent(0);
    setHistory(loadHistory());
  }

  function saveGoal() {
    setGoal(newGoal);
    localStorage.setItem(GOAL_KEY, newGoal);
    setEditGoal(false);
  }

  const glasses = Math.round(current / 250);

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Hydratation</h1>
        <button onClick={reset} className="btn-ghost flex items-center gap-1.5 text-sm text-gray-400">
          <RotateCcw size={14} /> Réinitialiser
        </button>
      </div>

      {/* Jauge principale */}
      <div className="card p-8 flex flex-col items-center gap-6">
        {/* Cercle de progression */}
        <div className="relative w-48 h-48">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-100 dark:text-gray-800" />
            <circle
              cx="60" cy="60" r="50" fill="none"
              stroke={percent >= 100 ? '#22c55e' : '#3b82f6'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - percent / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Droplets size={24} className={percent >= 100 ? 'text-green-500' : 'text-blue-400'} />
            <p className="text-3xl font-display font-bold text-gray-900 dark:text-white mt-1">
              {current >= 1000 ? `${(current / 1000).toFixed(1)}L` : `${current}ml`}
            </p>
            <p className="text-sm text-gray-400">{percent}% de l'objectif</p>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-3 gap-4 w-full text-center">
          <div>
            <p className="text-xl font-bold text-blue-500">{glasses}</p>
            <p className="text-xs text-gray-400">verres (250ml)</p>
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{remaining >= 1000 ? `${(remaining/1000).toFixed(1)}L` : `${remaining}ml`}</p>
            <p className="text-xs text-gray-400">restants</p>
          </div>
          <div>
            <p className="text-xl font-bold text-green-500">{goal >= 1000 ? `${(goal/1000).toFixed(1)}L` : `${goal}ml`}</p>
            <p className="text-xs text-gray-400">objectif</p>
          </div>
        </div>

        {/* Message motivation */}
        {percent >= 100 ? (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl px-4 py-2 text-sm font-medium">
            🎉 Objectif atteint ! Excellent travail !
          </div>
        ) : percent >= 75 ? (
          <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl px-4 py-2 text-sm">
            💧 Presque là ! Plus que {remaining}ml
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 text-gray-500 rounded-xl px-4 py-2 text-sm">
            💧 Continue, tu y es presque !
          </div>
        )}
      </div>

      {/* Boutons rapides */}
      <div className="card p-5">
        <p className="section-title mb-4">Ajouter rapidement</p>
        <div className="grid grid-cols-4 gap-3 mb-4">
          {QUICK_AMOUNTS.map(ml => (
            <button key={ml} onClick={() => add(ml)}
              className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
              <Droplets size={20} className="text-blue-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">{ml}ml</span>
              <span className="text-xs text-gray-400">{ml === 250 ? '1 verre' : ml === 500 ? '1 bouteille' : ml === 350 ? 'grand verre' : 'gorgée'}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => remove(250)} className="btn-secondary flex-1 flex items-center justify-center gap-2">
            <Minus size={16} /> -250ml
          </button>
          <button onClick={() => add(250)} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Plus size={16} /> +250ml
          </button>
        </div>
      </div>

      {/* Objectif */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="font-medium text-gray-900 dark:text-white">Objectif journalier</p>
          <button onClick={() => setEditGoal(!editGoal)} className="text-xs text-green-500 hover:underline">Modifier</button>
        </div>
        {editGoal ? (
          <div className="flex gap-2">
            <input type="number" value={newGoal} onChange={e => setNewGoal(Number(e.target.value))}
              className="input flex-1" placeholder="2500" step="100" />
            <span className="flex items-center text-sm text-gray-400">ml</span>
            <button onClick={saveGoal} className="btn-primary px-4">OK</button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-400 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
            </div>
            <span className="text-sm text-gray-400">{goal}ml</span>
          </div>
        )}
      </div>

      {/* Historique 7 jours */}
      {history.length > 1 && (
        <div className="card p-5">
          <p className="font-medium text-gray-900 dark:text-white mb-4">7 derniers jours</p>
          <div className="space-y-2">
            {history.map(({ date, ml }) => {
              const pct = Math.min(Math.round((ml / goal) * 100), 100);
              const d = new Date(date);
              return (
                <div key={date} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-20 flex-shrink-0">
                    {d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-green-500' : 'bg-blue-400'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-14 text-right">
                    {ml >= 1000 ? `${(ml/1000).toFixed(1)}L` : `${ml}ml`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
