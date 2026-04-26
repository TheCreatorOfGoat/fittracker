import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import WorkoutsPage from './pages/WorkoutsPage';
import FoodPage from './pages/FoodPage';
import TasksPage from './pages/TasksPage';
import ProfilePage from './pages/ProfilePage';
import WeightPage from './pages/WeightPage';
import HydrationPage from './pages/HydrationPage';
import ReportPage from './pages/ReportPage';

function PrivateRoute({ children }) {
  const token = useAuthStore(s => s.token);
  return token ? children : <Navigate to="/login" replace />;
}

function OnboardingGuard({ children }) {
  const token = useAuthStore(s => s.token);
  const user = useAuthStore(s => s.user);
  if (!token) return <Navigate to="/login" replace />;
  const done = localStorage.getItem('ft_onboarding_done');
  if (!done && !user?.profile?.goal) return <Navigate to="/onboarding" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"      element={<LoginPage />} />
      <Route path="/register"   element={<RegisterPage />} />
      <Route path="/onboarding" element={<PrivateRoute><OnboardingPage /></PrivateRoute>} />

      <Route path="/" element={<OnboardingGuard><Layout /></OnboardingGuard>}>
        <Route index             element={<DashboardPage />} />
        <Route path="workouts"   element={<WorkoutsPage />} />
        <Route path="food"       element={<FoodPage />} />
        <Route path="tasks"      element={<TasksPage />} />
        <Route path="weight"     element={<WeightPage />} />
        <Route path="hydration"  element={<HydrationPage />} />
        <Route path="report"     element={<ReportPage />} />
        <Route path="profile"    element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
