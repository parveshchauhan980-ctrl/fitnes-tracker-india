import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllTasks, saveTaskToDb, deleteTaskFromDb } from '../../services/taskService';
import { DailyTask, ExerciseItem, FitnessLevel } from '../../types';
import { useNotification } from '../../context/NotificationContext';
import {
  Layers,
  Edit,
  Trash2,
  Plus,
  Save,
  ArrowLeft,
  X,
  Dumbbell,
  CheckCircle2,
} from 'lucide-react';

export const AdminTasksPage: React.FC = () => {
  const { showToast } = useNotification();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await fetchAllTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
      showToast('error', 'Error', 'Failed to load task catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleEditClick = (task: DailyTask) => {
    // Deep clone to prevent direct state mutation
    setEditingTask(JSON.parse(JSON.stringify(task)));
  };

  const handleCreateNewClick = () => {
    const nextDay = tasks.length > 0 ? Math.max(...tasks.map(t => t.dayNumber)) + 1 : 1;
    setEditingTask({
      id: `day-${nextDay}`,
      dayNumber: nextDay,
      title: `Day ${nextDay} Training Session`,
      description: 'Progressive workout focusing on functional stamina and core stability.',
      duration: 30,
      difficulty: 'Intermediate',
      waterTarget: 2.5,
      stepTarget: 8500,
      caloriesTarget: 260,
      exercises: [
        {
          id: `${nextDay}-1`,
          name: 'Bodyweight Squats',
          sets: 3,
          reps: '15 reps',
          instructions: 'Feet shoulder-width apart, chest proud.',
          targetArea: 'Legs & Glutes',
        },
      ],
      instructions: 'Maintain steady rhythmic cadence throughout.',
      safetyNote: 'Hydrate well before and after training.',
    });
  };

  const handleAddExercise = () => {
    if (!editingTask) return;
    const newEx: ExerciseItem = {
      id: `${editingTask.dayNumber}-${(editingTask.exercises?.length || 0) + 1}`,
      name: 'New Movement',
      sets: 3,
      reps: '10 reps',
      instructions: 'Perform with controlled form.',
      targetArea: 'Full Body',
    };
    setEditingTask({
      ...editingTask,
      exercises: [...(editingTask.exercises || []), newEx],
    });
  };

  const handleRemoveExercise = (idx: number) => {
    if (!editingTask) return;
    const updated = [...editingTask.exercises];
    updated.splice(idx, 1);
    setEditingTask({ ...editingTask, exercises: updated });
  };

  const handleExerciseChange = (idx: number, field: keyof ExerciseItem, value: any) => {
    if (!editingTask) return;
    const updated = [...editingTask.exercises];
    updated[idx] = { ...updated[idx], [field]: value };
    setEditingTask({ ...editingTask, exercises: updated });
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    setIsSaving(true);
    try {
      await saveTaskToDb(editingTask);
      showToast('success', 'Task Saved', `Day ${editingTask.dayNumber} workout updated successfully.`);
      await loadTasks();
      setEditingTask(null);
    } catch (err: any) {
      showToast('error', 'Save Failed', err.message || 'Could not update task.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTask = async (task: DailyTask) => {
    if (!window.confirm(`Are you sure you want to remove Day ${task.dayNumber} task?`)) return;
    try {
      await deleteTaskFromDb(task.id);
      showToast('success', 'Task Removed', `Day ${task.dayNumber} has been removed.`);
      await loadTasks();
    } catch (err: any) {
      showToast('error', 'Delete Failed', err.message || 'Could not delete task.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Admin Overview
          </Link>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
            Challenge Task Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure prescribed exercises, target calories, hydration goals, and instructions for all 30 days.
          </p>
        </div>

        <button
          onClick={handleCreateNewClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          Add / Configure Day Task
        </button>
      </div>

      {/* Tasks Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        {loading ? (
          <div className="text-center py-12 text-xs font-bold text-slate-400">Loading workout catalog...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Day</th>
                  <th className="py-3 px-4">Workout Title</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Exercises</th>
                  <th className="py-3 px-4">Water Target</th>
                  <th className="py-3 px-4">Step Target</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-black font-['Outfit'] text-slate-900 dark:text-white">
                      Day {t.dayNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200 max-w-xs truncate">
                      {t.title}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {t.difficulty}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400">
                      {t.duration} mins
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {t.exercises?.length || 0} exercises
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {t.waterTarget} L
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {t.stepTarget?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleEditClick(t)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTask(t)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / Create Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingTask(null)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-900 dark:text-white font-['Outfit'] mb-6">
              Configure Workout • Day {editingTask.dayNumber}
            </h3>

            <form onSubmit={handleSaveTask} className="space-y-5">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Day Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={editingTask.dayNumber}
                    onChange={(e) => setEditingTask({ ...editingTask, dayNumber: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Workout Title
                  </label>
                  <input
                    type="text"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Duration (mins)
                  </label>
                  <input
                    type="number"
                    value={editingTask.duration}
                    onChange={(e) => setEditingTask({ ...editingTask, duration: parseInt(e.target.value) || 20 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={editingTask.difficulty}
                    onChange={(e) => setEditingTask({ ...editingTask, difficulty: e.target.value as FitnessLevel })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Water (L)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingTask.waterTarget}
                    onChange={(e) => setEditingTask({ ...editingTask, waterTarget: parseFloat(e.target.value) || 2 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Step Target
                  </label>
                  <input
                    type="number"
                    value={editingTask.stepTarget}
                    onChange={(e) => setEditingTask({ ...editingTask, stepTarget: parseInt(e.target.value) || 5000 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Exercises Editor List */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Prescribed Movements ({editingTask.exercises?.length || 0})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddExercise}
                    className="text-xs font-bold text-emerald-500 hover:text-emerald-600 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Exercise
                  </button>
                </div>

                <div className="space-y-3">
                  {editingTask.exercises?.map((ex, idx) => (
                    <div
                      key={ex.id || idx}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={ex.name}
                          onChange={(e) => handleExerciseChange(idx, 'name', e.target.value)}
                          placeholder="Exercise Name"
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                        />
                        <input
                          type="text"
                          value={ex.reps || ''}
                          onChange={(e) => handleExerciseChange(idx, 'reps', e.target.value)}
                          placeholder="e.g. 3 sets • 12 reps"
                          className="w-36 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(idx)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={ex.instructions}
                        onChange={(e) => handleExerciseChange(idx, 'instructions', e.target.value)}
                        placeholder="Form & postural instructions..."
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md"
                >
                  {isSaving ? 'Saving...' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
