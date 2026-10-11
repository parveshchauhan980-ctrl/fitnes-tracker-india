import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi';

export interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}

export const translations: Translations = {
  // Navigation & Branding
  navDashboard: { en: 'Dashboard', hi: 'डैशबोर्ड' },
  navChallenge: { en: '30-Day Challenge', hi: '30-दिन चैलेंज' },
  navLeaderboard: { en: 'Leaderboard', hi: 'लीडरबोर्ड' },
  navProgress: { en: 'Progress & Charts', hi: 'प्रगति और चार्ट' },
  navAchievements: { en: 'Achievements', hi: 'उपलब्धियां' },
  navProfile: { en: 'Profile', hi: 'प्रोफ़ाइल' },
  navSettings: { en: 'Settings', hi: 'सेटिंग्स' },
  navAdmin: { en: 'Admin Portal', hi: 'एडमिन पोर्टल' },
  signOut: { en: 'Sign Out', hi: 'लॉग आउट' },
  theme: { en: 'Theme', hi: 'थीम' },
  language: { en: 'Language', hi: 'भाषा' },
  day: { en: 'Day', hi: 'दिन' },
  streak: { en: 'streak', hi: 'स्ट्रीक' },
  healthChallenge: { en: 'Health Challenge', hi: 'फिटनेस चैलेंज' },

  // Greetings & Dashboard
  greetingMorning: { en: 'Good morning', hi: 'शुभ प्रभात' },
  greetingAfternoon: { en: 'Good afternoon', hi: 'शुभ दोपहर' },
  greetingEvening: { en: 'Good evening', hi: 'शुभ संध्या' },
  keepUpMomentum: { en: 'Keep up the momentum! Today is', hi: 'अपनी ऊर्जा बनाए रखें! आज है' },
  overviewTitle: { en: 'Overview', hi: 'अवलोकन' },
  overallProgress: { en: 'Overall 30-Day Progress', hi: 'कुल 30-दिवसीय प्रगति' },
  completed: { en: 'Completed', hi: 'पूरा हुआ' },
  daysLeft: { en: 'days left', hi: 'दिन शेष' },
  currentStreak: { en: 'Current Streak', hi: 'वर्तमान स्ट्रीक' },
  bestStreak: { en: 'Best Streak', hi: 'सर्वश्रेष्ठ स्ट्रीक' },
  completedDays: { en: 'Completed Days', hi: 'पूर्ण दिन' },
  outOf30Days: { en: 'out of 30 days', hi: '30 दिनों में से' },
  todayWorkout: { en: 'Today’s Workout', hi: 'आज का वर्कआउट' },
  viewDayDetails: { en: 'Open Today’s Workout', hi: 'आज का वर्कआउट खोलें' },
  markCompleted: { en: 'Mark Completed', hi: 'पूर्ण चिह्नित करें' },
  waterIntake: { en: 'Water Intake', hi: 'पानी की मात्रा' },
  sleepLogged: { en: 'Sleep Logged', hi: 'नींद' },
  caloriesBurned: { en: 'Calories Burned', hi: 'कैलरी बर्न' },
  hours: { en: 'hrs', hi: 'घंटे' },
  liters: { en: 'L', hi: 'लीटर' },
  kcal: { en: 'kcal', hi: 'किलोकैलरी' },

  // Actions
  saveChanges: { en: 'Save Changes', hi: 'बदलाव सेव करें' },
  saving: { en: 'Saving...', hi: 'सेव हो रहा है...' },
  cancel: { en: 'Cancel', hi: 'रद्द करें' },
  edit: { en: 'Edit', hi: 'संपादित करें' },
  delete: { en: 'Delete', hi: 'हटाएं' },
  uploadPhoto: { en: 'Upload Photo', hi: 'फ़ोटो अपलोड करें' },
  removePhoto: { en: 'Remove Photo', hi: 'फ़ोटो हटाएं' },
  chooseAvatar: { en: 'Choose Avatar', hi: 'अवतार चुनें' },
  back: { en: 'Back', hi: 'वापस जाएं' },
  submit: { en: 'Submit', hi: 'सबमिट करें' },

  // Profile Fields
  athleteProfile: { en: 'Athlete Profile', hi: 'एथलीट प्रोफ़ाइल' },
  profileSubtitle: { en: 'Manage your personal metrics, body statistics, and fitness goals.', hi: 'अपनी व्यक्तिगत माप, शरीर के आंकड़े और फिटनेस लक्ष्य प्रबंधित करें।' },
  fullName: { en: 'Full Name', hi: 'पूरा नाम' },
  age: { en: 'Age', hi: 'उम्र' },
  gender: { en: 'Gender', hi: 'लिंग' },
  height: { en: 'Height (cm)', hi: 'ऊंचाई (सेमी)' },
  currentWeight: { en: 'Current Weight (kg)', hi: 'वर्तमान वजन (किलो)' },
  targetWeight: { en: 'Target Weight (kg)', hi: 'लक्ष्य वजन (किलो)' },
  fitnessGoal: { en: 'Fitness Goal', hi: 'फिटनेस लक्ष्य' },
  weightLoss: { en: 'Weight Loss', hi: 'वजन घटाना (Weight Loss)' },
  muscleBuilding: { en: 'Muscle Building', hi: 'मांसपेशियां बढ़ाना (Muscle Building)' },
  endurance: { en: 'Endurance & Stamina', hi: 'सहनशक्ति और स्टैमिना (Endurance)' },
  generalHealth: { en: 'General Health & Tone', hi: 'सामान्य स्वास्थ्य और तंदुरुस्ती' },
  bmiScore: { en: 'BMI Score', hi: 'बीएमआई स्कोर' },
  years: { en: 'yrs', hi: 'वर्ष' },

  // Settings
  appSettings: { en: 'Application Settings', hi: 'एप्लिकेशन सेटिंग्स' },
  settingsSubtitle: { en: 'Customize your interface language, theme, and challenge preferences.', hi: 'अपनी भाषा, थीम और चुनौती प्राथमिकताओं को अनुकूलित करें।' },
  selectLanguage: { en: 'Preferred Language / भाषा', hi: 'पसंदीदा भाषा / Preferred Language' },
  languageDesc: { en: 'Switch between English and Hindi across the entire platform.', hi: 'पूरी वेबसाइट को हिंदी या अंग्रेज़ी में आसानी से बदलें।' },
  english: { en: 'English', hi: 'English (अंग्रेज़ी)' },
  hindi: { en: 'हिंदी', hi: 'हिंदी (Hindi)' },
  displayTheme: { en: 'Display Theme', hi: 'डिस्प्ले थीम' },
  darkMode: { en: 'Dark Mode', hi: 'डार्क मोड' },
  lightMode: { en: 'Light Mode', hi: 'लाइट मोड' },
  exportData: { en: 'Export Progress Data', hi: 'प्रगति डेटा डाउनलोड करें' },
  exportDataDesc: { en: 'Download your daily progress as a spreadsheet CSV file.', hi: 'अपनी दैनिक प्रगति को CSV फाइल के रूप में डाउनलोड करें।' },
  downloadCSV: { en: 'Download CSV', hi: 'CSV डाउनलोड करें' },
  resetChallenge: { en: 'Reset Challenge', hi: 'चैलेंज रीसेट करें' },
  resetChallengeDesc: { en: 'Restart your 30-Day Fitness Challenge from Day 1.', hi: 'अपनी 30-दिवसीय चुनौती को दिन 1 से दोबारा शुरू करें।' },
  resetButton: { en: 'Reset to Day 1', hi: 'दिन 1 पर रीसेट करें' },

  // Challenge & Day Details
  challengeTitle: { en: '30-Day Transformation Journey', hi: '30-दिन फिटनेस ट्रांसफॉर्मेशन यात्रा' },
  challengeSubtitle: { en: 'Unlock and conquer one workout challenge every single day.', hi: 'प्रतिदिन एक नया वर्कआउट टास्क अनलॉक और पूरा करें।' },
  dayLocked: { en: 'Locked', hi: 'लॉक है' },
  dayComplete: { en: 'Completed', hi: 'पूर्ण' },
  dayCurrent: { en: 'Today', hi: 'आज का दिन' },
  startWorkout: { en: 'Start Day', hi: 'दिन शुरू करें' },
  dailyWorkoutSummary: { en: 'Daily Workout & Nutrition Checklist', hi: 'दैनिक वर्कआउट और पोषण चेकलिस्ट' },
  notesPrompt: { en: 'Workout notes, how you felt...', hi: 'वर्कआउट नोट्स, आपको कैसा महसूस हुआ...' },
  dailyNotes: { en: 'Daily Notes', hi: 'दैनिक नोट्स' },
  progressPhoto: { en: 'Progress Photo', hi: 'प्रगति फ़ोटो' },
  saveDailyLog: { en: 'Save Daily Progress', hi: 'दैनिक प्रगति सेव करें' },

  // Leaderboard & Achievements
  leaderboardTitle: { en: 'Global Athlete Leaderboard', hi: 'ग्लोबल एथलीट लीडरबोर्ड' },
  leaderboardSubtitle: { en: 'Compete with athletes based on streak and completed days.', hi: 'स्ट्रीक और पूर्ण दिनों के आधार पर अन्य एथलीटों के साथ प्रतिस्पर्धा करें।' },
  rank: { en: 'Rank', hi: 'रैंक' },
  athlete: { en: 'Athlete', hi: 'एथलीट' },
  achievementsTitle: { en: 'Trophies & Badges', hi: 'ट्रॉफ़ी और बैज' },
  achievementsSubtitle: { en: 'Celebrate milestones unlocked during your 30-day journey.', hi: 'अपनी 30-दिवसीय यात्रा में प्राप्त किए गए मील के पत्थर।' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'fittrack_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored === 'hi' || stored === 'en') {
        return stored;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const t = (key: string, fallback?: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    return fallback || key;
  };

  useEffect(() => {
    try {
      document.documentElement.lang = language;
    } catch {
      // ignore
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
