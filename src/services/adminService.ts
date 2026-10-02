import { collection, getDocs, updateDoc, doc, collectionGroup } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { UserProfile, DailyProgress } from '../types';

export interface AdminStats {
  totalUsers: number;
  activeChallenges: number;
  completedChallenges: number;
  averageCompletionRate: number;
  totalSubmissions: number;
  recentRegistrations: UserProfile[];
}

export async function fetchAllUsers(): Promise<UserProfile[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const list: UserProfile[] = [];
    snap.forEach(d => {
      list.push({ id: d.id, ...d.data() } as UserProfile);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users');
  }
}

export async function fetchAllSubmissionsAdmin(): Promise<(DailyProgress & { userName?: string; userEmail?: string })[]> {
  try {
    // Read submissions across users
    // If collectionGroup is allowed, or query users and their dailyProgress subcollections
    const users = await fetchAllUsers();
    const allSubs: (DailyProgress & { userName?: string; userEmail?: string })[] = [];

    for (const u of users) {
      try {
        const subSnap = await getDocs(collection(db, `users/${u.id}/dailyProgress`));
        subSnap.forEach(d => {
          allSubs.push({
            id: d.id,
            userName: u.name,
            userEmail: u.email,
            ...d.data(),
          } as DailyProgress & { userName?: string; userEmail?: string });
        });
      } catch (err) {
        // Continue if single user progress cannot be read
      }
    }

    allSubs.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    return allSubs;
  } catch (error) {
    console.error('Error fetching admin submissions:', error);
    return [];
  }
}

export async function toggleUserStatus(userId: string, disabled: boolean): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', userId), { disabled, updatedAt: new Date().toISOString() });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
  }
}

export async function computeAdminStats(): Promise<AdminStats> {
  const users = await fetchAllUsers();
  const allSubs = await fetchAllSubmissionsAdmin();

  const totalUsers = users.length;
  const completedChallenges = users.filter(u => (u.completedDays || 0) >= 30).length;
  const activeChallenges = users.filter(u => (u.completedDays || 0) > 0 && (u.completedDays || 0) < 30).length;

  const totalCompletedDaysSum = users.reduce((acc, u) => acc + (u.completedDays || 0), 0);
  const averageCompletionRate = totalUsers > 0 ? Math.round((totalCompletedDaysSum / (totalUsers * 30)) * 100) : 0;

  const recentRegistrations = [...users].sort((a, b) => 
    new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
  ).slice(0, 5);

  return {
    totalUsers,
    activeChallenges,
    completedChallenges,
    averageCompletionRate,
    totalSubmissions: allSubs.length,
    recentRegistrations,
  };
}
