import {
  BmiCategory,
  BmiResult,
  Gender,
  IdealWeightRange,
  ThemeMode,
  UserProfile,
  ValidationErrors,
  WeightRecord,
} from '../types/health';

const STORAGE_KEYS = {
  PROFILE: 'fittrack_profile_v1',
  RECORDS: 'fittrack_weight_records_v1',
  THEME: 'fittrack_theme_v1',
  INITIALIZED: 'fittrack_initialized_v1',
};

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex Morgan',
  age: 29,
  gender: Gender.Female,
  heightCm: 170,
  currentWeightKg: 68.4,
  weightGoalKg: 65.0,
};

export function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getRelativeIsoDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getInitialSampleRecords(): WeightRecord[] {
  const baseTime = Date.now();
  return [
    {
      id: 'sample-1',
      date: getRelativeIsoDate(21),
      weightKg: 70.8,
      note: 'Starting baseline',
      createdAt: baseTime - 21 * 86400000,
    },
    {
      id: 'sample-2',
      date: getRelativeIsoDate(17),
      weightKg: 70.2,
      note: 'Morning weigh-in',
      createdAt: baseTime - 17 * 86400000,
    },
    {
      id: 'sample-3',
      date: getRelativeIsoDate(13),
      weightKg: 69.9,
      note: 'Added daily walks',
      createdAt: baseTime - 13 * 86400000,
    },
    {
      id: 'sample-4',
      date: getRelativeIsoDate(9),
      weightKg: 69.4,
      note: 'Steady hydration',
      createdAt: baseTime - 9 * 86400000,
    },
    {
      id: 'sample-5',
      date: getRelativeIsoDate(5),
      weightKg: 68.9,
      note: 'Morning weigh-in',
      createdAt: baseTime - 5 * 86400000,
    },
    {
      id: 'sample-6',
      date: getRelativeIsoDate(2),
      weightKg: 68.6,
      note: 'After strength session',
      createdAt: baseTime - 2 * 86400000,
    },
    {
      id: 'sample-7',
      date: getRelativeIsoDate(0),
      weightKg: 68.4,
      note: 'Morning check-in',
      createdAt: baseTime,
    },
  ];
}

export function calculateBmi(weightKg: number, heightCm: number): BmiResult {
  const heightM = heightCm / 100;
  const rawBmi = heightM > 0 ? weightKg / (heightM * heightM) : 0;
  const bmi = Math.round(rawBmi * 10) / 10;

  // Map BMI 12..40 onto 0..100% indicator bar
  const clamped = Math.max(12, Math.min(40, rawBmi));
  const indicatorPercent = ((clamped - 12) / (40 - 12)) * 100;

  if (bmi < 18.5) {
    return {
      bmi,
      category: BmiCategory.Underweight,
      label: 'Underweight',
      rangeText: 'Below 18.5',
      summary: 'Your BMI sits below the standard healthy weight band for your height.',
      indicatorPercent,
      accentColor: '#2563EB',
      textColorClass: 'text-blue-700 dark:text-blue-400',
      dotColorClass: 'bg-blue-600 dark:bg-blue-400',
      surfaceTintClass: 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
    };
  }

  if (bmi < 25) {
    return {
      bmi,
      category: BmiCategory.Normal,
      label: 'Normal Weight',
      rangeText: '18.5 – 24.9',
      summary: 'Your BMI falls within the standard healthy range for your height.',
      indicatorPercent,
      accentColor: '#16A34A',
      textColorClass: 'text-emerald-700 dark:text-emerald-400',
      dotColorClass: 'bg-emerald-600 dark:bg-emerald-400',
      surfaceTintClass: 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
    };
  }

  if (bmi < 30) {
    return {
      bmi,
      category: BmiCategory.Overweight,
      label: 'Overweight',
      rangeText: '25.0 – 29.9',
      summary: 'Your BMI is moderately above the standard healthy weight range.',
      indicatorPercent,
      accentColor: '#D97706',
      textColorClass: 'text-amber-700 dark:text-amber-400',
      dotColorClass: 'bg-amber-600 dark:bg-amber-400',
      surfaceTintClass: 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
    };
  }

  return {
    bmi,
    category: BmiCategory.Obesity,
    label: 'Obesity',
    rangeText: '30.0 or above',
    summary: 'Your BMI is elevated above the standard range; steady lifestyle adjustments can help.',
    indicatorPercent,
    accentColor: '#DC2626',
    textColorClass: 'text-rose-700 dark:text-rose-400',
    dotColorClass: 'bg-rose-600 dark:bg-rose-400',
    surfaceTintClass: 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900',
  };
}

export function calculateIdealWeightRange(heightCm: number): IdealWeightRange {
  const heightM = heightCm / 100;
  if (heightM <= 0) {
    return { minKg: 0, maxKg: 0, midpointKg: 0 };
  }
  const minKg = Math.round(18.5 * heightM * heightM * 10) / 10;
  const maxKg = Math.round(24.9 * heightM * heightM * 10) / 10;
  const midpointKg = Math.round(((minKg + maxKg) / 2) * 10) / 10;
  return { minKg, maxKg, midpointKg };
}

