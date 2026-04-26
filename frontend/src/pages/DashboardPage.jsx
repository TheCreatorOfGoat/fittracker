import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, UtensilsCrossed, CheckSquare, Flame, Trophy, Droplets, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import { getDailyQuote, calculateLevel } from '../utils/fitnessUtils';

const BADGE_INFO = {
  streak_7:  { emoji: '🔥', label: '7 jours de streak' },
  streak_30: { emoji: '💎', label: '30 jours de streak' },
  dedicated: { emoji: '⭐', label: 'Athlète assidu' },
};

function loadHydrationToday() {
  try {
    const data = JSON.parse(localStorage.getItem('ft_hydration') || '{}');
    return data[new Date().toISOString().split('T')[0]] || 0;
  } catch { return 0; }
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = format(new Date(), 'EEEE d MMMM', { locale: fr });
  const quote = getDailyQuote();
  const hydration = loadHydrationToday();
  const hydrationGoal = Number(localStorage.getItem('ft_hydration_goal')) || 2500;

  useEffect(() => {
    async function load() {
      try {
        const [workoutRes, taskRes, foodRes] = await Promise.all([
          api.get('/workouts/stats?days=14'),
          api.get('/tasks'),
          api.get(`/food?date=${format(new Date(), 'yyyy-MM-dd')}`),
        ]);
        setStats({ workouts: workoutRes.data, food: foodRes.data });
        setTasks(taskRes.data.tasks || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const completedTasks = tasks.filter(t => t.completedToday).length;
  const totalTasks = tasks.length;
  const todayCalories = stats?.food?.totals?.calories || 0;
  const targetCalories = user?.dailyCalories || 2000;
  const todayWorkouts = stats?.workouts?.totalCount || 0;
  const levelInfo = calculateLevel(todayWorkouts, user?.streaks?.best || 0, 0);

  const chartData = Object.entries(stats?.workouts?.byWeek || {}).slice(-7).map(([week, data]) => ({
    name: format(new Date(week), 'dd/MM'),
    séances: data.count,
  }));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <p className="text-sm text-gray-400 capitalize">{today}</p>
        <h1 className="page-title">Bonjour, {user?.name?.split(' ')[0]} 👋</h1>
      </div>

      {/* Citation */}
      <div className="card p-5 border-l-4 border-green-500 rounded-l-none">
        <p className="text-sm italic text-gray-600 dark:text-gray-300">"{quote.text}"</p>
        <p className="text-xs text-gray-400 mt-1">— {quote.author}</p>
      </div>

      {/* Niveau */}
      <div className={`card p-5 ${levelInfo.bg}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{levelInfo.emoji}</span>
            <div>
              <p className={`font-display font-bold ${levelInfo.color}`}>Niveau {levelInfo.level} — {levelInfo.name}</p>
              <p className="text-xs text-gray-400">{levelInfo.points} points d'activité</p>
            </div>
          </div>
          {levelInfo.next && <span className="text-xs text-gray-400">Prochain : {levelInfo.next.name}</span>}
        </div>
        {levelInfo.next && (
          <div>
            <div className="h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${(levelInfo.colorClass || 'text-gray-500').replace('text-', 'bg-')}`} style={{ width: `${levelInfo.progress}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1">{levelInfo.progress}% vers {levelInfo.next.name}</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Dumbbell size={18} className="text-green-500" />} label="Séances (14j)" value={todayWorkouts} bg="bg-green-50 dark:bg-green-900/20" />
        <StatCard icon={<UtensilsCrossed size={18} className="text-orange-500" />} label="Calories auj." value={`${Math.round(todayCalories)}/${targetCalories}`} bg="bg-orange-50 dark:bg-orange-900/20" small />
        <StatCard icon={<CheckSquare size={18} className="text-blue-500" />} label="Habitudes" value={`${completedTasks}/${totalTasks}`} bg="bg-blue-50 dark:bg-blue-900/20" />
        <StatCard icon={<Flame size={18} className="text-red-500" />} label="Streak" value={`${user?.streaks?.current || 0}j`} bg="bg-red-50 dark:bg-red-900/20" />
      </div>

      {/* Hydratation + Calories */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link to="/hydration" className="card p-5 hover:border-blue-200 dark:hover:border-blue-800 transition-all block">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2"><Droplets size={16} className="text-blue-400" /><span className="text-sm font-medium text-gray-900 dark:text-white">Hydratation</span></div>
            <span className="text-xs text-green-500">Voir →</span>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-xl font-display font-bold text-gray-900 dark:text-white">{hydration >= 1000 ? `${(hydration/1000).toFixed(1)}L` : `${hydration}ml`}</span>
            <span className="text-gray-400 text-xs">/ {(hydrationGoal/1000).toFixed(1)}L</span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-400 rounded-full transition-all" style={{ width: `${Math.min((hydration/hydrationGoal)*100, 100)}%` }} />
          </div>
        </Link>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2"><Zap size={16} className="text-orange-400" /><span className="text-sm font-medium text-gray-900 dark:text-white">Calories</span></div>
            <Link to="/food" className="text-xs text-green-500">Journal →</Link>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-xl font-display font-bold text-gray-900 dark:text-white">{Math.round(todayCalories)}</span>
            <span className="text-gray-400 text-xs">/ {targetCalories} kcal</span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${todayCalories > targetCalories ? 'bg-red-400' : 'bg-orange-400'}`} style={{ width: `${Math.min((todayCalories/targetCalories)*100, 100)}%` }} />
          </div>
          {stats?.food?.totals && (
            <div className="grid grid-cols-3 gap-1 mt-2 text-center">
              {[
                { l: 'P', v: Math.round(stats.food.totals.protein), c: 'text-blue-500' },
                { l: 'G', v: Math.round(stats.food.totals.carbs), c: 'text-yellow-500' },
                { l: 'L', v: Math.round(stats.food.totals.fat), c: 'text-pink-500' },
              ].map(m => <div key={m.l}><p className={`text-sm font-bold ${m.c}`}>{m.v}g</p><p className="text-xs text-gray-400">{m.l}</p></div>)}
            </div>
          )}
        </div>
      </div>

      {/* Habitudes */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Habitudes</h2>
          <Link to="/tasks" className="text-xs text-green-500">Voir tout →</Link>
        </div>
        {tasks.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Aucune habitude configurée</p>
        ) : (
          <div className="space-y-2">
            {tasks.slice(0, 4).map(task => (
              <div key={task._id} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${task.completedToday ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                  {task.completedToday ? '✓' : task.icon}
                </div>
                <p className={`text-sm flex-1 truncate ${task.completedToday ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>{task.title}</p>
                {task.streakCurrent > 0 && <span className="text-xs text-orange-400">{task.streakCurrent}🔥</span>}
              </div>
            ))}
            <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mt-3">
              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${(completedTasks/Math.max(totalTasks,1))*100}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Graphique */}
      {chartData.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Activité récente</h2>
            <Link to="/report" className="text-xs text-green-500">Rapport →</Link>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={chartData}>
              <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} /><stop offset="95%" stopColor="#22c55e" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="séances" stroke="#22c55e" fill="url(#cg)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Badges */}
      {user?.badges?.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3"><Trophy size={16} className="text-yellow-500" /><h2 className="font-semibold text-gray-900 dark:text-white">Badges</h2></div>
          <div className="flex flex-wrap gap-2">
            {user.badges.map(badge => (
              <div key={badge} className="badge bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-3 py-1.5">
                {BADGE_INFO[badge]?.emoji} {BADGE_INFO[badge]?.label || badge}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, bg, small }) {
  return (
    <div className="card p-4 flex flex-col gap-2">
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className={`font-display font-bold text-gray-900 dark:text-white ${small ? 'text-base' : 'text-xl'}`}>{value}</p>
      </div>
    </div>
  );
}
