import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { calculateBMI, uploadProgressPhoto } from '../services/fitnessService';
import { BMICard } from '../components/common/BMICard';
import { FitnessGoal, FitnessLevel, Gender } from '../types';
import {
  User,
  Mail,
  Camera,
  Save,
  Activity,
  Calendar,
  Flame,
  Award,
  Shield,
  Sparkles,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const { showToast } = useNotification();

  const [name, setName] = useState(userProfile?.name || '');
  const [age, setAge] = useState<number>(userProfile?.age || 26);
  const [gender, setGender] = useState<Gender>(userProfile?.gender || 'prefer_not_to_say');
  const [height, setHeight] = useState<number>(userProfile?.height || 175);
  const [currentWeight, setCurrentWeight] = useState<number>(userProfile?.currentWeight || 70);
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>(userProfile?.fitnessGoal || 'General Fitness');
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>(userProfile?.fitnessLevel || 'Beginner');

  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && userProfile) {
      const file = e.target.files[0];
      setPhotoUploading(true);
      try {
        const photoUrl = await uploadProgressPhoto(userProfile.id, 0, file);
        await updateUserProfile({ profilePhoto: photoUrl });
        showToast('success', 'Profile Photo Updated', 'Your new photo is now active.');
      } catch (err: any) {
        showToast('error', 'Upload Failed', err.message || 'Could not update photo.');
      } finally {
        setPhotoUploading(false);
      }
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      showToast('warning', 'Required', 'Name cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      await updateUserProfile({
        name,
        age: Number(age),
        gender,
        height: Number(height),
        currentWeight: Number(currentWeight),
        fitnessGoal,
        fitnessLevel,
      });
      showToast('success', 'Profile Updated', 'Your changes have been saved.');
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Personal Information
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
          Athlete Profile
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your account baseline, physical parameters, and training preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card & Photo */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col items-center text-center">
          <div className="relative mb-4 group">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-emerald-500/20 shadow-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl font-black text-emerald-600">
              {userProfile?.profilePhoto ? (
                <img
                  src={userProfile.profilePhoto}
                  alt={userProfile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                userProfile?.name?.charAt(0).toUpperCase() || 'A'
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-md cursor-pointer transition-colors">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={photoUploading}
                className="hidden"
              />
            </label>
          </div>

          <h3 className="text-lg font-black text-slate-900 dark:text-white font-['Outfit']">
            {userProfile?.name}
          </h3>
          <span className="text-xs text-slate-400">{userProfile?.email}</span>

          <div className="w-full mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3 text-left text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Account Role</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">
                {userProfile?.role}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Start Date</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {userProfile?.challengeStartDate
                  ? new Date(userProfile.challengeStartDate).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Completed Days</span>
              <span className="font-bold text-emerald-500">{userProfile?.completedDays || 0} / 30</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Best Streak</span>
              <span className="font-bold text-amber-500">{userProfile?.bestStreak || 0} Days</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={userProfile?.email || ''}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 text-sm text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 20)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(parseFloat(e.target.value) || 170)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(parseFloat(e.target.value) || 70)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Fitness Goal
                </label>
                <select
                  value={fitnessGoal}
                  onChange={(e) => setFitnessGoal(e.target.value as FitnessGoal)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white"
                >
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Muscle Gain">Muscle Gain</option>
                  <option value="General Fitness">General Fitness</option>
                  <option value="Improve Stamina">Improve Stamina</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Fitness Level
                </label>
                <select
                  value={fitnessLevel}
                  onChange={(e) => setFitnessLevel(e.target.value as FitnessLevel)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </div>

      {/* Embedded BMI Card */}
      <BMICard
        currentWeight={currentWeight}
        height={height}
        showInlineCalculator={false}
      />
    </div>
  );
};
