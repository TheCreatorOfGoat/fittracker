import { useEffect, useState } from 'react';
import { Plus, Flame, Trash2, CheckSquare, Trophy } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../services/api';

const DEFAULT_TASKS = [
  { title: 'Boire 3L d\'eau', icon: '💧', unit: 'L', target: 3 },
  { title: 'Marcher 10 000 pas', icon: '👟', unit: 'pas', target: 10000 },
  { title: 'Faire du sport', icon: '🏋️', unit: 'séance', target: 1 },
  { title: 'Dormir 8h', icon: '😴', unit: 'h', target: 8 },
  { title: 'Méditer 10 min', icon: '🧘', unit: 'min', target: 10 },
];

const ICONS = ['💧', '👟', '🏋️', '🥗', '😴', '🧘', '📚', '🚴', '🥗', '☀️', '✅', '🎯'];

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { isSubmitting } } = useForm({
    defaultValues: { title: '', icon: '✅', unit: '', target: 1, frequency: 'daily' },
  });

  async function load() {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data.tasks || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function onSubmit(data) {
    await api.post('/tasks', data);
    reset();
    setShowForm(false);
    load();
  }

  async function toggleTask(task) {
    setToggling(task._id);
    try {
      const endpoint = task.completedToday ? '/uncomplete' : '/complete';
      const { data } = await api.post(`/tasks/${task._id}${endpoint}`);
      setTasks(ts => ts.map(t => t._id === task._id ? data.task : t));
    } finally {
      setToggling(null);
    }
  }

  async function deleteTask(id) {
    await api.delete(`/tasks/${id}`);
    setTasks(ts => ts.filter(t => t._id !== id));
  }

  async function addDefaultTask(preset) {
    const { data } = await api.post('/tasks', { ...preset, frequency: 'daily' });
    setTasks(ts => [...ts, { ...data.task, completedToday: false }]);
  }

  const completed = tasks.filter(t => t.completedToday).length;
  const bestStreak = tasks.reduce((max, t) => Math.max(max, t.streakBest || 0), 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Habitudes quotidiennes</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {completed}/{tasks.length} complétées aujourd'hui
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Nouvelle habitude
        </button>
      </div>

      {/* Stats rapides */}
      {tasks.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-4 text-center">
            <p className="text-2xl font-display font-bold text-gray-900 dark:text-white">{completed}/{tasks.length}</p>
            <p className="text-xs text-gray-400 mt-1">Aujourd'hui</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-display font-bold text-orange-500">
              {tasks.reduce((max, t) => Math.max(max, t.streakCurrent || 0), 0)}🔥
            </p>
            <p className="text-xs text-gray-400 mt-1">Streak max actuel</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-display font-bold text-yellow-500">{bestStreak}⭐</p>
            <p className="text-xs text-gray-400 mt-1">Meilleur record</p>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="card p-6 animate-slide-up">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-5">Nouvelle habitude</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Titre *</label>
                <input className="input" placeholder="Boire 3L d'eau" {...register('title', { required: true })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Icône</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setValue('icon', icon)}
                      className={`text-xl p-1.5 rounded-lg border transition-all ${watch('icon') === icon ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-transparent hover:border-gray-200'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Objectif</label>
                <input type="number" className="input" placeholder="1" {...register('target')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Unité</label>
                <input className="input" placeholder="séance, L, pas..." {...register('unit')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Fréquence</label>
                <select className="input" {...register('frequency')}>
                  <option value="daily">Quotidien</option>
                  <option value="weekly">Hebdomadaire</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? 'Sauvegarde...' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tasks list */}
      {tasks.length === 0 ? (
        <div className="space-y-4">
          <div className="card p-12 flex flex-col items-center text-center gap-3">
            <CheckSquare size={40} className="text-gray-200 dark:text-gray-700" />
            <p className="font-medium text-gray-600 dark:text-gray-400">Aucune habitude configurée</p>
            <p className="text-sm text-gray-400">Choisis parmi nos suggestions ou crée tes propres habitudes</p>
          </div>

          {/* Suggestions */}
          <div>
            <h2 className="section-title mb-3">Suggestions pour démarrer</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {DEFAULT_TASKS.map(task => (
                <button key={task.title} onClick={() => addDefaultTask(task)}
                  className="card p-4 text-left hover:border-green-200 dark:hover:border-green-700 transition-all group">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{task.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
                      <p className="text-xs text-gray-400">Objectif : {task.target} {task.unit}</p>
                    </div>
                    <Plus size={16} className="ml-auto text-gray-300 group-hover:text-green-500 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task._id} className={`card p-4 transition-all ${task.completedToday ? 'opacity-80' : ''}`}>
              <div className="flex items-center gap-4">
                {/* Checkbox */}
                <button
                  onClick={() => toggleTask(task)}
                  disabled={toggling === task._id}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 transition-all duration-300 ${
                    task.completedToday
                      ? 'bg-green-500 scale-95'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {toggling === task._id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : task.completedToday ? (
                    '✓'
                  ) : (
                    task.icon
                  )}
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${task.completedToday ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {task.target > 1 && (
                      <span className="text-xs text-gray-400">Objectif : {task.target} {task.unit}</span>
                    )}
                    {task.streakCurrent > 0 && (
                      <span className="text-xs font-medium text-orange-400 flex items-center gap-1">
                        <Flame size={11} />
                        {task.streakCurrent} jour{task.streakCurrent > 1 ? 's' : ''}
                      </span>
                    )}
                    {task.streakBest > 0 && (
                      <span className="text-xs text-gray-300 dark:text-gray-600">Record : {task.streakBest}j</span>
                    )}
                  </div>
                </div>

                {/* Streak badge */}
                {task.streakCurrent >= 7 && (
                  <span className="badge bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400">
                    <Trophy size={11} /> {task.streakCurrent >= 30 ? '💎' : '⭐'}
                  </span>
                )}

                {/* Delete */}
                <button onClick={() => deleteTask(task._id)} className="text-gray-300 hover:text-red-400 transition-colors p-1 ml-1">
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Progress bar pour le streak */}
              {task.streakCurrent > 0 && (
                <div className="mt-3 ml-16">
                  <div className="h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((task.streakCurrent / 30) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1">Objectif 30 jours : {task.streakCurrent}/30</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
