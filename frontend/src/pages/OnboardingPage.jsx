import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, ChevronRight, ChevronLeft } from 'lucide-react';
import useAuthStore from '../store/authStore';

const STEPS = [
  {
    id: 'goal',
    title: 'Quel est ton objectif ?',
    subtitle: 'On va personnaliser ton expérience selon tes ambitions.',
    field: 'goal',
    type: 'choice',
    options: [
      { value: 'lose_weight', emoji: '🔥', label: 'Perdre du poids',    desc: 'Brûler les graisses et affiner ma silhouette' },
      { value: 'gain_muscle', emoji: '💪', label: 'Prendre du muscle',  desc: 'Gagner en masse et en force' },
      { value: 'maintain',    emoji: '⚖️', label: 'Maintenir ma forme', desc: 'Rester en forme et en bonne santé' },
    ],
  },
  {
    id: 'gender',
    title: 'Tu es ?',
    subtitle: 'Nécessaire pour calculer tes besoins caloriques.',
    field: 'gender',
    type: 'choice',
    options: [
      { value: 'male',   emoji: '👨', label: 'Homme', desc: '' },
      { value: 'female', emoji: '👩', label: 'Femme',  desc: '' },
      { value: 'other',  emoji: '🧑', label: 'Autre',  desc: '' },
    ],
  },
  {
    id: 'body',
    title: 'Tes mesures',
    subtitle: 'Pour calculer tes besoins caloriques précisément.',
    type: 'inputs',
    fields: [
      { key: 'age',    label: 'Âge',      placeholder: '25',  unit: 'ans', type: 'number' },
      { key: 'height', label: 'Taille',   placeholder: '175', unit: 'cm',  type: 'number' },
      { key: 'weight', label: 'Poids actuel', placeholder: '75', unit: 'kg', type: 'number' },
      { key: 'targetWeight', label: 'Poids objectif', placeholder: '70', unit: 'kg', type: 'number' },
    ],
  },
  {
    id: 'activity',
    title: 'Ton niveau d\'activité ?',
    subtitle: 'En dehors de tes entraînements, tu bouges combien ?',
    field: 'activityLevel',
    type: 'choice',
    options: [
      { value: 'sedentary',   emoji: '🛋️', label: 'Sédentaire',         desc: 'Travail de bureau, peu de mouvement' },
      { value: 'light',       emoji: '🚶', label: 'Légèrement actif',   desc: '1-3 séances par semaine' },
      { value: 'moderate',    emoji: '🏃', label: 'Modérément actif',   desc: '3-5 séances par semaine' },
      { value: 'active',      emoji: '⚡', label: 'Très actif',          desc: '6-7 séances par semaine' },
      { value: 'very_active', emoji: '🏆', label: 'Athlète',            desc: 'Sport intense tous les jours' },
    ],
  },
];

export default function OnboardingPage() {
  const { updateProfile, refreshUser } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    goal: '', gender: '', age: '', height: '', weight: '', targetWeight: '', activityLevel: '',
  });
  const [loading, setLoading] = useState(false);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  function selectChoice(field, value) {
    setAnswers(a => ({ ...a, [field]: value }));
  }

  function updateInput(key, value) {
    setAnswers(a => ({ ...a, [key]: value }));
  }

  function canNext() {
    if (current.type === 'choice') return !!answers[current.field];
    if (current.type === 'inputs') return current.fields.every(f => answers[f.key]);
    return true;
  }

  async function finish() {
    setLoading(true);
    try {
      await updateProfile({
        profile: {
          goal:          answers.goal,
          gender:        answers.gender,
          age:           Number(answers.age),
          height:        Number(answers.height),
          weight:        Number(answers.weight),
          targetWeight:  Number(answers.targetWeight),
          activityLevel: answers.activityLevel,
        },
      });
      await refreshUser();
      localStorage.setItem('ft_onboarding_done', '1');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-8 py-6">
        <div className="w-8 h-8 rounded-xl bg-green-500 flex items-center justify-center">
          <Flame size={16} className="text-white" />
        </div>
        <span className="font-display text-lg font-bold text-gray-900 dark:text-white">FitTracker</span>
      </div>

      {/* Progress bar */}
      <div className="px-8">
        <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">{step + 1} / {STEPS.length}</p>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        <div className="w-full max-w-lg animate-slide-up">
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {current.title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">{current.subtitle}</p>

          {/* Choices */}
          {current.type === 'choice' && (
            <div className="space-y-3">
              {current.options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => selectChoice(current.field, opt.value)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                    answers[current.field] === opt.value
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900'
                  }`}
                >
                  <span className="text-3xl flex-shrink-0">{opt.emoji}</span>
                  <div className="flex-1">
                    <p className={`font-semibold ${answers[current.field] === opt.value ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                      {opt.label}
                    </p>
                    {opt.desc && <p className="text-sm text-gray-400 mt-0.5">{opt.desc}</p>}
                  </div>
                  {answers[current.field] === opt.value && (
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Inputs */}
          {current.type === 'inputs' && (
            <div className="grid grid-cols-2 gap-4">
              {current.fields.map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{f.label}</label>
                  <div className="relative">
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      value={answers[f.key]}
                      onChange={e => updateInput(f.key, e.target.value)}
                      className="input pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">{f.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-8 pb-8">
        <button
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
          className="btn-ghost flex items-center gap-2 disabled:opacity-30"
        >
          <ChevronLeft size={18} /> Retour
        </button>

        {isLast ? (
          <button
            onClick={finish}
            disabled={!canNext() || loading}
            className="btn-primary flex items-center gap-2 px-8 py-3 disabled:opacity-50"
          >
            {loading ? 'Sauvegarde...' : 'Commencer 🚀'}
          </button>
        ) : (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canNext()}
            className="btn-primary flex items-center gap-2 px-6 py-3 disabled:opacity-50"
          >
            Suivant <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
