import { useEffect, useState } from 'react';
import { Plus, Dumbbell, Trash2, ChevronDown, ChevronUp, Play, Save, Flame } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useForm, useFieldArray } from 'react-hook-form';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import { calculateWorkoutCalories } from '../utils/fitnessUtils';

const TYPE_LABELS = { strength: 'Musculation', cardio: 'Cardio', hiit: 'HIIT', yoga: 'Yoga', other: 'Autre' };
const MOOD_LABELS = { terrible: 'Terrible', bad: 'Mauvais', okay: 'Ok', good: 'Bien', great: 'Super' };

const BUILTIN_PROGRAMS = [
  { id: 'push', title: 'Push Day', type: 'strength', duration: 60, exercises: [
    { name: 'Développé couché', category: 'strength', sets: [{ reps: 10, weight: 60 }, { reps: 8, weight: 65 }] },
    { name: 'Élévations latérales', category: 'strength', sets: [{ reps: 12, weight: 10 }, { reps: 12, weight: 10 }] },
    { name: 'Dips', category: 'strength', sets: [{ reps: 12, weight: '' }, { reps: 10, weight: '' }] },
    { name: 'Extensions triceps câble', category: 'strength', sets: [{ reps: 12, weight: 20 }, { reps: 12, weight: 20 }] },
  ]},
  { id: 'pull', title: 'Pull Day', type: 'strength', duration: 60, exercises: [
    { name: 'Tractions', category: 'strength', sets: [{ reps: 8, weight: '' }, { reps: 6, weight: '' }] },
    { name: 'Rowing barre', category: 'strength', sets: [{ reps: 10, weight: 60 }, { reps: 10, weight: 65 }] },
    { name: 'Tirage vertical', category: 'strength', sets: [{ reps: 12, weight: 50 }, { reps: 10, weight: 55 }] },
    { name: 'Curl biceps', category: 'strength', sets: [{ reps: 12, weight: 30 }, { reps: 10, weight: 32 }] },
  ]},
  { id: 'legs', title: 'Leg Day', type: 'strength', duration: 70, exercises: [
    { name: 'Squat barre', category: 'strength', sets: [{ reps: 10, weight: 80 }, { reps: 8, weight: 90 }] },
    { name: 'Presse cuisses', category: 'strength', sets: [{ reps: 12, weight: 120 }, { reps: 10, weight: 140 }] },
    { name: 'Fentes marchées', category: 'strength', sets: [{ reps: 12, weight: 20 }, { reps: 10, weight: 22 }] },
    { name: 'Leg curl', category: 'strength', sets: [{ reps: 12, weight: 40 }, { reps: 12, weight: 45 }] },
    { name: 'Mollets debout', category: 'strength', sets: [{ reps: 15, weight: 60 }, { reps: 15, weight: 60 }] },
  ]},
  { id: 'fullbody', title: 'Full Body', type: 'strength', duration: 55, exercises: [
    { name: 'Squat', category: 'strength', sets: [{ reps: 10, weight: 70 }, { reps: 8, weight: 80 }] },
    { name: 'Développé couché', category: 'strength', sets: [{ reps: 10, weight: 60 }, { reps: 8, weight: 65 }] },
    { name: 'Rowing haltère', category: 'strength', sets: [{ reps: 10, weight: 25 }, { reps: 10, weight: 25 }] },
    { name: 'Soulevé de terre', category: 'strength', sets: [{ reps: 8, weight: 100 }, { reps: 6, weight: 110 }] },
  ]},
  { id: 'hiit', title: 'Cardio HIIT 30 min', type: 'hiit', duration: 30, exercises: [
    { name: 'Burpees', category: 'cardio', sets: [{ duration: 40 }, { duration: 40 }, { duration: 40 }] },
    { name: 'Mountain climbers', category: 'cardio', sets: [{ duration: 40 }, { duration: 40 }, { duration: 40 }] },
    { name: 'Jumping jacks', category: 'cardio', sets: [{ duration: 40 }, { duration: 40 }, { duration: 40 }] },
    { name: 'Sprint sur place', category: 'cardio', sets: [{ duration: 40 }, { duration: 40 }, { duration: 40 }] },
  ]},
];

