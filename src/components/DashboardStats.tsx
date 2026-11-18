import React from 'react';
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Minus, Pencil, Ruler, Scale, Target, TrendingUp } from 'lucide-react';
import { BmiResult, UserProfile, WeightRecord } from '../types/health';

interface DashboardStatsProps {
  profile: UserProfile;
  bmiResult: BmiResult;
  records: WeightRecord[];
  onEditProfile: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  profile,
  bmiResult,
  records,
  onEditProfile,
}) => {
  const firstRecord = records.length > 0 ? records[0] : null;
  const totalChangeKg = firstRecord
    ? Math.round((profile.currentWeightKg - firstRecord.weightKg) * 10) / 10
    : 0;

  const remainingToGoalKg =
    Math.round((profile.weightGoalKg - profile.currentWeightKg) * 10) / 10;
  const absRemaining = Math.abs(remainingToGoalKg).toFixed(1);

  let progressSummary = 'At goal weight';
  let progressSubtext = 'Target achieved';
  let ProgressIcon = CheckCircle2;
  let progressColor = 'text-emerald-600 dark:text-emerald-400';

  if (Math.abs(remainingToGoalKg) >= 0.1) {
    if (remainingToGoalKg < 0) {
      progressSummary = `${absRemaining} kg to lose`;
      ProgressIcon = ArrowDownRight;
      progressColor = 'text-blue-600 dark:text-blue-400';
    } else {
      progressSummary = `${absRemaining} kg to gain`;
      ProgressIcon = ArrowUpRight;
      progressColor = 'text-blue-600 dark:text-blue-400';
    }

    if (firstRecord && Math.abs(totalChangeKg) >= 0.1) {
      const sign = totalChangeKg > 0 ? '+' : '';
      progressSubtext = `${sign}${totalChangeKg.toFixed(1)} kg since ${firstRecord.date}`;
    } else {
      progressSubtext = `Goal target ${profile.weightGoalKg.toFixed(1)} kg`;
    }
  } else if (firstRecord && Math.abs(totalChangeKg) >= 0.1) {
    const sign = totalChangeKg > 0 ? '+' : '';
    progressSubtext = `${sign}${totalChangeKg.toFixed(1)} kg from baseline`;
  }

  const heightMeters = (profile.heightCm / 100).toFixed(2);

  return (
    <section id="dashboard" aria-label="Health dashboard metrics" className="scroll-mt-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Current BMI */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 transition-colors">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Current BMI
            </span>
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2.5">
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-mono tabular-nums">
              {bmiResult.bmi.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              kg/m²
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Standard band <span className="tabular-nums">18.5 – 24.9</span>
          </p>
        </div>

        {/* 2. BMI Category */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 transition-colors">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              BMI Category
            </span>
            <span
              className={`w-2.5 h-2.5 rounded-full ${bmiResult.dotColorClass}`}
              aria-hidden="true"
            />
          </div>
          <div className="mt-2.5">
            <span className={`text-2xl font-bold tracking-tight ${bmiResult.textColorClass}`}>
              {bmiResult.label}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            Range {bmiResult.rangeText}
          </p>
        </div>

        {/* 3. Current Weight */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 transition-colors">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Current Weight
            </span>
            <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-mono tabular-nums">
              {profile.currentWeightKg.toFixed(1)}
            </span>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">kg</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {records.length > 0
              ? `${records.length} saved ${records.length === 1 ? 'record' : 'records'}`
              : 'From your profile'}
          </p>
        </div>

        {/* 4. Height */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 transition-colors">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Height
            </span>
            <Ruler className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-mono tabular-nums">
              {profile.heightCm}
            </span>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">cm</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {heightMeters} m · Age {profile.age}
          </p>
        </div>

        {/* 5. Weight Goal */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 transition-colors">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Weight Goal
            </span>
            <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          </div>
          <div className="mt-2.5 flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-mono tabular-nums">
                {profile.weightGoalKg.toFixed(1)}
              </span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">kg</span>
            </div>
            <button
              type="button"
              onClick={onEditProfile}
              className="inline-flex items-center gap-1 min-h-[36px] px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
              Edit
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Personal target weight
          </p>
        </div>

        {/* 6. Weight Progress */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 transition-colors">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Weight Progress
            </span>
            {Math.abs(remainingToGoalKg) < 0.1 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            ) : (
              <Minus className="w-4 h-4 text-slate-400 dark:text-slate-500" aria-hidden="true" />
            )}
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <ProgressIcon className={`w-5 h-5 shrink-0 ${progressColor}`} aria-hidden="true" />
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 tabular-nums">
              {progressSummary}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {progressSubtext}
          </p>
        </div>
      </div>
    </section>
  );
};
