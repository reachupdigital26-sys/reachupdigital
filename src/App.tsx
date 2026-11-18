import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Moon, Sun, UserPen } from 'lucide-react';
import { MotionConfig, motion } from 'motion/react';
import { BmiCalculator } from './components/BmiCalculator';
import { ConfirmModal } from './components/ConfirmModal';
import { DashboardStats } from './components/DashboardStats';
import { HealthTipsSection } from './components/HealthTipsSection';
import { IdealWeightCard } from './components/IdealWeightCard';
import { Navbar, NavSection } from './components/Navbar';
import { ProfileModal } from './components/ProfileModal';
import { WeightTracker } from './components/WeightTracker';
import { Gender, ThemeMode, UserProfile, WeightRecord } from './types/health';
import {
  calculateBmi,
  getInitialSampleRecords,
  loadStoredProfile,
  loadStoredRecords,
  loadStoredTheme,
  saveStoredProfile,
  saveStoredRecords,
  saveStoredTheme,
  sortRecordsChronologically,
} from './utils/healthCalculations';

function formatGenderLabel(gender: Gender): string {
  switch (gender) {
    case Gender.Female:
      return 'Female';
    case Gender.Male:
      return 'Male';
    default:
      return 'Other';
  }
}

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => loadStoredTheme());
  const [profile, setProfile] = useState<UserProfile>(() => loadStoredProfile());
  const [records, setRecords] = useState<WeightRecord[]>(() => loadStoredRecords());

  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const weightInputRef = useRef<HTMLInputElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // Sync dark mode class on <html> and persist preference
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveStoredTheme(theme);
  }, [theme]);

  useEffect(() => {
    saveStoredProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveStoredRecords(records);
  }, [records]);

  const showToast = (message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const bmiResult = useMemo(
    () => calculateBmi(profile.currentWeightKg, profile.heightCm),
    [profile.currentWeightKg, profile.heightCm]
  );

  const handleNavigate = (section: NavSection) => {
    setActiveSection(section);
    const el = document.getElementById(section);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleQuickLogWeight = () => {
    setActiveSection('tracker');
    const el = document.getElementById('tracker');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    window.setTimeout(() => {
      weightInputRef.current?.focus();
    }, 320);
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleSaveProfile = (updated: UserProfile) => {
    setProfile(updated);
    showToast('Profile updated.');
  };

  const handleSyncFromCalculator = (heightCm: number, weightKg: number) => {
    setProfile((prev) => ({
      ...prev,
      heightCm,
      currentWeightKg: weightKg,
    }));
    showToast('Profile height and weight updated from calculator.');
  };

  const handleSetGoalWeight = (newGoalKg: number) => {
    setProfile((prev) => ({
      ...prev,
      weightGoalKg: newGoalKg,
    }));
    showToast(`Weight goal updated to ${newGoalKg.toFixed(1)} kg.`);
  };

  const handleAddWeightRecord = (entry: Omit<WeightRecord, 'id' | 'createdAt'>) => {
    const newRecord: WeightRecord = {
      ...entry,
      id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: Date.now(),
    };
    const updated = sortRecordsChronologically([...records, newRecord]);
    setRecords(updated);

    // Keep profile's current weight synced to the latest chronological record
    const latest = updated[updated.length - 1];
    if (latest) {
      setProfile((prev) => ({
        ...prev,
        currentWeightKg: latest.weightKg,
      }));
    }
    showToast(`Logged ${entry.weightKg.toFixed(1)} kg.`);
  };

  const handleUpdateWeightRecord = (
    id: string,
    updatedFields: { date: string; weightKg: number; note?: string }
  ) => {
    const updated = sortRecordsChronologically(
      records.map((r) => (r.id === id ? { ...r, ...updatedFields } : r))
    );
    setRecords(updated);

    const latest = updated[updated.length - 1];
    if (latest) {
      setProfile((prev) => ({
        ...prev,
        currentWeightKg: latest.weightKg,
      }));
    }
    showToast('Weight record updated.');
  };

  const handleDeleteWeightRecord = (id: string) => {
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);

    if (updated.length > 0) {
      const latest = updated[updated.length - 1];
      setProfile((prev) => ({
        ...prev,
        currentWeightKg: latest.weightKg,
      }));
    }
    showToast('Weight record removed.');
  };

  const handleConfirmClearAll = () => {
    setRecords([]);
    setIsClearModalOpen(false);
    showToast('All weight records cleared.');
  };

  const handleLoadSampleData = () => {
    const samples = sortRecordsChronologically(getInitialSampleRecords());
    setRecords(samples);
    const latest = samples[samples.length - 1];
    if (latest) {
      setProfile((prev) => ({
        ...prev,
        currentWeightKg: latest.weightKg,
      }));
    }
    showToast('Sample weight history loaded.');
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200 pb-20 md:pb-8">
        <Navbar
          activeSection={activeSection}
          onNavigate={handleNavigate}
          onQuickLogWeight={handleQuickLogWeight}
        />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
          {/* Workspace Profile & Utility Bar */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 text-balance">
                {profile.name}&rsquo;s Health Overview
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                <span className="tabular-nums">{profile.age} yrs</span>
                <span aria-hidden="true">·</span>
                <span>{formatGenderLabel(profile.gender)}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{profile.heightCm} cm</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{profile.currentWeightKg.toFixed(1)} kg</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsProfileOpen(true)}
                className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <UserPen className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                Edit Profile
              </button>

              <button
                type="button"
                onClick={handleToggleTheme}
                aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                className="inline-flex items-center gap-2 min-h-[44px] px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="w-4 h-4 text-slate-600" aria-hidden="true" />
                    <span className="hidden sm:inline">Dark Mode</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
                    <span className="hidden sm:inline">Light Mode</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* 6-Card Health Dashboard */}
          <DashboardStats
            profile={profile}
            bmiResult={bmiResult}
            records={records}
            onEditProfile={() => setIsProfileOpen(true)}
          />

          {/* BMI Calculator + Ideal Weight Calculator Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-7">
              <BmiCalculator
                profileHeightCm={profile.heightCm}
                profileWeightKg={profile.currentWeightKg}
                onSyncToProfile={handleSyncFromCalculator}
              />
            </div>
            <div className="lg:col-span-5 flex">
              <div className="w-full flex flex-col">
                <IdealWeightCard
                  heightCm={profile.heightCm}
                  currentWeightKg={profile.currentWeightKg}
                  weightGoalKg={profile.weightGoalKg}
                  onSetGoalWeight={handleSetGoalWeight}
                />
              </div>
            </div>
          </div>

          {/* Weight Tracker & Chart.js Progress */}
          <WeightTracker
            records={records}
            heightCm={profile.heightCm}
            weightGoalKg={profile.weightGoalKg}
            theme={theme}
            weightInputRef={weightInputRef}
            onAddRecord={handleAddWeightRecord}
            onUpdateRecord={handleUpdateWeightRecord}
            onDeleteRecord={handleDeleteWeightRecord}
            onRequestClearAll={() => setIsClearModalOpen(true)}
            onLoadSampleData={handleLoadSampleData}
          />

          {/* Personalized Health Tips */}
          <HealthTipsSection
            bmiResult={bmiResult}
            currentWeightKg={profile.currentWeightKg}
          />
        </main>

        <footer className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-8 pb-4 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-slate-200/70 dark:border-slate-800/70 mt-10">
          <p>FitTrack · Personal BMI &amp; Weight Tracker</p>
          <p>All profile data and weight logs are stored locally in your browser.</p>
        </footer>

        {/* Modals */}
        <ProfileModal
          isOpen={isProfileOpen}
          profile={profile}
          onSave={handleSaveProfile}
          onClose={() => setIsProfileOpen(false)}
        />

        <ConfirmModal
          isOpen={isClearModalOpen}
          title="Clear all weight records?"
          description="This will permanently delete all saved entries from your weight history in this browser. Your profile details and weight goal will remain intact."
          confirmLabel="Clear All Records"
          onConfirm={handleConfirmClearAll}
          onCancel={() => setIsClearModalOpen(false)}
        />

        {/* Subtle Non-Intrusive Toast Feedback */}
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-18 md:bottom-6 right-4 sm:right-6 z-40 px-4 py-2.5 text-sm font-medium text-white bg-slate-900 dark:bg-slate-800 border border-slate-800 dark:border-slate-700 rounded-xl shadow-lg"
          >
            {toastMessage}
          </div>
        )}
      </div>
    </MotionConfig>
  );
}