const STORAGE_KEY = 'ft_programs';
const HIDDEN_KEY  = 'ft_hidden_programs'; // programmes prédéfinis masqués

function loadSaved()  { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; } }
function loadHidden() { try { return JSON.parse(localStorage.getItem(HIDDEN_KEY)  || '[]'); } catch { return []; } }
function saveTo(p)    { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); }
function saveHidden(h){ localStorage.setItem(HIDDEN_KEY, JSON.stringify(h)); }

export default function WorkoutsPage() {
  const { user } = useAuthStore();
  const bodyWeight = user?.profile?.weight || 70;
  const [workouts, setWorkouts] = useState([]);
  const [tab, setTab] = useState('history');
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedPrograms, setSavedPrograms]   = useState(loadSaved);
  const [hiddenPrograms, setHiddenPrograms] = useState(loadHidden);
  const [savingProgram, setSavingProgram]   = useState(false);
  const [programName, setProgramName]       = useState('');

  const { register, handleSubmit, control, reset, watch, formState: { isSubmitting } } = useForm({
    defaultValues: {
      title: '', type: 'strength', date: format(new Date(), 'yyyy-MM-dd'),
      duration: '', mood: 'good', notes: '',
      exercises: [{ name: '', category: 'strength', sets: [{ reps: '', weight: '' }] }],
    },
  });
  const { fields: exerciseFields, append: addExercise, remove: removeExercise } = useFieldArray({ control, name: 'exercises' });

  const watchedExercises = watch('exercises');
  const watchedType = watch('type');
  const liveCalories = calculateWorkoutCalories({ exercises: watchedExercises, type: watchedType }, bodyWeight).totalCalories;

  async function load() {
    try { const { data } = await api.get('/workouts?limit=50'); setWorkouts(data.workouts); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function onSubmit(data) { await api.post('/workouts', data); reset(); setTab('history'); load(); }
  async function deleteWorkout(id) {
    if (!confirm('Supprimer cette séance ?')) return;
    await api.delete('/workouts/' + id);
    setWorkouts(w => w.filter(x => x._id !== id));
  }

  function loadProgram(p) {
    reset({
      title: p.title, type: p.type, date: format(new Date(), 'yyyy-MM-dd'),
      duration: p.duration || '', mood: 'good', notes: '',
      exercises: p.exercises.map(ex => ({
        name: ex.name, category: ex.category || 'strength',
        sets: ex.sets.map(s => ({ reps: s.reps || '', weight: s.weight || '', duration: s.duration || '' })),
      })),
    });
    setTab('new');
  }

  function saveAsProgram() {
    const data = watch();
    const np = { id: Date.now(), title: programName || data.title, type: data.type, duration: data.duration, exercises: data.exercises, custom: true };
    const updated = [...savedPrograms, np];
    setSavedPrograms(updated); saveTo(updated); setSavingProgram(false); setProgramName('');
  }

  function deleteCustomProgram(id) {
    const updated = savedPrograms.filter(p => p.id !== id);
    setSavedPrograms(updated); saveTo(updated);
  }

  function hideBuiltinProgram(id) {
    const updated = [...hiddenPrograms, id];
    setHiddenPrograms(updated); saveHidden(updated);
  }

  function restoreBuiltinPrograms() {
    setHiddenPrograms([]); saveHidden([]);
  }

  const visibleBuiltins = BUILTIN_PROGRAMS.filter(p => !hiddenPrograms.includes(p.id));

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Entraînements</h1>
        <button onClick={() => setTab('new')} className="btn-primary flex items-center gap-2"><Plus size={16} /> Nouvelle séance</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {[{ key: 'history', label: 'Historique' }, { key: 'programs', label: 'Programmes' }, { key: 'new', label: 'Nouvelle séance' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ' + (tab === t.key ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400')}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Programmes */}
      {tab === 'programs' && (
        <div className="space-y-5 animate-fade-in">
          {/* Mes programmes perso */}
          {savedPrograms.length > 0 && (
            <div>
              <p className="section-title mb-3">Mes programmes</p>
              <div className="grid md:grid-cols-2 gap-3">
                {savedPrograms.map(p => (
                  <ProgramCard key={p.id} program={p} onLoad={() => loadProgram(p)} onDelete={() => deleteCustomProgram(p.id)} bodyWeight={bodyWeight} custom />
                ))}
              </div>
            </div>
          )}

          {/* Programmes prédéfinis */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="section-title">Programmes prédéfinis</p>
              {hiddenPrograms.length > 0 && (
                <button onClick={restoreBuiltinPrograms} className="text-xs text-green-500 hover:underline">
                  Restaurer ({hiddenPrograms.length} masqué{hiddenPrograms.length > 1 ? 's' : ''})
                </button>
              )}
            </div>
            {visibleBuiltins.length === 0 ? (
              <div className="card p-8 text-center text-gray-400 text-sm">
                Tous les programmes prédéfinis sont masqués.
                <button onClick={restoreBuiltinPrograms} className="block mx-auto mt-2 text-green-500 hover:underline">Restaurer</button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {visibleBuiltins.map(p => (
                  <ProgramCard key={p.id} program={p} onLoad={() => loadProgram(p)} onDelete={() => hideBuiltinProgram(p.id)} bodyWeight={bodyWeight} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Nouvelle séance */}
      {tab === 'new' && (
        <div className="card p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Créer une séance</h2>
            <button onClick={() => setSavingProgram(!savingProgram)} className="btn-ghost flex items-center gap-1.5 text-sm text-green-500">
              <Save size={14} /> Sauvegarder comme programme
            </button>
          </div>

          {savingProgram && (
            <div className="flex gap-2 mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <input className="input flex-1 py-2" placeholder="Nom du programme..." value={programName} onChange={e => setProgramName(e.target.value)} />
              <button onClick={saveAsProgram} className="btn-primary py-2 px-4">Sauvegarder</button>
              <button onClick={() => setSavingProgram(false)} className="btn-secondary py-2 px-3">✕</button>
            </div>
          )}

          {liveCalories > 0 && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 mb-4 text-sm font-medium">
              <Flame size={15} /> Estimation : ~{liveCalories} kcal brûlées
              <span className="text-xs text-red-400 font-normal ml-1">(pour {bodyWeight}kg)</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Titre *</label><input className="input" placeholder="Push day..." {...register('title', { required: true })} /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Type</label>
                <select className="input" {...register('type')}>{Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date</label><input type="date" className="input" {...register('date')} /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Durée (min)</label><input type="number" className="input" placeholder="60" {...register('duration')} /></div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="section-title">Exercices</label>
                <button type="button" onClick={() => addExercise({ name: '', category: 'strength', sets: [{ reps: '', weight: '' }] })} className="text-xs text-green-500 hover:underline">+ Ajouter</button>
              </div>
              <div className="space-y-4">{exerciseFields.map((f, i) => <ExerciseInput key={f.id} index={i} control={control} register={register} onRemove={() => removeExercise(i)} />)}</div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Ressenti</label>
                <select className="input" {...register('mood')}>{Object.entries(MOOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes</label><input className="input" placeholder="Notes..." {...register('notes')} /></div>
            </div>

            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setTab('history')} className="btn-secondary">Annuler</button>
              <button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Sauvegarde...' : 'Enregistrer'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Historique */}
      {tab === 'history' && (
        <div className="space-y-3 animate-fade-in">
          {workouts.length === 0 ? (
            <div className="card p-12 flex flex-col items-center text-center gap-3">
              <Dumbbell size={40} className="text-gray-200 dark:text-gray-700" />
              <p className="font-medium text-gray-600 dark:text-gray-400">Aucune séance enregistrée</p>
              <button onClick={() => setTab('programs')} className="btn-primary mt-2">Voir les programmes</button>
            </div>
          ) : workouts.map(w => {
            const { totalCalories, breakdown } = calculateWorkoutCalories(w, bodyWeight);
            return (
              <div key={w._id} className="card overflow-hidden">
                <div className="flex items-center gap-4 p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50" onClick={() => setExpandedId(expandedId === w._id ? null : w._id)}>
                  <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0 text-green-500 font-bold text-xs">{TYPE_LABELS[w.type]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{w.title}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                      <span>{format(new Date(w.date), 'd MMM yyyy', { locale: fr })}</span>
                      {w.duration && <span>{w.duration} min</span>}
                      {w.exercises?.length > 0 && <span>{w.exercises.length} exercice{w.exercises.length > 1 ? 's' : ''}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {totalCalories > 0 && <span className="text-xs text-red-400 font-medium flex items-center gap-0.5"><Flame size={11} />{totalCalories}</span>}
                    <button onClick={e => { e.stopPropagation(); deleteWorkout(w._id); }} className="text-gray-300 hover:text-red-400 p-1"><Trash2 size={15} /></button>
                    {expandedId === w._id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </div>
                {expandedId === w._id && (
                  <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-4 space-y-3 animate-fade-in">
                    {w.exercises?.map((ex, i) => {
                      const exCals = breakdown.find(b => b.name === ex.name)?.calories || 0;
                      return (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{ex.name}</p>
                            {exCals > 0 && <span className="text-xs text-red-400 flex items-center gap-0.5"><Flame size={10} />{exCals} kcal</span>}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {ex.sets?.map((s, j) => (
                              <span key={j} className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                S{j+1}{s.reps ? ': ' + s.reps + ' reps' : ''}{s.weight ? ' × ' + s.weight + 'kg' : ''}{s.duration ? ': ' + s.duration + 's' : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    {totalCalories > 0 && (
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-1.5 text-sm text-red-400 font-medium">
                        <Flame size={14} /> Total estimé : {totalCalories} kcal brûlées
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProgramCard({ program, onLoad, onDelete, custom, bodyWeight }) {
  const { totalCalories } = calculateWorkoutCalories(program, bodyWeight);
  return (
    <div className="card p-4 hover:border-green-200 dark:hover:border-green-700 transition-all">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900 dark:text-white text-sm">{program.title}</p>
            {custom && <span className="badge bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs">Perso</span>}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-gray-400">{program.exercises?.length} exercices{program.duration ? ' · ' + program.duration + ' min' : ''}</p>
            {totalCalories > 0 && <span className="text-xs text-red-400 flex items-center gap-0.5"><Flame size={10} />~{totalCalories} kcal</span>}
          </div>
        </div>
        {onDelete && (
          <button onClick={onDelete} className="text-gray-300 hover:text-red-400 transition-colors" title={custom ? 'Supprimer' : 'Masquer'}>
            <Trash2 size={14} />
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {program.exercises?.slice(0, 3).map((ex, i) => <span key={i} className="badge bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs">{ex.name}</span>)}
        {program.exercises?.length > 3 && <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-400 text-xs">+{program.exercises.length - 3}</span>}
      </div>
      <button onClick={onLoad} className="btn-primary w-full flex items-center justify-center gap-2 py-2 text-sm"><Play size={13} /> Démarrer</button>
    </div>
  );
}

function ExerciseInput({ index, control, register, onRemove }) {
  const { fields: setFields, append: addSet } = useFieldArray({ control, name: 'exercises.' + index + '.sets' });
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <input className="input flex-1" placeholder="Nom de l'exercice" {...register('exercises.' + index + '.name', { required: true })} />
        <select className="input w-32" {...register('exercises.' + index + '.category')}>
          <option value="strength">Muscu</option>
          <option value="cardio">Cardio</option>
        </select>
        <button type="button" onClick={onRemove} className="text-gray-400 hover:text-red-400 p-1"><Trash2 size={15} /></button>
      </div>
      <div className="space-y-2">
        {setFields.map((s, j) => (
          <div key={s.id} className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-10 flex-shrink-0">S{j+1}</span>
            <input type="number" placeholder="Reps" className="input text-center text-sm" style={{ width: '70px', padding: '6px 8px' }} {...register('exercises.' + index + '.sets.' + j + '.reps')} />
            <span className="text-gray-300 text-xs">×</span>
            <input type="number" placeholder="kg" className="input text-center text-sm" style={{ width: '70px', padding: '6px 8px' }} {...register('exercises.' + index + '.sets.' + j + '.weight')} />
          </div>
        ))}
        <button type="button" onClick={() => addSet({ reps: '', weight: '' })} className="text-xs text-green-500 hover:underline">+ Série</button>
      </div>
    </div>
  );
}

function Spinner() {
  return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /></div>;
}
