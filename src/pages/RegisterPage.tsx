import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { calculateBMI, BMI_DISCLAIMER } from '../services/fitnessService';
import { FitnessGoal, FitnessLevel, Gender } from '../types';
import {
  Dumbbell,
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Activity,
  Heart,
  Scale,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { signUpWithEmail, signUpWithLocalProfile, loginWithGoogle } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  // Multi-step registration flow: Step 1: Account, Step 2: Body & Fitness Onboarding
  const [step, setStep] = useState<1 | 2>(1);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState<number>(26);
  const [gender, setGender] = useState<Gender>('prefer_not_to_say');
  const [height, setHeight] = useState<number>(175);
  const [startingWeight, setStartingWeight] = useState<number>(72);
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>('Weight Loss');
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>('Beginner');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [operationNotAllowed, setOperationNotAllowed] = useState(false);

  // Live BMI calculation preview
  const liveBmi = calculateBMI(startingWeight, height);

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Please complete all account fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setErrorMsg('');
    setStep(2);
  };

  const handleStartLocalProfile = async () => {
    setLoading(true);
    try {
      await signUpWithLocalProfile({
        name,
        email,
        password,
        age: Number(age),
        gender,
        height: Number(height),
        startingWeight: Number(startingWeight),
        fitnessGoal,
        fitnessLevel,
      });
      showToast('success', 'Challenge Started!', 'Welcome to Day 1 of FitTrack 30.');
      navigate('/dashboard');
    } catch (err: any) {
      showToast('error', 'Error', err.message || 'Could not start profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (height <= 50 || height > 280) {
      setErrorMsg('Please enter a realistic height in cm (e.g., 175).');
      return;
    }
    if (startingWeight <= 25 || startingWeight > 350) {
      setErrorMsg('Please enter a realistic starting weight in kg (e.g., 72).');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setOperationNotAllowed(false);

    try {
      await signUpWithEmail({
        name,
        email,
        password,
        age: Number(age),
        gender,
        height: Number(height),
        startingWeight: Number(startingWeight),
        fitnessGoal,
        fitnessLevel,
      });

      showToast('success', 'Challenge Started!', 'Welcome to Day 1 of FitTrack 30.');
      navigate('/dashboard');
    } catch (err: any) {
      console.warn('Registration note:', err);
      let message = 'Could not create your profile. Please check details.';
      if (err.code === 'auth/operation-not-allowed') {
        setOperationNotAllowed(true);
        message = 'Email/Password sign-in is disabled in your Firebase console. You can enable it in Firebase or start immediately with a Local Athlete Profile.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password is too weak. Please use at least 6 characters.';
      }
      setErrorMsg(message);
      showToast('warning', 'Notice', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-4 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/25 group-hover:scale-105 transition-transform">
            <Dumbbell className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-['Outfit']">
            FitTrack <span className="text-emerald-500">30</span>
          </span>
        </Link>
        <h2 className="text-center text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
          {step === 1 ? 'Create Your Account' : 'Set Your 30-Day Fitness Baseline'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 underline">
            Log in here
          </Link>
        </p>

        {/* Step progress pills */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <span className={`h-2 rounded-full transition-all duration-300 ${step === 1 ? 'w-10 bg-emerald-500' : 'w-4 bg-emerald-500/40'}`} />
          <span className={`h-2 rounded-full transition-all duration-300 ${step === 2 ? 'w-10 bg-emerald-500' : 'w-4 bg-slate-300 dark:bg-slate-700'}`} />
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-xl border border-slate-200 dark:border-slate-800 rounded-3xl">
          {errorMsg && (
            <div className={`mb-6 p-4 rounded-2xl border text-xs ${
              operationNotAllowed
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300'
            }`}>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div className="space-y-2">
                  <span className="font-bold block">{errorMsg}</span>
                  {operationNotAllowed && (
                    <div className="space-y-3 pt-2 border-t border-amber-200/60 dark:border-amber-800/60">
                      <div className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                        <span className="font-bold">To enable Cloud Email/Password:</span>
                        <ol className="list-decimal pl-4 mt-1 space-y-0.5">
                          <li>Go to <a href="https://console.firebase.google.com/project/fitness-tracker-1be7d/authentication/providers" target="_blank" rel="noreferrer" className="underline font-bold text-amber-900 dark:text-white">Firebase Console &gt; Authentication &gt; Sign-in method</a></li>
                          <li>Click on <b>Email/Password</b> and toggle it to <b>Enable</b>, then click <b>Save</b>.</li>
                        </ol>
                      </div>

                      <div className="pt-1 flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={handleStartLocalProfile}
                          disabled={loading}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                        >
                          Start Instantly with Local Profile (No Setup Needed)
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleStep1Next} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jordan Miller"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jordan@example.com"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 chars"
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
              >
                Continue to Fitness Profile
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleFinalSubmit} className="space-y-5">
              {/* Demographics */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="14"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 20)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Physical Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    min="90"
                    max="250"
                    value={height}
                    onChange={(e) => setHeight(parseFloat(e.target.value) || 170)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Starting Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="300"
                    value={startingWeight}
                    onChange={(e) => setStartingWeight(parseFloat(e.target.value) || 70)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Live Initial BMI Preview */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Calculated Baseline BMI
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
                      {liveBmi.value}
                    </span>
                    <span className="text-xs text-slate-500">kg/m²</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${liveBmi.category.bgLight} ${liveBmi.category.color}`}>
                  {liveBmi.category.category}
                </span>
              </div>

              {/* Fitness Goal Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Primary Fitness Goal
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Weight Loss', 'Muscle Gain', 'General Fitness', 'Improve Stamina'] as FitnessGoal[]).map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setFitnessGoal(goal)}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                        fitnessGoal === goal
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fitness Level Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Current Fitness Experience
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Beginner', 'Intermediate', 'Advanced'] as FitnessLevel[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFitnessLevel(level)}
                      className={`py-2 px-3 rounded-xl border text-center text-xs font-bold transition-all ${
                        fitnessLevel === level
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="text-[11px] text-slate-400 dark:text-slate-500 flex gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{BMI_DISCLAIMER}</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Creating FitTrack Profile...' : 'Begin 30-Day Challenge'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
