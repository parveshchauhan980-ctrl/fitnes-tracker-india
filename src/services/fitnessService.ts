import { BMICategory, DailyProgress, DayStatus, UserProfile } from '../types';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

export function calculateBMI(weightKg: number, heightCm: number): { value: number; category: BMICategory } {
  if (!weightKg || !heightCm || heightCm <= 0 || weightKg <= 0) {
    return {
      value: 0,
      category: {
        category: 'Normal weight',
        color: 'text-slate-400',
        bgLight: 'bg-slate-100 dark:bg-slate-800',
        description: 'Please enter valid height and weight.',
      },
    };
  }

  const heightM = heightCm / 100;
  const bmiRaw = weightKg / (heightM * heightM);
  const value = Math.round(bmiRaw * 10) / 10;

  if (value < 18.5) {
    return {
      value,
      category: {
        category: 'Underweight',
        color: 'text-amber-500 dark:text-amber-400',
        bgLight: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
        description: 'Below typical weight range. Focus on nutrient-dense meals and strength building.',
      },
    };
  } else if (value < 25.0) {
    return {
      value,
      category: {
        category: 'Normal weight',
        color: 'text-emerald-500 dark:text-emerald-400',
        bgLight: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
        description: 'Optimal healthy range. Maintain your active lifestyle and balanced nutrition.',
      },
    };
  } else if (value < 30.0) {
    return {
      value,
      category: {
        category: 'Overweight',
        color: 'text-orange-500 dark:text-orange-400',
        bgLight: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800',
        description: 'Slightly elevated. Consistent cardio and clean eating will bring you to target.',
      },
    };
  } else if (value < 35.0) {
    return {
      value,
      category: {
        category: 'Obesity Class I',
        color: 'text-rose-500 dark:text-rose-400',
        bgLight: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
        description: 'Higher health risk. Regular low-impact exercise and hydration are essential.',
      },
    };
  } else if (value < 40.0) {
    return {
      value,
      category: {
        category: 'Obesity Class II',
        color: 'text-rose-600 dark:text-rose-500',
        bgLight: 'bg-rose-100 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700',
        description: 'Elevated cardiovascular risk. Prioritize daily progressive walks and consistency.',
      },
    };
  } else {
    return {
      value,
      category: {
        category: 'Severe Obesity',
        color: 'text-purple-600 dark:text-purple-400',
        bgLight: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
        description: 'Consult with a healthcare professional alongside your gradual fitness plan.',
      },
    };
  }
}

export const BMI_DISCLAIMER =
  'Medical Disclaimer: Body Mass Index (BMI) is a general screening indicator based on height and weight. It does not directly assess body fat percentage, bone density, or muscle mass. Always consult with a licensed physician or healthcare provider before initiating any intensive workout or diet program.';

export function getDayStatus(
  dayNumber: number,
  currentDay: number,
  completedDaysList: number[] = [],
  submissionsMap: Record<number, DailyProgress> = {}
): DayStatus {
  // If already completed in submissions
  if (completedDaysList.includes(dayNumber) || (submissionsMap[dayNumber] && submissionsMap[dayNumber].completed)) {
    return 'COMPLETED';
  }

  // Today's active day
  if (dayNumber === currentDay) {
    return 'TODAY';
  }

  // If day is before current day and not completed, marked missed
  if (dayNumber < currentDay) {
    return 'MISSED';
  }

  // Future day
  return 'LOCKED';
}

