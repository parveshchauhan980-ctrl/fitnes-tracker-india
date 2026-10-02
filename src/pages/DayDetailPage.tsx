import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { fetchTaskByDay } from '../services/taskService';
import { uploadProgressPhoto, getDayStatus } from '../services/fitnessService';
import { DailyTask, DailyProgress, DayStatus } from '../types';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  ArrowRight,
  Dumbbell,
  Clock,
  Droplet,
  Footprints,
  Flame,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Camera,
  Upload,
  X,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Lock,
} from 'lucide-react';

export const DayDetailPage: React.FC = () => {
  const { dayNumber } = useParams<{ dayNumber: string }>();
  const navigate = useNavigate();
  const dayNum = parseInt(dayNumber || '1', 10);

  const { userProfile, dailySubmissions, submissionsMap, submitDailyWorkout } = useAuth();
  const { showToast } = useNotification();

  const [task, setTask] = useState<DailyTask | null>(null);
  const [loading, setLoading] = useState(true);

  // Exercise checklist state
  const [checkedExercises, setCheckedExercises] = useState<Record<string, boolean>>({});

  // Interactive Stopwatch state
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Submission Form State
  const existingSubmission: DailyProgress | undefined = submissionsMap[dayNum];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [weight, setWeight] = useState<number>(existingSubmission?.weight || userProfile?.currentWeight || 70);
  const [steps, setSteps] = useState<number>(existingSubmission?.steps || 8000);
  const [water, setWater] = useState<number>(existingSubmission?.water || 2.5);
  const [workoutDuration, setWorkoutDuration] = useState<number>(
    existingSubmission?.workoutDuration || task?.duration || 25
  );
  const [caloriesBurned, setCaloriesBurned] = useState<number>(
    existingSubmission?.caloriesBurned || task?.caloriesTarget || 250
  );
  const [sleepHours, setSleepHours] = useState<number>(existingSubmission?.sleepHours || 7.5);
  const [mood, setMood] = useState<DailyProgress['mood']>(existingSubmission?.mood || 'Good');
  const [notes, setNotes] = useState<string>(existingSubmission?.notes || '');

  // Progress Photo Upload
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    existingSubmission?.progressPhotoUrl || null
  );

  const [validationError, setValidationError] = useState<string>('');

  const currentDay = userProfile?.currentDay || 1;
  const status: DayStatus = getDayStatus(
    dayNum,
    currentDay,
    dailySubmissions.map(s => s.dayNumber),
    submissionsMap
  );

  // Load Task
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchTaskByDay(dayNum);
        setTask(data);
        if (!existingSubmission && data) {
          setWorkoutDuration(data.duration);
          setCaloriesBurned(data.caloriesTarget);
          setWater(data.waterTarget);
          setSteps(data.stepTarget);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [dayNum, existingSubmission]);

  // Sync with existing submission when available
  useEffect(() => {
    if (existingSubmission) {
      setWeight(existingSubmission.weight);
      setSteps(existingSubmission.steps);
      setWater(existingSubmission.water);
      setWorkoutDuration(existingSubmission.workoutDuration);
      setCaloriesBurned(existingSubmission.caloriesBurned);
      setSleepHours(existingSubmission.sleepHours);
      setMood(existingSubmission.mood);
      setNotes(existingSubmission.notes || '');
      setPhotoPreview(existingSubmission.progressPhotoUrl || null);
    }
  }, [existingSubmission]);

  // Stopwatch timer interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleExerciseCheck = (id: string) => {
    setCheckedExercises(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const allExercisesChecked =
    task?.exercises && task.exercises.length > 0
      ? task.exercises.every(ex => checkedExercises[ex.id])
      : false;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 8 * 1024 * 1024) {
        setValidationError('Photo size must be less than 8MB.');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setValidationError('');
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  // Submit Progress Handler with validation
  const handleSubmitProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Strict validation
    if (!weight || weight < 25 || weight > 350) {
      setValidationError('Please enter a realistic positive weight (e.g. 70.5 kg).');
      return;
    }
    if (steps < 0 || steps > 100000) {
      setValidationError('Step count cannot be negative or absurdly high.');
      return;
    }
    if (water < 0 || water > 15) {
      setValidationError('Water intake must be a positive number of liters (e.g. 2.5L).');
      return;
    }
    if (workoutDuration < 0 || workoutDuration > 600) {
      setValidationError('Workout duration cannot be negative.');
      return;
    }
    if (sleepHours < 0 || sleepHours > 24) {
      setValidationError('Sleep hours must be between 0 and 24.');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalPhotoUrl = existingSubmission?.progressPhotoUrl || undefined;

      // Upload photo if new photo selected
      if (photoFile && userProfile) {
        try {
          finalPhotoUrl = await uploadProgressPhoto(userProfile.id, dayNum, photoFile);
        } catch (uploadErr) {
          console.warn('Photo upload warning:', uploadErr);
        }
      }

      await submitDailyWorkout({
        dayNumber: dayNum,
        date: new Date().toISOString().split('T')[0],
        weight: Number(weight),
        steps: Number(steps),
        water: Number(water),
        workoutDuration: Number(workoutDuration),
        caloriesBurned: Number(caloriesBurned),
        sleepHours: Number(sleepHours),
        mood,
        notes,
        progressPhotoUrl: finalPhotoUrl,
        completed: true,
        exerciseChecklist: Object.keys(checkedExercises).filter(k => checkedExercises[k]),
      });

      // Celebration Confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (c) {}

      showToast('success', `Day ${dayNum} Completed!`, 'Your streak and metrics have been updated.');
      setEditMode(false);

      if (dayNum === 30) {
        showToast('success', '🏆 30-Day Champion!', 'You completed the entire challenge!');
        navigate('/progress');
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      setValidationError(err.message || 'Failed to submit progress. Please check connection.');
      showToast('error', 'Submission Failed', 'Could not record today\'s log.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-500">Loading Day {dayNum} Workout...</p>
      </div>
    );
  }

  // If day is locked (future day beyond current day)
  if (status === 'LOCKED') {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
          Day {dayNum} is Locked
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          FitTrack 30 is built on day-by-day consistency. Please complete your current task (Day {currentDay}) to unlock subsequent days.
        </p>
        <Link
          to={`/day/${currentDay}`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md"
        >
          Go to Day {currentDay} Workout
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/challenge"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to 30-Day Grid
        </Link>

        <div className="flex items-center gap-2">
          {dayNum > 1 && (
            <Link
              to={`/day/${dayNum - 1}`}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Day {dayNum - 1}
            </Link>
          )}
          {dayNum < 30 && (dayNum < currentDay || existingSubmission?.completed) && (
            <Link
              to={`/day/${dayNum + 1}`}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Day {dayNum + 1}
            </Link>
          )}
        </div>
      </div>

      {/* Main Workout Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                FitTrack 30 • Day {dayNum}
              </span>
              {existingSubmission?.completed && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Completed ✓
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-['Outfit'] mt-1">
              {task?.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              {task?.duration} mins
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
              {task?.difficulty}
            </span>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 my-5 leading-relaxed">
          {task?.description}
        </p>

        {/* Daily Targets Pill Bar */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-center">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Water Target</span>
            <span className="text-sm font-black text-slate-900 dark:text-white flex items-center justify-center gap-1 mt-0.5">
              <Droplet className="w-3.5 h-3.5 text-blue-500" /> {task?.waterTarget} Liters
            </span>
          </div>
          <div className="border-x border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Step Goal</span>
            <span className="text-sm font-black text-slate-900 dark:text-white flex items-center justify-center gap-1 mt-0.5">
              <Footprints className="w-3.5 h-3.5 text-amber-500" /> {task?.stepTarget?.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Est. Calorie Burn</span>
            <span className="text-sm font-black text-slate-900 dark:text-white flex items-center justify-center gap-1 mt-0.5">
              <Flame className="w-3.5 h-3.5 text-orange-500" /> ~{task?.caloriesTarget} kcal
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Workout Timer */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
            Workout Stopwatch
          </span>
          <h3 className="text-lg font-bold">Track Your Active Session</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Start the timer while performing your exercises. It will automatically populate your log!
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-4xl sm:text-5xl font-black font-['Outfit'] tracking-wider text-emerald-400 bg-slate-950 px-6 py-2.5 rounded-2xl border border-slate-800 shadow-inner">
            {formatTimer(timerSeconds)}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`p-3 rounded-2xl font-bold shadow-lg transition-all ${
                isTimerRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              {isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(0);
              }}
              className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Reset Stopwatch"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Exercise Checklist Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Prescribed Movements
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">
              Exercise Checklist
            </h3>
          </div>
          <span className="text-xs font-bold text-emerald-500">
            {Object.values(checkedExercises).filter(Boolean).length} / {task?.exercises.length || 0} Finished
          </span>
        </div>

        <div className="space-y-4">
          {task?.exercises.map((ex, idx) => {
            const isChecked = Boolean(checkedExercises[ex.id]);
            return (
              <div
                key={ex.id || idx}
                onClick={() => toggleExerciseCheck(ex.id)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                  isChecked
                    ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/40'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isChecked
                      ? 'bg-emerald-500 text-white'
                      : 'border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                  }`}
                >
                  {isChecked && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4
                      className={`text-base font-bold transition-all ${
                        isChecked
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {ex.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {ex.sets ? `${ex.sets} sets • ${ex.reps}` : ex.durationMinutes ? `${ex.durationMinutes} min` : 'Completed'}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {ex.targetArea}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {ex.instructions}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Safety Note & Instructions */}
        {(task?.safetyNote || task?.instructions) && (
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
            {task.instructions && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Coach Guidance: </span>
                  {task.instructions}
                </div>
              </div>
            )}
            {task.safetyNote && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Safety Note: </span>
                  {task.safetyNote}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Progress Submission Form */}
      <div id="submit-section" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              End of Day Log
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
              Submit Today's Progress (Day {dayNum})
            </h3>
          </div>
          {existingSubmission && !editMode && (
            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Edit Submitted Log
            </button>
          )}
        </div>

        {existingSubmission && !editMode ? (
          <div className="py-8 space-y-6">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>You have successfully submitted your progress for Day {dayNum}.</span>
              </div>
              <span className="text-slate-500">Submitted at {new Date(existingSubmission.submittedAt).toLocaleTimeString()}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400">Recorded Weight</span>
                <span className="text-xl font-black text-slate-900 dark:text-white block font-['Outfit']">{existingSubmission.weight} kg</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400">Steps</span>
                <span className="text-xl font-black text-slate-900 dark:text-white block font-['Outfit']">{existingSubmission.steps.toLocaleString()}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400">Water Logged</span>
                <span className="text-xl font-black text-slate-900 dark:text-white block font-['Outfit']">{existingSubmission.water} L</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400">Workout Duration</span>
                <span className="text-xl font-black text-slate-900 dark:text-white block font-['Outfit']">{existingSubmission.workoutDuration} min</span>
              </div>
            </div>

            {existingSubmission.progressPhotoUrl && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Uploaded Progress Photo
                </span>
                <div className="w-48 h-48 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                  <img
                    src={existingSubmission.progressPhotoUrl}
                    alt={`Day ${dayNum} Progress`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmitProgress} className="py-6 space-y-6">
            {validationError && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Weight */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Weight (kg) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="25"
                  max="350"
                  value={weight}
                  onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Steps */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Steps Count <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100000"
                  value={steps}
                  onChange={(e) => setSteps(parseInt(e.target.value) || 0)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Water */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Water Intake (Liters) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="15"
                  value={water}
                  onChange={(e) => setWater(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Workout Duration */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Workout Duration (mins) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="400"
                  value={workoutDuration}
                  onChange={(e) => setWorkoutDuration(parseInt(e.target.value) || 0)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Calories Burned */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Estimated Calories Burned
                </label>
                <input
                  type="number"
                  min="0"
                  max="4000"
                  value={caloriesBurned}
                  onChange={(e) => setCaloriesBurned(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Sleep Hours */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Sleep Duration (Hours)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="24"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Mood Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                How do you feel today?
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {(['Energized', 'Good', 'Determined', 'Sore', 'Tired', 'Exhausted'] as DailyProgress['mood'][]).map(
                  (m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMood(m)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        mood === m
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {m}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Workout & Nutrition Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Felt great during push-ups, hit 10k steps before 6 PM..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Progress Photo Upload */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Daily Progress Photo (Upload from device)
              </label>

              {photoPreview ? (
                <div className="relative inline-block rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-44 h-44 object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="p-2 rounded-xl bg-white text-slate-900 cursor-pointer shadow-md text-xs font-bold">
                      Replace
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="p-2 rounded-xl bg-rose-500 text-white shadow-md text-xs font-bold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30">
                  <Camera className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Click or drag photo here to upload
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    Supports JPG, PNG, WEBP (Max 8MB)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              {existingSubmission && (
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="py-3.5 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving Progress...' : 'Submit Today’s Progress'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
