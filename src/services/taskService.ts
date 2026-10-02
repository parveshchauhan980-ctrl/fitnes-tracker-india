import { collection, doc, getDoc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { DailyTask } from '../types';
import { DEFAULT_DAILY_TASKS } from '../data/defaultTasks';

export async function fetchAllTasks(): Promise<DailyTask[]> {
  try {
    const tasksCol = collection(db, 'dailyTasks');
    const snapshot = await getDocs(tasksCol);

    if (snapshot.empty) {
      // If collection is not yet seeded, return the complete default 30-day task catalog
      return DEFAULT_DAILY_TASKS;
    }

    const tasks: DailyTask[] = [];
    snapshot.forEach(docSnap => {
      tasks.push({ id: docSnap.id, ...docSnap.data() } as DailyTask);
    });

    // Ensure sorted by dayNumber
    tasks.sort((a, b) => a.dayNumber - b.dayNumber);

    // If some days are missing from DB, merge with default
    if (tasks.length < 30) {
      const existingDays = new Set(tasks.map(t => t.dayNumber));
      const missing = DEFAULT_DAILY_TASKS.filter(d => !existingDays.has(d.dayNumber));
      return [...tasks, ...missing].sort((a, b) => a.dayNumber - b.dayNumber);
    }

    return tasks;
  } catch (error) {
    console.warn('Error fetching tasks from Firestore, falling back to bundled tasks catalog:', error);
    return DEFAULT_DAILY_TASKS;
  }
}

export async function fetchTaskByDay(dayNumber: number): Promise<DailyTask> {
  const dayId = `day-${dayNumber}`;
  try {
    const taskDoc = await getDoc(doc(db, 'dailyTasks', dayId));
    if (taskDoc.exists()) {
      return { id: taskDoc.id, ...taskDoc.data() } as DailyTask;
    }
  } catch (error) {
    console.warn(`Could not read task for day ${dayNumber} from DB, using bundled definition:`, error);
  }

  const defaultTask = DEFAULT_DAILY_TASKS.find(t => t.dayNumber === dayNumber);
  if (defaultTask) return defaultTask;

  // Fallback generic day
  return {
    id: dayId,
    dayNumber,
    title: `Day ${dayNumber} Power Workout`,
    description: 'Continue your progressive 30-day fitness challenge.',
    duration: 30,
    difficulty: 'Intermediate',
    waterTarget: 2.5,
    stepTarget: 8000,
    caloriesTarget: 250,
    exercises: [
      { id: `${dayNumber}-1`, name: 'Brisk Walk or Jog', durationMinutes: 20, instructions: 'Keep a steady aerobic rhythm.', targetArea: 'Cardio' },
      { id: `${dayNumber}-2`, name: 'Bodyweight Squats', sets: 3, reps: '15 reps', instructions: 'Chest up, weight back on heels.', targetArea: 'Quads & Glutes' },
      { id: `${dayNumber}-3`, name: 'Core Plank Hold', sets: 3, reps: '30 seconds', instructions: 'Engage abs, straight spine.', targetArea: 'Core' },
    ],
  };
}

export async function saveTaskToDb(task: DailyTask): Promise<void> {
  const dayId = `day-${task.dayNumber}`;
  try {
    await setDoc(doc(db, 'dailyTasks', dayId), task);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `dailyTasks/${dayId}`);
  }
}

export async function deleteTaskFromDb(dayId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'dailyTasks', dayId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `dailyTasks/${dayId}`);
  }
}
