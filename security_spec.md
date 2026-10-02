# Security Specification for FitTrack 30

## 1. Data Invariants
1. Users can only read and write their own `/users/{userId}` profile document (`request.auth.uid == userId`) unless they are an admin.
2. Users can only create and update their own `/users/{userId}/dailyProgress/{progressId}` entries.
3. Users cannot elevate their own role to `admin` during registration or update.
4. Admin accounts (e.g. `parveshchauhan980@gmail.com` or `/admins/{userId}`) can view all user profiles, review all submissions, and manage `/dailyTasks/{dayId}`.
5. All users can read the catalog of `/dailyTasks` and `/achievements`.
6. Progress submissions must maintain data integrity: steps >= 0, workoutDuration >= 0, water >= 0, weight > 0.
7. Path variable `{userId}` and `{dayId}` must conform to alphanumeric constraints.

## 2. The "Dirty Dozen" Threat Payloads
1. **Privilege Escalation**: Non-admin user sets `role: "admin"` during user profile creation.
2. **Impersonation Attack**: User A attempts to read or overwrite User B's `/users/{userB}` profile.
3. **Ghost Submissions**: User A writes to User B's subcollection `/users/{userB}/dailyProgress/{progressId}`.
4. **Junk Field Injection**: Payload injection of 2MB junk text into `notes` or `name` field to cause storage denial.
5. **Path Traversal / ID Poisoning**: Document creation using malicious IDs (e.g., `../../system`).
6. **Task Vandalism**: Regular user attempts to modify or delete workouts in `/dailyTasks/{dayId}`.
7. **Negative Metric Exploit**: Progress update with negative workout time (`workoutDuration: -100`) to break averages.
8. **Unauthenticated Read of Profiles**: Anonymous client attempts to scrape user emails or metrics.
9. **Blanket Query Scraping**: Non-admin querying `/users` collection without scoping to their own UID.
10. **Spoofed Admin Header**: Client setting custom unverified token claims to bypass security gates.
11. **Orphaned Progress**: Submitting daily progress without authenticated user session.
12. **Tampering with Daily Targets**: User writes custom targets to override global challenges.
