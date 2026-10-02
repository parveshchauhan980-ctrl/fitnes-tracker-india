import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Dumbbell,
  ArrowRight,
  Flame,
  CheckCircle2,
  Calendar,
  LineChart,
  Trophy,
  Shield,
  Activity,
  Heart,
  Droplet,
  Moon,
  Sun,
  Users,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
              <Dumbbell className="w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white font-['Outfit']">
              FitTrack <span className="text-emerald-500">30</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {currentUser ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition-all"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold text-sm transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition-all hover:scale-105"
                >
                  Start Your Challenge
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 overflow-hidden">
        {/* Ambient lighting glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-10 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-widest mb-6 animate-pulse">
            <Flame className="w-4 h-4 text-emerald-500" />
            Join Thousands Building Lifelong Consistency
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-6 font-['Outfit']">
            30 Days. One Goal. <br />
            <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
              A Better You.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Track your workouts, build consistency, and see your progress every day.
            Personalized daily tasks, verified streak tracking, BMI monitoring, and photo evidence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-base shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              Start Your Challenge
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold text-base hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center"
            >
              Login to Account
            </Link>
          </div>

          {/* Social Proof Badges */}
          <div className="mt-14 pt-10 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-white font-['Outfit']">30 Days</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Science-Backed Habit</div>
            </div>
            <div>
              <div className="text-3xl font-black text-emerald-500 font-['Outfit']">100%</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Free Progression</div>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-white font-['Outfit']">5 Key Metrics</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Weight, Steps, Sleep, Water</div>
            </div>
            <div>
              <div className="text-3xl font-black text-teal-400 font-['Outfit']">Zero Clutter</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Focused On Results</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-100/70 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Simple & Effective
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-2 font-['Outfit']">
              How FitTrack 30 Works
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-3 text-sm sm:text-base">
              Follow our structured 4-step daily rhythm designed to permanently reshape your physical fitness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Set Your Baseline',
                desc: 'Enter your starting weight, height, fitness level, and primary goal (Weight Loss, Stamina, or Muscle).',
                icon: Activity,
              },
              {
                step: '02',
                title: 'Follow Daily Workouts',
                desc: 'Day 1 unlocks instantly. Each day provides targeted exercises with sets, reps, and guided timers.',
                icon: Dumbbell,
              },
              {
                step: '03',
                title: 'Submit Daily Log',
                desc: 'Record your weight, step count, water intake, sleep hours, and upload your optional progress photo.',
                icon: CheckCircle2,
              },
              {
                step: '04',
                title: 'Unlock & Transform',
                desc: 'Maintain streaks, unlock milestone achievements, and receive your comprehensive 30-Day Final Report.',
                icon: Trophy,
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.step}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative group hover:border-emerald-500/50 transition-all duration-300"
                >
                  <span className="text-4xl font-black text-slate-200 dark:text-slate-800 font-['Outfit'] absolute top-4 right-4">
                    {card.step}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Progressive Challenge
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-2 font-['Outfit']">
                From Day 1 to Day 30: Smart Progression
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
                No extreme shocks. FitTrack 30 begins with gentle habit-building (20-minute brisk walks, foundation squats, and hydration targets) and steadily introduces interval training, full-body circuits, and strength stamina.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Locked future days keep you focused strictly on today’s task',
                  'Interactive exercise checklists with sets and duration targets',
                  'Adaptive beginner, intermediate, and advanced pacing',
                  'Built-in safety notes and postural instructions',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all"
                >
                  Explore Day 1 Workout
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Preview Card Mockup */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">Day 1 Prescribed Task</span>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">Foundation Kickoff</h4>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Beginner Friendly
                </span>
              </div>

              <div className="py-6 space-y-3">
                {[
                  { name: '20-Minute Brisk Walk', meta: 'Aerobic Base • 20 mins' },
                  { name: '10 Bodyweight Squats', meta: '2 sets • Form focus' },
                  { name: '5 Push-ups (Knees or Incline)', meta: '2 sets • Core locked' },
                  { name: '2.0 Liters Water Target', meta: 'Hydration Habit' },
                  { name: '7+ Hours Sleep Target', meta: 'Rest & Recovery' },
                ].map((ex, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-md bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{ex.name}</span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{ex.meta}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Estimated duration: 25 mins</span>
                <span className="text-emerald-500 font-bold">Streak Reward: +1</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 bg-gradient-to-tr from-emerald-600 to-teal-700 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black font-['Outfit'] mb-6 tracking-tight">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-base sm:text-lg text-emerald-100 max-w-xl mx-auto mb-8">
            No equipment required. 30 days of structured daily guidance. Start right now.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50 font-black text-base shadow-xl shadow-black/20 hover:scale-105 transition-all"
            >
              Start Day 1 Free
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-800/40 hover:bg-emerald-800/60 text-white border border-emerald-400/30 font-bold text-base transition-all"
            >
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 text-center">
        <p>© 2026 FitTrack 30. All rights reserved. Always consult a healthcare professional before beginning new exercise programs.</p>
      </footer>
    </div>
  );
};
