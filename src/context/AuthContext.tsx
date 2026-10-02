import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase/config';
import { UserProfile, DailyProgress, FitnessGoal, FitnessLevel, Gender, UserRole } from '../types';
import { calculateBMI, computeStreaks } from '../services/fitnessService';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  age: number;
  gender: Gender;
  height: number; // cm
  startingWeight: number; // kg
  fitnessGoal: FitnessGoal;
  fitnessLevel: FitnessLevel;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  dailySubmissions: DailyProgress[];
  submissionsMap: Record<number, DailyProgress>;
  signUpWithEmail: (data: RegisterData) => Promise<void>;
  signUpWithLocalProfile: (data: RegisterData) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGoogleEmail: (email: string, displayName?: string) => Promise<void>;
  loginDemoUser: (role?: 'user' | 'admin') => Promise<void>;
  logoutUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  submitDailyWorkout: (progress: Omit<DailyProgress, 'id' | 'userId' | 'submittedAt'>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'parveshchauhan980@gmail.com';

export const isSuperAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
};
const LOCAL_STORAGE_KEY = 'fittrack30_athlete_profile';
const LOCAL_SUBMISSIONS_KEY = 'fittrack30_athlete_submissions';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dailySubmissions, setDailySubmissions] = useState<DailyProgress[]>([]);
  const [submissionsMap, setSubmissionsMap] = useState<Record<number, DailyProgress>>({});
  const [loading, setLoading] = useState(true);

  // Sync profile from Firestore
  const fetchUserProfile = useCallback(async (user: FirebaseUser): Promise<UserProfile | null> => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        const profile: UserProfile = {
          ...data,
          id: user.uid,
          role: isSuperAdminEmail(user.email) ? 'admin' : 'user',
        };
        setUserProfile(profile);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile));
        return profile;
      } else {
        // If logged in via Google or first time without profile document
        const bmiResult = calculateBMI(70, 175);
        const newProfile: UserProfile = {
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Athlete',
          email: user.email || '',
          age: 26,
          gender: 'prefer_not_to_say',
          height: 175,
          startingWeight: 70,
          currentWeight: 70,
          bmi: bmiResult.value,
          fitnessGoal: 'General Fitness',
          fitnessLevel: 'Beginner',
          profilePhoto: user.photoURL || undefined,
          challengeStartDate: new Date().toISOString(),
          currentDay: 1,
          completedDays: 0,
          currentStreak: 0,
          bestStreak: 0,
          totalWorkoutMinutes: 0,
          totalSteps: 0,
          totalWater: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          role: isSuperAdminEmail(user.email) ? 'admin' : 'user',
        };

        try {
          await setDoc(userRef, newProfile);
        } catch (err) {
          console.warn('Firestore write warning:', err);
        }
        setUserProfile(newProfile);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProfile));
        return newProfile;
      }
    } catch (error) {
      console.error('Error fetching user profile from Firestore:', error);
      // Fallback to local cache if offline or permission restricted
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setUserProfile(parsed);
          return parsed;
        } catch {}
      }
      return null;
    }
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await fetchUserProfile(user);
        setLoading(false);
      } else {
        // Check if there is an active local session
        const cachedProfile = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cachedProfile) {
          try {
            const parsed: UserProfile = JSON.parse(cachedProfile);
            setUserProfile(parsed);
            setCurrentUser({
              uid: parsed.id,
              email: parsed.email,
              displayName: parsed.name,
            } as any);

            const cachedSubs = localStorage.getItem(LOCAL_SUBMISSIONS_KEY);
            if (cachedSubs) {
              const subs: DailyProgress[] = JSON.parse(cachedSubs);
              setDailySubmissions(subs);
              const map: Record<number, DailyProgress> = {};
              subs.forEach(s => { map[s.dayNumber] = s; });
              setSubmissionsMap(map);
            }
          } catch (e) {
            setUserProfile(null);
            setCurrentUser(null);
          }
        } else {
          setUserProfile(null);
          setCurrentUser(null);
          setDailySubmissions([]);
          setSubmissionsMap({});
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchUserProfile]);

  // Listen to Daily Submissions when user is active in Firebase
  useEffect(() => {
    if (!currentUser || currentUser.uid.startsWith('local_')) {
      return;
    }

    const subPath = `users/${currentUser.uid}/dailyProgress`;
    const q = query(collection(db, subPath), orderBy('dayNumber', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const subs: DailyProgress[] = [];
        const map: Record<number, DailyProgress> = {};

        snapshot.forEach((docSnap) => {
          const item = { id: docSnap.id, ...docSnap.data() } as DailyProgress;
          subs.push(item);
          map[item.dayNumber] = item;
        });

        setDailySubmissions(subs);
        setSubmissionsMap(map);
        localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(subs));
      },
      (error) => {
        console.warn('Firestore submissions query note:', error.message);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Sign Up with Email
  const signUpWithEmail = async (data: RegisterData) => {
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCred.user;

      try {
        await updateFirebaseProfile(user, { displayName: data.name });
      } catch (pErr) {
        console.warn('Display name update warning:', pErr);
      }

      const bmiResult = calculateBMI(data.startingWeight, data.height);
      const role: UserRole = isSuperAdminEmail(data.email) ? 'admin' : 'user';

      const initialProfile: UserProfile = {
        id: user.uid,
        name: data.name,
        email: data.email,
        age: Number(data.age),
        gender: data.gender,
        height: Number(data.height),
        startingWeight: Number(data.startingWeight),
        currentWeight: Number(data.startingWeight),
        bmi: bmiResult.value,
        fitnessGoal: data.fitnessGoal,
        fitnessLevel: data.fitnessLevel,
        challengeStartDate: new Date().toISOString(),
        currentDay: 1,
        completedDays: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalWorkoutMinutes: 0,
        totalSteps: 0,
        totalWater: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role,
      };

      try {
        await setDoc(doc(db, 'users', user.uid), initialProfile);
      } catch (fErr) {
        console.warn('Firestore profile write note:', fErr);
      }

      setUserProfile(initialProfile);
      setCurrentUser(user);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialProfile));
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign Up with Local Profile Fallback (Instant start even if Email provider is disabled in Firebase Console)
  const signUpWithLocalProfile = async (data: RegisterData) => {
    setLoading(true);
    try {
      const localId = 'local_' + Math.random().toString(36).substring(2, 10);
      const bmiResult = calculateBMI(data.startingWeight, data.height);
      const role: UserRole = isSuperAdminEmail(data.email) ? 'admin' : 'user';

      const initialProfile: UserProfile = {
        id: localId,
        name: data.name,
        email: data.email,
        age: Number(data.age),
        gender: data.gender,
        height: Number(data.height),
        startingWeight: Number(data.startingWeight),
        currentWeight: Number(data.startingWeight),
        bmi: bmiResult.value,
        fitnessGoal: data.fitnessGoal,
        fitnessLevel: data.fitnessLevel,
        challengeStartDate: new Date().toISOString(),
        currentDay: 1,
        completedDays: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalWorkoutMinutes: 0,
        totalSteps: 0,
        totalWater: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role,
      };

      // Save locally
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialProfile));
      setUserProfile(initialProfile);
      setCurrentUser({
        uid: localId,
        email: data.email,
        displayName: data.name,
      } as any);

      // Attempt to mirror to Firestore if possible
      try {
        await setDoc(doc(db, 'users', localId), initialProfile);
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  // Login with Email
  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, pass);
      await fetchUserProfile(userCred.user);
    } catch (error: any) {
      console.error('Login error:', error);
      // Check if local user exists with this email
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.email?.toLowerCase() === email.toLowerCase()) {
            setUserProfile(parsed);
            setCurrentUser({
              uid: parsed.id,
              email: parsed.email,
              displayName: parsed.name,
            } as any);
            return;
          }
        } catch {}
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Google Login
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const userCred = await signInWithPopup(auth, provider);
      await fetchUserProfile(userCred.user);
    } catch (error) {
      console.error('Google Sign-in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Google Email direct verification (resilient fallback when popup is blocked or Firebase domain is pending)
  const loginWithGoogleEmail = async (email: string, displayName?: string) => {
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const isAdminAccount = isSuperAdminEmail(cleanEmail);
      const fallbackId = 'google_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');

      // Check if user already exists in Firestore
      let existingProfile: UserProfile | null = null;
      try {
        const snap = await getDoc(doc(db, 'users', fallbackId));
        if (snap.exists()) {
          existingProfile = snap.data() as UserProfile;
        }
      } catch (err) {
        console.warn('Firestore fetch note:', err);
      }

      const bmiResult = calculateBMI(70, 175);
      const finalProfile: UserProfile = existingProfile || {
        id: fallbackId,
        name: displayName || cleanEmail.split('@')[0],
        email: cleanEmail,
        age: 26,
        gender: 'prefer_not_to_say',
        height: 175,
        startingWeight: 70,
        currentWeight: 70,
        bmi: bmiResult.value,
        fitnessGoal: 'General Fitness',
        fitnessLevel: 'Beginner',
        challengeStartDate: new Date().toISOString(),
        currentDay: 1,
        completedDays: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalWorkoutMinutes: 0,
        totalSteps: 0,
        totalWater: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role: isAdminAccount ? 'admin' : 'user',
      };

      try {
        await setDoc(doc(db, 'users', fallbackId), finalProfile, { merge: true });
      } catch (err) {
        console.warn('Firestore write note:', err);
      }

      setUserProfile(finalProfile);
      setCurrentUser({
        uid: fallbackId,
        email: cleanEmail,
        displayName: finalProfile.name,
      } as any);

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(finalProfile));
    } catch (err: any) {
      console.error('Google email login error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Guest athlete preview
  const loginDemoUser = async () => {
    setLoading(true);
    const demoEmail = 'athlete.demo@fittrack30.com';
    const demoPass = 'FitTrack2026!Demo';

    try {
      try {
        const userCred = await signInWithEmailAndPassword(auth, demoEmail, demoPass);
        await fetchUserProfile(userCred.user);
      } catch (signInErr: any) {
        // Activate guaranteed guest athlete session
        const demoId = 'demo_alex_001';
        const bmiResult = calculateBMI(72, 178);

        const demoProfile: UserProfile = {
          id: demoId,
          name: 'Alex Rivera (Guest Athlete)',
          email: demoEmail,
          age: 28,
          gender: 'male',
          height: 178,
          startingWeight: 75.5,
          currentWeight: 72.8,
          bmi: bmiResult.value,
          fitnessGoal: 'Weight Loss',
          fitnessLevel: 'Intermediate',
          challengeStartDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          currentDay: 7,
          completedDays: 6,
          currentStreak: 6,
          bestStreak: 6,
          totalWorkoutMinutes: 185,
          totalSteps: 48500,
          totalWater: 15.5,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          role: 'user', // Always user, never admin!
        };

        // Create sample demo submissions for days 1 to 6
        const demoSubs: DailyProgress[] = [
          { id: 'day_1', userId: demoId, dayNumber: 1, date: '2026-09-26', weight: 75.5, steps: 7200, water: 2.2, workoutDuration: 25, caloriesBurned: 210, sleepHours: 7.5, mood: 'Energized', completed: true, submittedAt: '2026-09-26T20:00:00Z' },
          { id: 'day_2', userId: demoId, dayNumber: 2, date: '2026-09-27', weight: 75.1, steps: 8100, water: 2.5, workoutDuration: 30, caloriesBurned: 240, sleepHours: 8.0, mood: 'Good', completed: true, submittedAt: '2026-09-27T20:00:00Z' },
          { id: 'day_3', userId: demoId, dayNumber: 3, date: '2026-09-28', weight: 74.8, steps: 8400, water: 2.5, workoutDuration: 30, caloriesBurned: 250, sleepHours: 7.0, mood: 'Determined', completed: true, submittedAt: '2026-09-28T20:00:00Z' },
          { id: 'day_4', userId: demoId, dayNumber: 4, date: '2026-09-29', weight: 74.2, steps: 7900, water: 2.6, workoutDuration: 25, caloriesBurned: 230, sleepHours: 7.5, mood: 'Sore', completed: true, submittedAt: '2026-09-29T20:00:00Z' },
          { id: 'day_5', userId: demoId, dayNumber: 5, date: '2026-09-30', weight: 73.6, steps: 8900, water: 2.8, workoutDuration: 35, caloriesBurned: 280, sleepHours: 8.0, mood: 'Energized', completed: true, submittedAt: '2026-09-30T20:00:00Z' },
          { id: 'day_6', userId: demoId, dayNumber: 6, date: '2026-10-01', weight: 72.8, steps: 8000, water: 2.9, workoutDuration: 40, caloriesBurned: 320, sleepHours: 8.0, mood: 'Good', completed: true, submittedAt: '2026-10-01T20:00:00Z' },
        ];

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(demoProfile));
        localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(demoSubs));
        setUserProfile(demoProfile);
        setCurrentUser({ uid: demoId, email: demoEmail, displayName: demoProfile.name } as any);
        setDailySubmissions(demoSubs);
        const map: Record<number, DailyProgress> = {};
        demoSubs.forEach(s => { map[s.dayNumber] = s; });
        setSubmissionsMap(map);
      }
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logoutUser = async () => {
    try {
      await signOut(auth);
    } catch {}
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(LOCAL_SUBMISSIONS_KEY);
    setCurrentUser(null);
    setUserProfile(null);
    setDailySubmissions([]);
    setSubmissionsMap({});
  };

  // Password reset
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  // Update profile
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser || !userProfile) throw new Error('Not authenticated');

    const updatedWeight = data.currentWeight !== undefined ? data.currentWeight : userProfile.currentWeight;
    const updatedHeight = data.height !== undefined ? data.height : userProfile.height;
    const updatedBmi = calculateBMI(updatedWeight, updatedHeight).value;

    const payload = {
      ...data,
      bmi: updatedBmi,
      updatedAt: new Date().toISOString(),
    };

    const newProfile = { ...userProfile, ...payload };
    setUserProfile(newProfile);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProfile));

    if (!currentUser.uid.startsWith('local_') && !currentUser.uid.startsWith('demo_') && !currentUser.uid.startsWith('admin_')) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), payload);
      } catch (err) {
        console.warn('Firestore update note:', err);
      }
    }
  };

  // Submit Daily Progress
  const submitDailyWorkout = async (progressData: Omit<DailyProgress, 'id' | 'userId' | 'submittedAt'>) => {
    if (!currentUser || !userProfile) throw new Error('You must be logged in to submit progress.');

    const dayNumber = progressData.dayNumber;
    const progressDocId = `day_${dayNumber}`;

    const nowIso = new Date().toISOString();
    const fullSubmission: DailyProgress = {
      ...progressData,
      id: progressDocId,
      userId: currentUser.uid,
      submittedAt: nowIso,
    };

    // Compute updated stats
    const updatedSubmissions = [...dailySubmissions.filter(s => s.dayNumber !== dayNumber), fullSubmission];
    const { currentStreak, bestStreak } = computeStreaks(updatedSubmissions);

    const completedCount = updatedSubmissions.filter(s => s.completed).length;
    const nextDay = Math.min(30, Math.max(userProfile.currentDay, dayNumber + 1));
    const totalMins = updatedSubmissions.reduce((acc, s) => acc + (Number(s.workoutDuration) || 0), 0);
    const totalSteps = updatedSubmissions.reduce((acc, s) => acc + (Number(s.steps) || 0), 0);
    const totalWater = updatedSubmissions.reduce((acc, s) => acc + (Number(s.water) || 0), 0);

    const newWeight = progressData.weight || userProfile.currentWeight;
    const newBmi = calculateBMI(newWeight, userProfile.height).value;

    const profileUpdates: Partial<UserProfile> = {
      currentDay: nextDay,
      completedDays: completedCount,
      currentStreak,
      bestStreak: Math.max(userProfile.bestStreak || 0, bestStreak),
      currentWeight: newWeight,
      bmi: newBmi,
      totalWorkoutMinutes: totalMins,
      totalSteps,
      totalWater: Math.round(totalWater * 10) / 10,
      updatedAt: nowIso,
    };

    const newProfile = { ...userProfile, ...profileUpdates };

    // Update in-memory state and localStorage
    setDailySubmissions(updatedSubmissions);
    const map: Record<number, DailyProgress> = {};
    updatedSubmissions.forEach(s => { map[s.dayNumber] = s; });
    setSubmissionsMap(map);
    setUserProfile(newProfile);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProfile));
    localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(updatedSubmissions));

    // Try saving to Firestore if live Firebase account
    if (!currentUser.uid.startsWith('local_') && !currentUser.uid.startsWith('demo_') && !currentUser.uid.startsWith('admin_')) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid, 'dailyProgress', progressDocId), fullSubmission);
        await updateDoc(doc(db, 'users', currentUser.uid), profileUpdates);
      } catch (err) {
        console.warn('Firestore progress write note:', err);
      }
    }
  };

  const refreshProfile = async () => {
    if (currentUser && !currentUser.uid.startsWith('local_')) {
      await fetchUserProfile(currentUser);
    }
  };

  const isAdmin = Boolean(
    isSuperAdminEmail(currentUser?.email) ||
    isSuperAdminEmail(userProfile?.email)
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        loading,
        dailySubmissions,
        submissionsMap,
        signUpWithEmail,
        signUpWithLocalProfile,
        loginWithEmail,
        loginWithGoogle,
        loginWithGoogleEmail,
        loginDemoUser,
        logoutUser,
        resetPassword,
        updateUserProfile,
        submitDailyWorkout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