export function sortRecordsChronologically(records: WeightRecord[]): WeightRecord[] {
  return [...records].sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return a.createdAt - b.createdAt;
  });
}

export function formatShortDate(isoDate: string): string {
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  const d = new Date(year, month, day);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatFullDate(isoDate: string): string {
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  const d = new Date(year, month, day);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function validateBmiInputs(heightInput: string, weightInput: string): ValidationErrors {
  const errors: ValidationErrors = {};
  const height = Number(heightInput);
  const weight = Number(weightInput);

  if (!heightInput.trim()) {
    errors.height = 'Enter your height in centimeters.';
  } else if (Number.isNaN(height) || height < 50 || height > 260) {
    errors.height = 'Height must be between 50 cm and 260 cm.';
  }

  if (!weightInput.trim()) {
    errors.weight = 'Enter your weight in kilograms.';
  } else if (Number.isNaN(weight) || weight < 15 || weight > 350) {
    errors.weight = 'Weight must be between 15 kg and 350 kg.';
  }

  return errors;
}

export function validateProfileInputs(values: {
  name: string;
  age: string;
  heightCm: string;
  currentWeightKg: string;
  weightGoalKg: string;
}): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Please enter your name.';
  } else if (values.name.trim().length > 50) {
    errors.name = 'Name should be 50 characters or fewer.';
  }

  const age = Number(values.age);
  if (!values.age.trim()) {
    errors.age = 'Please enter your age.';
  } else if (!Number.isInteger(age) || age < 5 || age > 120) {
    errors.age = 'Age must be a whole number between 5 and 120.';
  }

  const height = Number(values.heightCm);
  if (!values.heightCm.trim()) {
    errors.heightCm = 'Please enter your height in cm.';
  } else if (Number.isNaN(height) || height < 50 || height > 260) {
    errors.heightCm = 'Height must be between 50 cm and 260 cm.';
  }

  const weight = Number(values.currentWeightKg);
  if (!values.currentWeightKg.trim()) {
    errors.currentWeightKg = 'Please enter your current weight in kg.';
  } else if (Number.isNaN(weight) || weight < 15 || weight > 350) {
    errors.currentWeightKg = 'Weight must be between 15 kg and 350 kg.';
  }

  const goal = Number(values.weightGoalKg);
  if (!values.weightGoalKg.trim()) {
    errors.weightGoalKg = 'Please enter a target weight goal in kg.';
  } else if (Number.isNaN(goal) || goal < 15 || goal > 350) {
    errors.weightGoalKg = 'Target weight must be between 15 kg and 350 kg.';
  }

  return errors;
}

export function validateWeightRecordInputs(values: {
  date: string;
  weightKg: string;
  note?: string;
}): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!values.date.trim()) {
    errors.date = 'Select a date for this record.';
  } else {
    const today = getTodayIsoDate();
    if (values.date > today) {
      errors.date = 'Date cannot be in the future.';
    }
  }

  const weight = Number(values.weightKg);
  if (!values.weightKg.trim()) {
    errors.weightKg = 'Enter a weight in kilograms.';
  } else if (Number.isNaN(weight) || weight < 15 || weight > 350) {
    errors.weightKg = 'Weight must be between 15 kg and 350 kg.';
  }

  if (values.note && values.note.trim().length > 80) {
    errors.note = 'Note must be 80 characters or fewer.';
  }

  return errors;
}

export function loadStoredTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
  } catch {
    // Ignore storage access errors
  }
  return 'light';
}

export function saveStoredTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch {
    // Ignore storage access errors
  }
}

export function loadStoredProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UserProfile>;
      if (
        typeof parsed.name === 'string' &&
        typeof parsed.age === 'number' &&
        typeof parsed.heightCm === 'number' &&
        typeof parsed.currentWeightKg === 'number' &&
        typeof parsed.weightGoalKg === 'number'
      ) {
        return {
          name: parsed.name,
          age: parsed.age,
          gender: parsed.gender ?? Gender.Female,
          heightCm: parsed.heightCm,
          currentWeightKg: parsed.currentWeightKg,
          weightGoalKg: parsed.weightGoalKg,
        };
      }
    }
  } catch {
    // Fallback to default
  }
  return DEFAULT_PROFILE;
}

export function saveStoredProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch {
    // Ignore storage access errors
  }
}

export function loadStoredRecords(): WeightRecord[] {
  try {
    const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);

    if (!initialized) {
      const samples = getInitialSampleRecords();
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(samples));
      return samples;
    }

    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return sortRecordsChronologically(
          parsed.filter(
            (item): item is WeightRecord =>
              typeof item?.id === 'string' &&
              typeof item?.date === 'string' &&
              typeof item?.weightKg === 'number'
          )
        );
      }
    }
  } catch {
    // Fallback to sample data if storage fails
  }
  return [];
}

export function saveStoredRecords(records: WeightRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  } catch {
    // Ignore storage access errors
  }
}
