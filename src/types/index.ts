export type UserRole = 'user' | 'admin';

export type FitnessGoal = 'Weight Loss' | 'Muscle Gain' | 'General Fitness' | 'Improve Stamina';

export type FitnessLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: Gender;
  height: number; // in cm
  startingWeight: number; // in kg
  currentWeight: number; // in kg
  bmi: number;
  fitnessGoal: FitnessGoal;
  fitnessLevel: FitnessLevel;
  profilePhoto?: string;
  challengeStartDate: string; // ISO string
  currentDay: number; // 1-30
  completedDays: number; // 0-30
  currentStreak: number;
  bestStreak: number;
  totalWorkoutMinutes: number;
  totalSteps: number;
  totalWater: number; // in Liters
  createdAt: string;
  updatedAt: string;
  role: UserRole;
  disabled?: boolean;
  leaderboardVisible?: boolean;
}

export interface LeaderboardAthlete {
  id: string;
  alias: string;
  avatarSeed?: string;
  avatarColor: string;
  currentStreak: number;
  completedDays: number;
  totalWorkoutMinutes: number;
  consistencyScore: number;
  fitnessGoal: FitnessGoal;
  fitnessLevel: FitnessLevel;
  badgesCount: number;
  isCurrentUser?: boolean;
}

export interface ExerciseItem {
  id: string;
  name: string;
  sets?: number;
  reps?: string;
  durationMinutes?: number;
  instructions: string;
  targetArea: string;
}

export interface DailyTask {
  id: string;
  dayNumber: number; // 1-30
  title: string;
  description: string;
  duration: number; // in minutes
  difficulty: FitnessLevel;
  waterTarget: number; // Liters
  stepTarget: number;
  caloriesTarget: number;
  exercises: ExerciseItem[];
  instructions?: string;
  safetyNote?: string;
}

export interface DailyProgress {
  id: string;
  userId: string;
  dayNumber: number;
  date: string; // YYYY-MM-DD
  weight: number; // in kg
  steps: number;
  water: number; // in Liters
  workoutDuration: number; // in minutes
  caloriesBurned: number;
  sleepHours: number;
  mood: 'Energized' | 'Good' | 'Tired' | 'Sore' | 'Determined' | 'Exhausted';
  notes?: string;
  progressPhotoUrl?: string;
  completed: boolean;
  submittedAt: string;
  exerciseChecklist?: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: string;
  requiredDays?: number;
  requiredStreak?: number;
  unlocked?: boolean;
  unlockedAt?: string;
}

export type DayStatus = 'LOCKED' | 'TODAY' | 'COMPLETED' | 'MISSED';

export interface BMICategory {
  category: 'Underweight' | 'Normal weight' | 'Overweight' | 'Obesity Class I' | 'Obesity Class II' | 'Severe Obesity';
  color: string;
  bgLight: string;
  description: string;
}
