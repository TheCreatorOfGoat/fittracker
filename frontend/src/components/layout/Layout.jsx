import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, UtensilsCrossed, CheckSquare, User, LogOut, Flame, Scale, Droplets, BarChart2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/workouts',  icon: Dumbbell,         label: 'Entraînements' },
  { to: '/food',      icon: UtensilsCrossed,  label: 'Alimentation' },
  { to: '/tasks',     icon: CheckSquare,      label: 'Habitudes' },
  { to: '/weight',    icon: Scale,            label: 'Poids' },
  { to: '/hydration', icon: Droplets,         label: 'Hydratation' },
  { to: '/report',    icon: BarChart2,        label: 'Rapport' },
  { to: '/profile',   icon: User,             label: 'Profil' },
];

// Sur mobile on affiche seulement les 5 premiers + profil
const mobileItems = [
  { to: '/',         icon: LayoutDashboard, label: 'Home' },
  { to: '/workouts', icon: Dumbbell,        label: 'Sport' },
  { to: '/food',     icon: UtensilsCrossed, label: 'Food' },
  { to: '/tasks',    icon: CheckSquare,     label: 'Habits' },
  { to: '/profile',  icon: User,            label: 'Profil' },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  function handleLogout() { logout(); navigate('/login'); }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-60 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="w-8 h-8 rounded-xl bg-green-500 flex items-center justify-center">
            <Flame size={16} className="text-white" />
          </div>
          <span className="font-display text-lg font-bold text-gray-900 dark:text-white">FitTracker</span>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'}`}>
              <Icon size={17} />{label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-4 border-t border-gray-100 dark:border-gray-800 pt-3">
          <div className="flex items-center gap-3 px-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-ghost w-full flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm">
            <LogOut size={15} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center"><Flame size={14} className="text-white" /></div>
            <span className="font-display font-bold text-gray-900 dark:text-white">FitTracker</span>
          </div>
          <button onClick={handleLogout} className="text-gray-400"><LogOut size={18} /></button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto animate-fade-in"><Outlet /></div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-1 py-2 flex justify-around">
          {mobileItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) => `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all ${isActive ? 'text-green-500' : 'text-gray-400'}`}>
              <Icon size={19} />
              <span className="text-[9px] font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
