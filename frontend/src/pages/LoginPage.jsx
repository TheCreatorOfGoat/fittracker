import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Flame, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function LoginPage() {
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm();

  async function onSubmit(data) {
    setServerError('');
    const result = await login(data.email, data.password);
    if (result.success) navigate('/');
    else setServerError(result.error);
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Left — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-green-500 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <Flame size={20} className="text-white" />
          </div>
          <span className="font-display text-xl font-bold">FitTracker</span>
        </div>
        <div>
          <h1 className="font-display text-5xl font-extrabold leading-tight mb-6">
            Transforme<br/>ton corps,<br/>transforme<br/>ta vie.
          </h1>
          <p className="text-green-100 text-lg">
            Suivi des entraînements, alimentation et habitudes quotidiennes — tout en un.
          </p>
        </div>
        <p className="text-green-200 text-sm">
          © {new Date().getFullYear()} FitTracker. Tous droits réservés.
        </p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              <div className="w-8 h-8 rounded-xl bg-green-500 flex items-center justify-center">
                <Flame size={16} className="text-white" />
              </div>
              <span className="font-display text-lg font-bold text-gray-900 dark:text-white">FitTracker</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Bon retour ! 👋</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Connecte-toi pour continuer ton parcours.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
                {serverError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                placeholder="toi@exemple.com"
                className="input"
                {...register('email', { required: 'Email requis', pattern: { value: /^\S+@\S+$/i, message: 'Email invalide' } })}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input pr-10"
                  {...register('password', { required: 'Mot de passe requis' })}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-60">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-green-500 font-medium hover:underline">Créer un compte</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
