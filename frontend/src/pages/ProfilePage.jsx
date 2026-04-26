import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Zap } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { getRecommendedMacros } from '../utils/fitnessUtils';

const GOALS = [
  { value: 'lose_weight', emoji: '🔥', label: 'Perte de poids',  desc: 'Deficit de 500 kcal/j' },
  { value: 'gain_muscle', emoji: '💪', label: 'Prise de muscle', desc: 'Surplus de 300 kcal/j' },
  { value: 'maintain',    emoji: '⚖️', label: 'Maintien',        desc: 'Balance neutre' },
];

const ACTIVITY_LEVELS = [
  { value: 'sedentary',   emoji: '🛋️', label: 'Sedentaire',       desc: "Peu ou pas d'exercice" },
  { value: 'light',       emoji: '🚶', label: 'Legerement actif', desc: '1-3j / semaine' },
  { value: 'moderate',    emoji: '🏃', label: 'Moderement actif', desc: '3-5j / semaine' },
  { value: 'active',      emoji: '⚡', label: 'Tres actif',       desc: '6-7j / semaine' },
  { value: 'very_active', emoji: '🏆', label: 'Athlete',          desc: 'Sport intense quotidien' },
];

const GENDERS = [
  { value: 'male',   label: 'Homme' },
  { value: 'female', label: 'Femme' },
  { value: 'other',  label: 'Autre' },
];

const BADGE_INFO = {
  streak_7:  { emoji: '🔥', label: '7 jours consecutifs',  color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' },
  streak_30: { emoji: '💎', label: '30 jours consecutifs', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' },
  dedicated: { emoji: '⭐', label: 'Athlete assidu',        color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' },
};

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const [saved, setSaved] = useState(false);
  const [calories, setCalories] = useState(user?.dailyCalories || null);
  const [selectedGoal, setSelectedGoal] = useState(user?.profile?.goal || 'maintain');
  const [selectedActivity, setSelectedActivity] = useState(user?.profile?.activityLevel || 'moderate');
  const [selectedGender, setSelectedGender] = useState(user?.profile?.gender || 'other');
  const recommendedMacros = getRecommendedMacros(calories, selectedGoal);

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      weight:       user?.profile?.weight || '',
      targetWeight: user?.profile?.targetWeight || '',
      height:       user?.profile?.height || '',
      age:          user?.profile?.age || '',
    },
  });

  async function onSubmit(data) {
    const result = await updateProfile({
      profile: {
        weight: Number(data.weight), targetWeight: Number(data.targetWeight),
        height: Number(data.height), age: Number(data.age),
        gender: selectedGender, goal: selectedGoal, activityLevel: selectedActivity,
      },
    });
    setCalories(result.dailyCalories);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const activeClass = 'border-green-500 bg-green-50 dark:bg-green-900/30';
  const inactiveClass = 'border-gray-200 dark:border-gray-700 hover:border-gray-300';
  const activeText = 'text-green-600 dark:text-green-400';
  const inactiveText = 'text-gray-900 dark:text-white';

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Mon profil</h1>
        {saved && <span className="text-green-500 text-sm font-medium animate-fade-in">✓ Sauvegarde !</span>}
      </div>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 text-2xl font-bold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white text-lg">{user?.name}</p>
          <p className="text-gray-400 text-sm">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Donnees physiques */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Donnees physiques</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Poids actuel (kg)</label>
              <input type="number" step="0.1" className="input" placeholder="75" {...register('weight')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Poids objectif (kg)</label>
              <input type="number" step="0.1" className="input" placeholder="70" {...register('targetWeight')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Taille (cm)</label>
              <input type="number" className="input" placeholder="175" {...register('height')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Age</label>
              <input type="number" className="input" placeholder="25" {...register('age')} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Genre</label>
            <div className="flex gap-3">
              {GENDERS.map(g => (
                <button key={g.value} type="button" onClick={() => setSelectedGender(g.value)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${selectedGender === g.value ? activeClass + ' ' + activeText : inactiveClass + ' text-gray-600 dark:text-gray-400'}`}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Objectif */}
        <div className="card p-6 space-y-3">
          <h2 className="font-semibold text-gray-900 dark:text-white">Objectif fitness</h2>
          {GOALS.map(g => (
            <button key={g.value} type="button" onClick={() => setSelectedGoal(g.value)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${selectedGoal === g.value ? activeClass : inactiveClass}`}>
              <span className="text-2xl">{g.emoji}</span>
              <div className="flex-1">
                <p className={`font-medium ${selectedGoal === g.value ? activeText : inactiveText}`}>{g.label}</p>
                <p className="text-xs text-gray-400">{g.desc}</p>
              </div>
              {selectedGoal === g.value && (
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Niveau d'activite */}
        <div className="card p-6 space-y-3">
          <h2 className="font-semibold text-gray-900 dark:text-white">Niveau d'activite</h2>
          {ACTIVITY_LEVELS.map(a => (
            <button key={a.value} type="button" onClick={() => setSelectedActivity(a.value)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${selectedActivity === a.value ? activeClass : inactiveClass}`}>
              <span className="text-xl">{a.emoji}</span>
              <div className="flex-1">
                <p className={`text-sm font-medium ${selectedActivity === a.value ? activeText : inactiveText}`}>{a.label}</p>
                <p className="text-xs text-gray-400">{a.desc}</p>
              </div>
              {selectedActivity === a.value && (
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </button>
          ))}

          {calories && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mt-2">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={16} className="text-green-500" />
                <p className="font-medium text-green-700 dark:text-green-300">
                  Besoins : <span className="font-bold">{calories} kcal/j</span>
                </p>
              </div>
              {recommendedMacros && (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><p className="font-bold text-blue-500">{recommendedMacros.protein.grams}g</p><p className="text-xs text-gray-400">Proteines</p></div>
                  <div><p className="font-bold text-yellow-500">{recommendedMacros.carbs.grams}g</p><p className="text-xs text-gray-400">Glucides</p></div>
                  <div><p className="font-bold text-pink-500">{recommendedMacros.fat.grams}g</p><p className="text-xs text-gray-400">Lipides</p></div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Badges */}
        {user?.badges?.length > 0 && (
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Mes badges</h2>
            <div className="flex flex-wrap gap-3">
              {user.badges.map(badge => (
                <div key={badge} className={`badge px-4 py-2 ${BADGE_INFO[badge]?.color || 'bg-gray-100 text-gray-600'}`}>
                  <span className="text-lg">{BADGE_INFO[badge]?.emoji}</span>
                  <span>{BADGE_INFO[badge]?.label || badge}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
          <Save size={16} />
          {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder le profil'}
        </button>
      </form>
    </div>
  );
}
