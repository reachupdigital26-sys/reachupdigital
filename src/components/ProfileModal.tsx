import React, { useEffect, useState } from 'react';
import { User, X } from 'lucide-react';
import { Gender, UserProfile, ValidationErrors } from '../types/health';
import { validateProfileInputs } from '../utils/healthCalculations';

interface ProfileModalProps {
  isOpen: boolean;
  profile: UserProfile;
  onSave: (updated: UserProfile) => void;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  profile,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(String(profile.age));
  const [gender, setGender] = useState<Gender>(profile.gender);
  const [heightCm, setHeightCm] = useState(String(profile.heightCm));
  const [currentWeightKg, setCurrentWeightKg] = useState(String(profile.currentWeightKg));
  const [weightGoalKg, setWeightGoalKg] = useState(String(profile.weightGoalKg));
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (isOpen) {
      setName(profile.name);
      setAge(String(profile.age));
      setGender(profile.gender);
      setHeightCm(String(profile.heightCm));
      setCurrentWeightKg(String(profile.currentWeightKg));
      setWeightGoalKg(String(profile.weightGoalKg));
      setErrors({});
    }
  }, [isOpen, profile]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateProfileInputs({
      name,
      age,
      heightCm,
      currentWeightKg,
      weightGoalKg,
    });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSave({
      name: name.trim(),
      age: Number(age),
      gender,
      heightCm: Math.round(Number(heightCm) * 10) / 10,
      currentWeightKg: Math.round(Number(currentWeightKg) * 10) / 10,
      weightGoalKg: Math.round(Number(weightGoalKg) * 10) / 10,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <User className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="profile-modal-title"
                className="text-lg font-semibold text-slate-900 dark:text-slate-50"
              >
                User Profile
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personal details used across your BMI and target calculations
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile dialog"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="profile-name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Full Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="e.g. Alex Morgan"
              className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="profile-age"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Age (Years)
              </label>
              <input
                id="profile-age"
                type="number"
                inputMode="numeric"
                min={5}
                max={120}
                step={1}
                value={age}
                onChange={(e) => {
                  setAge(e.target.value);
                  if (errors.age) setErrors((prev) => ({ ...prev, age: '' }));
                }}
                className="w-full min-h-[44px] px-3.5 py-2 text-sm tabular-nums bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
              />
              {errors.age && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.age}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="profile-gender"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Gender
              </label>
              <select
                id="profile-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
              >
                <option value={Gender.Female}>Female</option>
                <option value={Gender.Male}>Male</option>
                <option value={Gender.Other}>Other / Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="profile-height"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Height (cm)
              </label>
              <input
                id="profile-height"
                type="number"
                inputMode="decimal"
                min={50}
                max={260}
                step={0.5}
                value={heightCm}
                onChange={(e) => {
                  setHeightCm(e.target.value);
                  if (errors.heightCm) setErrors((prev) => ({ ...prev, heightCm: '' }));
                }}
                className="w-full min-h-[44px] px-3.5 py-2 text-sm tabular-nums bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
              />
              {errors.heightCm && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.heightCm}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="profile-weight"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Current Weight (kg)
              </label>
              <input
                id="profile-weight"
                type="number"
                inputMode="decimal"
                min={15}
                max={350}
                step={0.1}
                value={currentWeightKg}
                onChange={(e) => {
                  setCurrentWeightKg(e.target.value);
                  if (errors.currentWeightKg) {
                    setErrors((prev) => ({ ...prev, currentWeightKg: '' }));
                  }
                }}
                className="w-full min-h-[44px] px-3.5 py-2 text-sm tabular-nums bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
              />
              {errors.currentWeightKg && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                  {errors.currentWeightKg}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="profile-goal"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Weight Goal (kg)
              </label>
              <input
                id="profile-goal"
                type="number"
                inputMode="decimal"
                min={15}
                max={350}
                step={0.1}
                value={weightGoalKg}
                onChange={(e) => {
                  setWeightGoalKg(e.target.value);
                  if (errors.weightGoalKg) {
                    setErrors((prev) => ({ ...prev, weightGoalKg: '' }));
                  }
                }}
                className="w-full min-h-[44px] px-3.5 py-2 text-sm tabular-nums bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
              />
              {errors.weightGoalKg && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                  {errors.weightGoalKg}
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
