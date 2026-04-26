import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Flame } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../store/authStore';

export default function RegisterPage() {
  const { register: registerUser, loading } = useAuthStore();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  async function onSubmit(data) {
    setServerError('');
    const result = await registerUser(data.name, data.email, data.password);
    if (result.success) navigate('/');
    else setServerError(result.error);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-green-500 flex items-center justify-center">
            <Flame size={16} className="text-white" />
          </div>
          <span className="font-display text-lg font-bold text-gray-900 dark:text-white">FitTracker</span>
        </div>

        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Commence l'aventure 🚀</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Crée ton compte gratuitement.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
              {serverError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Prénom</label>
            <input className="input" placeholder="Alex" {...register('name', { required: 'Prénom requis' })} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
            <input type="email" className="input" placeholder="alex@exemple.com"
              {...register('email', { required: 'Email requis', pattern: { value: /^\S+@\S+$/i, message: 'Email invalide' } })} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mot de passe</label>
            <input type="password" className="input" placeholder="••••••••"
              {...register('password', { required: 'Mot de passe requis', minLength: { value: 6, message: 'Min. 6 caractères' } })} />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirmer le mot de passe</label>
            <input type="password" className="input" placeholder="••••••••"
              {...register('confirm', {
                required: 'Confirmation requise',
                validate: v => v === watch('password') || 'Les mots de passe ne correspondent pas',
              })} />
            {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-60">
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-green-500 font-medium hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