export function computeStreaks(submissions: DailyProgress[]): { currentStreak: number; bestStreak: number } {
  if (!submissions || submissions.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const completedDayNumbers = submissions
    .filter(s => s.completed)
    .map(s => s.dayNumber)
    .sort((a, b) => a - b);

  if (completedDayNumbers.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  let maxStreak = 1;
  let runningStreak = 1;

  for (let i = 1; i < completedDayNumbers.length; i++) {
    if (completedDayNumbers[i] === completedDayNumbers[i - 1] + 1) {
      runningStreak++;
      if (runningStreak > maxStreak) {
        maxStreak = runningStreak;
      }
    } else if (completedDayNumbers[i] !== completedDayNumbers[i - 1]) {
      runningStreak = 1;
    }
  }

  // Determine current streak: check if consecutive up to the latest completed day
  let currentStreak = 1;
  for (let i = completedDayNumbers.length - 1; i > 0; i--) {
    if (completedDayNumbers[i] === completedDayNumbers[i - 1] + 1) {
      currentStreak++;
    } else {
      break;
    }
  }

  return {
    currentStreak,
    bestStreak: Math.max(maxStreak, currentStreak),
  };
}

export function exportSubmissionsToCSV(submissions: DailyProgress[], user: UserProfile): void {
  const headers = [
    'Day',
    'Date',
    'Weight (kg)',
    'Steps',
    'Water (L)',
    'Workout (min)',
    'Calories Burned',
    'Sleep (hrs)',
    'Mood',
    'Notes',
    'Completed',
  ];

  const sorted = [...submissions].sort((a, b) => a.dayNumber - b.dayNumber);

  const rows = sorted.map(s => [
    s.dayNumber,
    s.date || '',
    s.weight || '',
    s.steps || 0,
    s.water || 0,
    s.workoutDuration || 0,
    s.caloriesBurned || 0,
    s.sleepHours || 0,
    `"${(s.mood || '').replace(/"/g, '""')}"`,
    `"${(s.notes || '').replace(/"/g, '""')}"`,
    s.completed ? 'YES' : 'NO',
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `FitTrack30_${user.name.replace(/\s+/g, '_')}_Progress.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Compresses and crops an image file to a lightweight, high-quality square avatar Data URL.
 * Guarantees zero failures by gracefully falling back to raw data URL if canvas cannot decode.
 */
export async function compressImageToDataUrl(
  file: File,
  maxDimension = 360,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) {
        resolve('');
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Crop to square from center for avatars
          const minSide = Math.min(width, height);
          const startX = (width - minSide) / 2;
          const startY = (height - minSide) / 2;

          const targetSize = Math.min(minSide, maxDimension);
          canvas.width = targetSize;
          canvas.height = targetSize;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, startX, startY, minSide, minSide, 0, 0, targetSize, targetSize);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } else {
            resolve(rawDataUrl);
          }
        } catch {
          resolve(rawDataUrl);
        }
      };
      img.onerror = () => {
        // Fallback directly to raw data url if canvas or decoding errors
        resolve(rawDataUrl);
      };
      img.src = rawDataUrl;
    };
    reader.onerror = () => {
      resolve('');
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a progress photo either to Firebase Storage or returns optimized data URI if storage is restricted.
 */
export async function uploadProgressPhoto(
  userId: string,
  dayNumber: number,
  file: File
): Promise<string> {
  // First, produce a fast, optimized high-res avatar locally
  const optimizedDataUrl = await compressImageToDataUrl(file, 360, 0.85);

  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop() || 'jpg';
  const storagePath = `users/${userId}/progressPhotos/day_${dayNumber}_${timestamp}.${fileExt}`;

  // Attempt Firebase Storage with a quick 3-second timeout so user is never kept waiting
  try {
    const storageReference = ref(storage, storagePath);
    const uploadPromise = uploadBytes(storageReference, file).then(snap => getDownloadURL(snap.ref));
    const timeoutPromise = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error('Firebase Storage timeout')), 3000)
    );
    const downloadUrl = await Promise.race([uploadPromise, timeoutPromise]);
    return downloadUrl;
  } catch (error) {
    // Graceful fallback to high-quality compressed Data URI if storage bucket times out or is restricted
    console.warn('Firebase Storage upload notice, using optimized athlete image:', error);
    return optimizedDataUrl;
  }
}
