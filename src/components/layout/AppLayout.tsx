import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ToastContainer } from '../common/ToastContainer';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { OfflineIndicator } from '../pwa/OfflineIndicator';
import {
  LayoutDashboard,
  CalendarDays,
  LineChart,
  Trophy,
  Award,
  User,
  Settings,
  ShieldAlert,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Flame,
  Dumbbell,
  CheckCircle2,
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { userProfile, isAdmin, logoutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (e) {
      console.error(e);
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: '30-Day Challenge', path: '/challenge', icon: CalendarDays },
    { label: 'Leaderboard', path: '/leaderboard', icon: Award },
    { label: 'Progress & Charts', path: '/progress', icon: LineChart },
    { label: 'Achievements', path: '/achievements', icon: Trophy },
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  if (isAdmin) {
    navItems.push({
      label: 'Admin Portal',
      path: '/admin',
      icon: ShieldAlert,
    });
  }

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-5 shrink-0 justify-between min-h-screen sticky top-0">
        <div>
          {/* Brand */}
          <Link to="/dashboard" className="flex items-center gap-3 mb-8 px-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white font-['Outfit'] block leading-none">
                FitTrack <span className="text-emerald-500">30</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Health Challenge
              </span>
            </div>
          </Link>

          {/* User Micro Card */}
          {userProfile && (
            <div className="mb-6 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center overflow-hidden shrink-0">
                  {userProfile.profilePhoto ? (
                    <img src={userProfile.profilePhoto} alt={userProfile.name} className="w-full h-full object-cover" />
                  ) : (
                    userProfile.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {userProfile.name}
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 inline" /> {userProfile.currentStreak || 0}d streak
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Day</span>
                <span className="text-sm font-black text-slate-900 dark:text-white font-['Outfit']">
                  {userProfile.currentDay}/30
                </span>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span className="truncate">{item.label}</span>
                  {item.label === '30-Day Challenge' && userProfile && (
                    <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {Math.round(((userProfile.completedDays || 0) / 30) * 100)}%
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* PWA Install Promo on Sidebar */}
        <div className="my-3">
          <PWAInstallButton variant="sidebar" />
        </div>

        {/* Sidebar Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Theme</span>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Toggle Light/Dark Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white">
            <Dumbbell className="w-4 h-4" />
          </div>
          <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white font-['Outfit']">
            FitTrack <span className="text-emerald-500">30</span>
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <PWAInstallButton variant="header" />

          {userProfile && (
            <div className="hidden sm:flex px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Day {userProfile.currentDay}/30</span>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 space-y-2 z-40 animate-in slide-in-from-top-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive
                    ? 'bg-emerald-500 text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-24 md:pb-8 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar (as specifically requested in prompt: Mobile bottom navigation) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-2 flex items-center justify-around z-40">
        {[
          { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
          { label: 'Challenge', path: '/challenge', icon: CalendarDays },
          { label: 'Leaders', path: '/leaderboard', icon: Award },
          { label: 'Progress', path: '/progress', icon: LineChart },
          { label: 'Profile', path: '/profile', icon: User },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-bold transition-colors ${
                isActive
                  ? 'text-emerald-500'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Offline Mode Indicator */}
      <OfflineIndicator />

      {/* Centralized Toast Notifications Container */}
      <ToastContainer />
    </div>
  );
};
