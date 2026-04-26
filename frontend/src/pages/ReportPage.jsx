import { useEffect, useState } from 'react';
import { format, startOfWeek, endOfWeek, subWeeks, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Dumbbell, UtensilsCrossed, Droplets, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import useAuthStore from '../store/authStore';

export default function ReportPage() {
  const { user } = useAuthStore();
  const [weekOffset, setWeekOffset] = useState(0);
  const [workouts, setWorkouts] = useState([]);
  const [foodLogs, setFoodLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const weekStart = startOfWeek(subWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(subWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const prevWeekStart = startOfWeek(subWeeks(new Date(), weekOffset + 1), { weekStartsOn: 1 });
  const prevWeekEnd = endOfWeek(subWeeks(new Date(), weekOffset + 1), { weekStartsOn: 1 });

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [wRes, fRes, pwRes, pfRes] = await Promise.all([
          api.get(`/workouts?limit=50`),
          api.get(`/food?startDate=${format(weekStart, 'yyyy-MM-dd')}&endDate=${format(weekEnd, 'yyyy-MM-dd')}`),
          api.get(`/workouts?limit=50`),
          api.get(`/food?startDate=${format(prevWeekStart, 'yyyy-MM-dd')}&endDate=${format(prevWeekEnd, 'yyyy-MM-dd')}`),
        ]);
        setWorkouts({ current: wRes.data.workouts || [], prev: pwRes.data.workouts || [] });
        setFoodLogs({ current: fRes.data.logs || [], prev: pfRes.data.logs || [] });
      } finally { setLoading(false); }
    }
    load();
  }, [weekOffset]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /></div>;

  // Filtre les séances de la semaine courante
  const currentWorkouts = (workouts.current || []).filter(w => {
    const d = new Date(w.date);
    return d >= weekStart && d <= weekEnd;
  });
  const prevWorkouts = (workouts.prev || []).filter(w => {
    const d = new Date(w.date);
    return d >= prevWeekStart && d <= prevWeekEnd;
  });

  // Calories par jour
  const caloriesByDay = days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayLogs = (foodLogs.current || []).filter(l => l.date?.startsWith(dayStr));
    const calories = dayLogs.reduce((sum, l) => sum + l.items.reduce((s, i) => s + (i.calories || 0) * i.quantity, 0), 0);
    return { day: format(day, 'EEE', { locale: fr }), calories: Math.round(calories), target: user?.dailyCalories || 2000 };
  });

  const totalCalories = caloriesByDay.reduce((sum, d) => sum + d.calories, 0);
  const avgCalories = Math.round(totalCalories / 7);
  const targetCalories = user?.dailyCalories || 2000;

  // Comparaison semaines
  const workoutDiff = currentWorkouts.length - prevWorkouts.length;
  const calorieDiff = avgCalories - targetCalories;

  function StatCard({ icon, label, current, prev, unit, color }) {
    const diff = current - prev;
    const isPositive = diff > 0;
    return (
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        </div>
        <p className="text-2xl font-display font-bold text-gray-900 dark:text-white">{current}<span className="text-sm text-gray-400 ml-1">{unit}</span></p>
        {prev !== undefined && (
          <div className={`flex items-center gap-1 mt-1 text-xs ${diff > 0 ? 'text-green-500' : diff < 0 ? 'text-red-400' : 'text-gray-400'}`}>
            {diff > 0 ? <TrendingUp size={12} /> : diff < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
            <span>{diff > 0 ? '+' : ''}{diff} vs semaine dernière</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="page-title">Rapport hebdomadaire</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekOffset(o => o + 1)} className="btn-ghost p-2"><ChevronLeft size={18} /></button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {weekOffset === 0 ? 'Cette semaine' : weekOffset === 1 ? 'Semaine dernière' : `Il y a ${weekOffset} semaines`}
          </span>
          <button onClick={() => setWeekOffset(o => Math.max(0, o - 1))} disabled={weekOffset === 0} className="btn-ghost p-2 disabled:opacity-30"><ChevronRight size={18} /></button>
        </div>
      </div>

      <p className="text-sm text-gray-400 capitalize">
        {format(weekStart, 'd MMM', { locale: fr })} — {format(weekEnd, 'd MMM yyyy', { locale: fr })}
      </p>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={<Dumbbell size={16} className="text-green-500" />} label="Séances" current={currentWorkouts.length} prev={prevWorkouts.length} unit="séances" color="bg-green-50 dark:bg-green-900/20" />
        <StatCard icon={<UtensilsCrossed size={16} className="text-orange-500" />} label="Moy. calories" current={avgCalories} prev={targetCalories} unit="kcal/j" color="bg-orange-50 dark:bg-orange-900/20" />
        <StatCard icon={<span className="text-sm">🔥</span>} label="Calories totales" current={totalCalories} unit="kcal" color="bg-red-50 dark:bg-red-900/20" />
      </div>

      {/* Graphique calories par jour */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-6">Calories consommées vs objectif</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={caloriesByDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="calories" name="Consommées" fill="#f97316" radius={[4, 4, 0, 0]} />
            <Bar dataKey="target" name="Objectif" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Activité par jour */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Activité de la semaine</h2>
        <div className="grid grid-cols-7 gap-2">
          {days.map(day => {
            const hasWorkout = currentWorkouts.some(w => {
              const d = new Date(w.date);
              return format(d, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
            });
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            return (
              <div key={day.toISOString()} className="flex flex-col items-center gap-1">
                <span className="text-xs text-gray-400">{format(day, 'EEE', { locale: fr })}</span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                  hasWorkout ? 'bg-green-500 shadow-sm' : isToday ? 'bg-gray-100 dark:bg-gray-800 border-2 border-green-300' : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  {hasWorkout ? '💪' : isToday ? '📅' : ''}
                </div>
                <span className="text-xs text-gray-400">{format(day, 'd')}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Résumé séances */}
      {currentWorkouts.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Séances de la semaine</h2>
          <div className="space-y-2">
            {currentWorkouts.map(w => (
              <div key={w._id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{w.title}</p>
                  <p className="text-xs text-gray-400">{format(new Date(w.date), 'EEEE d MMM', { locale: fr })}</p>
                </div>
                <div className="text-right">
                  {w.duration && <p className="text-sm text-gray-500">{w.duration} min</p>}
                  <p className="text-xs text-gray-400">{w.exercises?.length || 0} exercices</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bilan */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Bilan de la semaine</h2>
        <div className="space-y-3">
          <div className={`flex items-center gap-3 p-3 rounded-xl ${currentWorkouts.length >= 3 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
            <span className="text-xl">{currentWorkouts.length >= 3 ? '✅' : '⚠️'}</span>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Entraînements</p>
              <p className="text-xs text-gray-400">{currentWorkouts.length} séance{currentWorkouts.length > 1 ? 's' : ''} — objectif recommandé : 3+</p>
            </div>
          </div>
          <div className={`flex items-center gap-3 p-3 rounded-xl ${Math.abs(calorieDiff) < 200 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
            <span className="text-xl">{Math.abs(calorieDiff) < 200 ? '✅' : '📊'}</span>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Alimentation</p>
              <p className="text-xs text-gray-400">
                Moyenne {avgCalories} kcal/j — {calorieDiff > 0 ? `+${calorieDiff}` : calorieDiff} vs objectif
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
