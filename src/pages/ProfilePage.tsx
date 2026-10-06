import React, { useState, useRef } from 'react';
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
  RotateCw,
  Trash2,
  Upload,
  Check,
} from 'lucide-react';

const PRESET_AVATARS = [
  { id: 'runner', label: 'Runner', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
  { id: 'lifter', label: 'Lifter', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
  { id: 'warrior', label: 'Warrior', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=300&q=80' },
  { id: 'athlete', label: 'Athlete', url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=300&q=80' },
];

export const ProfilePage: React.FC = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const { showToast } = useNotification();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState(userProfile?.name || '');
  const [age, setAge] = useState<number>(userProfile?.age || 26);
  const [gender, setGender] = useState<Gender>(userProfile?.gender || 'prefer_not_to_say');
  const [height, setHeight] = useState<number>(userProfile?.height || 175);
  const [currentWeight, setCurrentWeight] = useState<number>(userProfile?.currentWeight || 70);
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>(userProfile?.fitnessGoal || 'General Fitness');
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>(userProfile?.fitnessLevel || 'Beginner');

  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile) return;

    // Reset input value so re-selecting the same file also triggers
    const inputElement = e.target;

    setPhotoUploading(true);
    try {
      const photoUrl = await uploadProgressPhoto(userProfile.id, 0, file);
      await updateUserProfile({ profilePhoto: photoUrl });
      showToast('success', 'Profile Photo Updated', 'Your new photo is now active.');
    } catch (err: any) {
      console.error('Photo upload error:', err);
      showToast('error', 'Upload Failed', err.message || 'Could not update photo.');
    } finally {
      inputElement.value = '';
      setPhotoUploading(false);
    }
  };

  const handleSelectPreset = async (url: string) => {
    if (!userProfile) return;
    setPhotoUploading(true);
    try {
      await updateUserProfile({ profilePhoto: url });
      showToast('success', 'Avatar Updated', 'New athlete avatar applied.');
      setShowPresets(false);
    } catch (err: any) {
      showToast('error', 'Failed', err.message || 'Could not update avatar.');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!userProfile) return;
    setPhotoUploading(true);
    try {
      await updateUserProfile({ profilePhoto: '' });
      showToast('info', 'Photo Removed', 'Default athlete avatar restored.');
    } catch (err: any) {
      showToast('error', 'Error', err.message || 'Could not remove photo.');
    } finally {
      setPhotoUploading(false);
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
          {/* Avatar Container */}
          <div className="relative mb-4 group">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={photoUploading}
              className="w-28 h-28 rounded-full overflow-hidden border-4 border-emerald-500/20 shadow-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl font-black text-emerald-600 relative cursor-pointer hover:border-emerald-500 transition-all focus:outline-none"
              title="Click to change profile photo"
            >
              {userProfile?.profilePhoto ? (
                <img
                  src={userProfile.profilePhoto}
                  alt={userProfile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                userProfile?.name?.charAt(0).toUpperCase() || 'A'
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold">
                <Camera className="w-5 h-5 mb-0.5" />
                <span>Change</span>
              </div>

              {/* Uploading Spinner */}
              {photoUploading && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white text-[10px] font-bold z-10">
                  <RotateCw className="w-5 h-5 animate-spin mb-1 text-emerald-400" />
                  <span>Saving...</span>
                </div>
              )}
            </button>

            {/* Quick Floating Camera Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={photoUploading}
              className="absolute bottom-0 right-0 p-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-md cursor-pointer transition-transform hover:scale-110 active:scale-95 focus:outline-none"
              title="Upload new photo"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handlePhotoUpload}
              disabled={photoUploading}
              className="hidden"
            />
          </div>

          {/* Action Buttons for Photo */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={photoUploading}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Photo</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Avatars</span>
            </button>

            {userProfile?.profilePhoto && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={photoUploading}
                className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs transition-colors"
                title="Remove photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Preset Avatars Drawer */}
          {showPresets && (
            <div className="w-full mb-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 animate-in fade-in zoom-in-95 duration-150">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2">
                Choose Athlete Avatar:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_AVATARS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.url)}
                    className="group flex flex-col items-center gap-1 focus:outline-none"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-transparent group-hover:border-emerald-500 transition-all shadow-sm">
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 group-hover:text-emerald-500 font-medium truncate max-w-full">
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

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
          </div>
        </div>

        {/* Profile Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <form
            onSubmit={handleSaveProfile}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">
              Edit Athlete Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Email (Account Identifier)
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={userProfile?.email || ''}
                    disabled
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/30 text-slate-400 text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="10"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Height (cm)
                </label>
                <input
                  type="number"
                  min="100"
                  max="250"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Current Weight (kg)
                </label>
                <input
                  type="number"
                  min="30"
                  max="300"
                  step="0.1"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(Number(e.target.value))}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Primary Goal
                </label>
                <select
                  value={fitnessGoal}
                  onChange={(e) => setFitnessGoal(e.target.value as FitnessGoal)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Muscle Gain">Muscle Gain</option>
                  <option value="Endurance">Endurance & Cardio</option>
                  <option value="Flexibility">Flexibility & Core</option>
                  <option value="General Fitness">General Fitness</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Fitness Level
                </label>
                <select
                  value={fitnessLevel}
                  onChange={(e) => setFitnessLevel(e.target.value as FitnessLevel)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Beginner">Beginner (Starting Out)</option>
                  <option value="Intermediate">Intermediate (Active)</option>
                  <option value="Advanced">Advanced (Athlete)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={saving}
                className="py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>

          {/* BMI Status Card */}
          <BMICard currentWeight={currentWeight} height={height} />
        </div>
      </div>
    </div>
  );
};
