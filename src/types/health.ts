export enum Gender {
  Female = 'female',
  Male = 'male',
  Other = 'other',
}

export enum BmiCategory {
  Underweight = 'underweight',
  Normal = 'normal',
  Overweight = 'overweight',
  Obesity = 'obesity',
}

export enum TipTopic {
  All = 'all',
  Hydration = 'hydration',
  Exercise = 'exercise',
  Nutrition = 'nutrition',
  Lifestyle = 'lifestyle',
}

export enum TimeRangeFilter {
  SevenDays = '7d',
  ThirtyDays = '30d',
  NinetyDays = '90d',
  All = 'all',
}

export type ThemeMode = 'light' | 'dark';

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  heightCm: number;
  currentWeightKg: number;
  weightGoalKg: number;
}

export interface WeightRecord {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  note?: string;
  createdAt: number;
}

export interface BmiResult {
  bmi: number;
  category: BmiCategory;
  label: string;
  rangeText: string;
  summary: string;
  indicatorPercent: number;
  accentColor: string;
  textColorClass: string;
  dotColorClass: string;
  surfaceTintClass: string;
}

export interface IdealWeightRange {
  minKg: number;
  maxKg: number;
  midpointKg: number;
}

export interface HealthTip {
  id: string;
  topic: Exclude<TipTopic, TipTopic.All>;
  title: string;
  description: string;
  actionableTarget: string;
}

export interface CategoryGuidance {
  category: BmiCategory;
  headline: string;
  explanation: string;
  focusPoints: string[];
}

export interface ValidationErrors {
  [key: string]: string;
}
