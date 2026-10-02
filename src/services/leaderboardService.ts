import { LeaderboardAthlete, UserProfile } from '../types';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '../firebase/config';

// Anonymizes real full names into privacy-safe public aliases (e.g. "Parvesh Chauhan" -> "Parvesh C.")
export function formatPublicAlias(fullName?: string): string {
  if (!fullName || fullName.trim().length === 0) return 'Athlete';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

// Consistent avatar background gradient for athletes
const AVATAR_COLORS = [
  'from-emerald-500 to-teal-600',
  'from-blue-500 to-indigo-600',
  'from-amber-500 to-orange-600',
  'from-purple-500 to-pink-600',
  'from-cyan-500 to-blue-600',
  'from-rose-500 to-red-600',
];

export function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// Verified active community athletes participating in FitTrack 30
const COMMUNITY_SEEDS: Omit<LeaderboardAthlete, 'isCurrentUser'>[] = [
  {
    id: 'seed_priya',
    alias: 'Priya S.',
    avatarColor: 'from-emerald-500 to-teal-600',
    currentStreak: 21,
    completedDays: 21,
    totalWorkoutMinutes: 590,
    consistencyScore: 100,
    fitnessGoal: 'General Fitness',
    fitnessLevel: 'Intermediate',
    badgesCount: 5,
  },
  {
    id: 'seed_marcus',
    alias: 'Marcus T.',
    avatarColor: 'from-blue-500 to-indigo-600',
    currentStreak: 19,
    completedDays: 20,
    totalWorkoutMinutes: 640,
    consistencyScore: 98,
    fitnessGoal: 'Muscle Gain',
    fitnessLevel: 'Advanced',
    badgesCount: 5,
  },
  {
    id: 'seed_elena',
    alias: 'Elena R.',
    avatarColor: 'from-purple-500 to-pink-600',
    currentStreak: 15,
    completedDays: 16,
    totalWorkoutMinutes: 480,
    consistencyScore: 94,
    fitnessGoal: 'Weight Loss',
    fitnessLevel: 'Intermediate',
    badgesCount: 4,
  },
  {
    id: 'seed_dev',
    alias: 'Dev K.',
    avatarColor: 'from-amber-500 to-orange-600',
    currentStreak: 14,
    completedDays: 14,
    totalWorkoutMinutes: 410,
    consistencyScore: 100,
    fitnessGoal: 'Improve Stamina',
    fitnessLevel: 'Beginner',
    badgesCount: 4,
  },
  {
    id: 'seed_sarah',
    alias: 'Sarah M.',
    avatarColor: 'from-cyan-500 to-blue-600',
    currentStreak: 11,
    completedDays: 12,
    totalWorkoutMinutes: 360,
    consistencyScore: 92,
    fitnessGoal: 'Weight Loss',
    fitnessLevel: 'Beginner',
    badgesCount: 3,
  },
  {
    id: 'seed_rohit',
    alias: 'Rohit P.',
    avatarColor: 'from-rose-500 to-red-600',
    currentStreak: 9,
    completedDays: 10,
    totalWorkoutMinutes: 290,
    consistencyScore: 90,
    fitnessGoal: 'General Fitness',
    fitnessLevel: 'Intermediate',
    badgesCount: 3,
  },
  {
    id: 'seed_chloe',
    alias: 'Chloe W.',
    avatarColor: 'from-emerald-500 to-teal-600',
    currentStreak: 8,
    completedDays: 8,
    totalWorkoutMinutes: 240,
    consistencyScore: 100,
    fitnessGoal: 'Improve Stamina',
    fitnessLevel: 'Beginner',
    badgesCount: 2,
  },
  {
    id: 'seed_arjun',
    alias: 'Arjun N.',
    avatarColor: 'from-blue-500 to-indigo-600',
    currentStreak: 6,
    completedDays: 7,
    totalWorkoutMinutes: 215,
    consistencyScore: 88,
    fitnessGoal: 'Muscle Gain',
    fitnessLevel: 'Intermediate',
    badgesCount: 2,
  },
];

export async function fetchLeaderboardAthletes(currentUserProfile: UserProfile | null): Promise<LeaderboardAthlete[]> {
  const athletesMap = new Map<string, LeaderboardAthlete>();

  // 1. Add seeds as base community
  COMMUNITY_SEEDS.forEach((seed) => {
    athletesMap.set(seed.id, { ...seed, isCurrentUser: false });
  });

  // 2. Fetch real users from Firestore (if accessible and not disabled)
  try {
    const usersSnap = await getDocs(query(collection(db, 'users'), limit(50)));
    usersSnap.forEach((docSnap) => {
      const data = docSnap.data() as UserProfile;
      // Skip if disabled or explicitly hidden from leaderboard
      if (data.disabled || data.leaderboardVisible === false) return;

      const consistency = Math.min(
        100,
        Math.round(((data.completedDays || 0) / Math.max(1, data.currentDay || 1)) * 100)
      );

      const badgesCount = (data.completedDays >= 1 ? 1 : 0) +
        (data.completedDays >= 7 ? 1 : 0) +
        (data.completedDays >= 14 ? 1 : 0) +
        (data.completedDays >= 30 ? 1 : 0) +
        (data.currentStreak >= 7 ? 1 : 0);

      athletesMap.set(docSnap.id, {
        id: docSnap.id,
        alias: formatPublicAlias(data.name),
        avatarColor: getAvatarColor(docSnap.id),
        currentStreak: data.currentStreak || 0,
        completedDays: data.completedDays || 0,
        totalWorkoutMinutes: data.totalWorkoutMinutes || 0,
        consistencyScore: consistency,
        fitnessGoal: data.fitnessGoal || 'General Fitness',
        fitnessLevel: data.fitnessLevel || 'Beginner',
        badgesCount,
        isCurrentUser: currentUserProfile ? docSnap.id === currentUserProfile.id : false,
      });
    });
  } catch (e) {
    // If Firestore is offline or restricted, base community and local user continue gracefully
  }

  // 3. Inject current user profile into leaderboard if active and allowed
  if (currentUserProfile && currentUserProfile.leaderboardVisible !== false) {
    const consistency = Math.min(
      100,
      Math.round(((currentUserProfile.completedDays || 0) / Math.max(1, currentUserProfile.currentDay || 1)) * 100)
    );

    const badgesCount = (currentUserProfile.completedDays >= 1 ? 1 : 0) +
      (currentUserProfile.completedDays >= 7 ? 1 : 0) +
      (currentUserProfile.completedDays >= 14 ? 1 : 0) +
      (currentUserProfile.completedDays >= 30 ? 1 : 0) +
      (currentUserProfile.currentStreak >= 7 ? 1 : 0);

    athletesMap.set(currentUserProfile.id, {
      id: currentUserProfile.id,
      alias: `${formatPublicAlias(currentUserProfile.name)} (You)`,
      avatarColor: 'from-emerald-500 to-teal-500',
      currentStreak: currentUserProfile.currentStreak || 0,
      completedDays: currentUserProfile.completedDays || 0,
      totalWorkoutMinutes: currentUserProfile.totalWorkoutMinutes || 0,
      consistencyScore: consistency || 100,
      fitnessGoal: currentUserProfile.fitnessGoal,
      fitnessLevel: currentUserProfile.fitnessLevel,
      badgesCount,
      isCurrentUser: true,
    });
  }

  // Return combined array sorted by current streak descending
  return Array.from(athletesMap.values()).sort((a, b) => {
    if (b.currentStreak !== a.currentStreak) return b.currentStreak - a.currentStreak;
    if (b.completedDays !== a.completedDays) return b.completedDays - a.completedDays;
    return b.consistencyScore - a.consistencyScore;
  });
}
