import { useEffect, useState } from 'react';
import { Plus, Scale, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import useAuthStore from '../store/authStore';

const STORAGE_KEY = 'ft_weight_logs';

function loadWeightLogs() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function saveWeightLogs(logs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

export default function WeightPage() {
  const { user } = useAuthStore();
  const [logs, setLogs] = useState(loadWeightLogs);
  const [showForm, setShowForm] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newDate, setNewDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newNote, setNewNote] = useState('');

  const targetWeight = user?.profile?.targetWeight || null;
  const startWeight = logs.length > 0 ? logs[0].weight : user?.profile?.weight || null;
  const currentWeight = logs.length > 0 ? logs[logs.length - 1].weight : user?.profile?.weight || null;
  const diff = currentWeight && startWeight ? Math.round((currentWeight - startWeight) * 10) / 10 : null;

  // Données pour le graphique
  const chartData = logs.map(l => ({
    date: format(new Date(l.date), 'dd/MM', { locale: fr }),
    poids: l.weight,
  }));

  function addLog() {
    if (!newWeight) return;
    const log = { id: Date.now(), date: newDate, weight: Number(newWeight), note: newNote };
    const updated = [...logs, log].sort((a, b) => new Date(a.date) - new Date(b.date));
    setLogs(updated);
    saveWeightLogs(updated);
    setNewWeight('');
    setNewNote('');
    setShowForm(false);
  }

  function deleteLog(id) {
    const updated = logs.filter(l => l.id !== id);
    setLogs(updated);
    saveWeightLogs(updated);
  }

  const trend = diff !== null ? (diff < 0 ? 'down' : diff > 0 ? 'up' : 'stable') : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="page-title">Suivi du poids</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Ajouter
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Poids actuel</p>
          <p className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            {currentWeight ? `${currentWeight}` : '—'}<span className="text-sm text-gray-400">kg</span>
          </p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Objectif</p>
          <p className="text-2xl font-display font-bold text-green-500">
            {targetWeight ? `${targetWeight}` : '—'}<span className="text-sm text-gray-400">kg</span>
          </p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Évolution</p>
          <div className="flex items-center justify-center gap-1">
            {trend === 'down' && <TrendingDown size={18} className="text-green-500" />}
            {trend === 'up' && <TrendingUp size={18} className="text-red-400" />}
            {trend === 'stable' && <Minus size={18} className="text-gray-400" />}
            <p className={`text-2xl font-display font-bold ${trend === 'down' ? 'text-green-500' : trend === 'up' ? 'text-red-400' : 'text-gray-400'}`}>
              {diff !== null ? `${diff > 0 ? '+' : ''}${diff}` : '—'}<span className="text-sm">kg</span>
            </p>
          </div>
        </div>
      </div>

      {/* Barre de progression vers l'objectif */}
      {targetWeight && startWeight && currentWeight && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Progression vers l'objectif</p>
            <p className="text-sm text-gray-400">
              {Math.abs(Math.round((currentWeight - targetWeight) * 10) / 10)} kg restants
            </p>
          </div>
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(Math.max(
                  ((startWeight - currentWeight) / (startWeight - targetWeight)) * 100, 0
                ), 100)}%`
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Départ : {startWeight}kg</span>
            <span>Objectif : {targetWeight}kg</span>
          </div>
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <div className="card p-6 animate-slide-up space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Ajouter une pesée</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Poids (kg) *</label>
              <input type="number" step="0.1" className="input" placeholder="75.5"
                value={newWeight} onChange={e => setNewWeight(e.target.value)} autoFocus />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date</label>
              <input type="date" className="input" value={newDate} onChange={e => setNewDate(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Note (optionnel)</label>
            <input className="input" placeholder="Après le sport, le matin..." value={newNote} onChange={e => setNewNote(e.target.value)} />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
            <button onClick={addLog} disabled={!newWeight} className="btn-primary disabled:opacity-60">Enregistrer</button>
          </div>
        </div>
      )}

      {/* Graphique */}
      {chartData.length >= 2 ? (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-6">Évolution du poids</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `${v}kg`}
              />
              <Tooltip formatter={v => [`${v} kg`, 'Poids']} />
              {targetWeight && (
                <ReferenceLine y={targetWeight} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'Objectif', fontSize: 11, fill: '#22c55e' }} />
              )}
              <Line
                type="monotone"
                dataKey="poids"
                stroke="#22c55e"
                strokeWidth={2.5}
                dot={{ fill: '#22c55e', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : chartData.length === 1 ? (
        <div className="card p-6 text-center text-gray-400 text-sm">
          Ajoute au moins 2 pesées pour voir le graphique.
        </div>
      ) : null}

      {/* Historique */}
      {logs.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Historique</h2>
          <div className="space-y-2">
            {[...logs].reverse().map((log, i) => {
              const prev = logs[logs.length - 1 - i - 1];
              const delta = prev ? Math.round((log.weight - prev.weight) * 10) / 10 : null;
              return (
                <div key={log.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {format(new Date(log.date), 'EEEE d MMMM yyyy', { locale: fr })}
                    </p>
                    {log.note && <p className="text-xs text-gray-400">{log.note}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    {delta !== null && (
                      <span className={`text-xs font-medium ${delta < 0 ? 'text-green-500' : delta > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                        {delta > 0 ? '+' : ''}{delta}kg
                      </span>
                    )}
                    <span className="font-bold text-gray-900 dark:text-white">{log.weight} kg</span>
                    <button onClick={() => deleteLog(log.id)} className="text-gray-300 hover:text-red-400 transition-colors text-xs">✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {logs.length === 0 && (
        <div className="card p-12 flex flex-col items-center text-center gap-3">
          <Scale size={40} className="text-gray-200 dark:text-gray-700" />
          <p className="font-medium text-gray-600 dark:text-gray-400">Aucune pesée enregistrée</p>
          <p className="text-sm text-gray-400">Commence à suivre ton poids pour voir ta progression !</p>
        </div>
      )}
    </div>
  );
}
