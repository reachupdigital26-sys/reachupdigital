import React from 'react';
import { Compass, Target } from 'lucide-react';
import { calculateIdealWeightRange } from '../utils/healthCalculations';

interface IdealWeightCardProps {
  heightCm: number;
  currentWeightKg: number;
  weightGoalKg: number;
  onSetGoalWeight: (newGoalKg: number) => void;
}

export const IdealWeightCard: React.FC<IdealWeightCardProps> = ({
  heightCm,
  currentWeightKg,
  weightGoalKg,
  onSetGoalWeight,
}) => {
  const { minKg, maxKg, midpointKg } = calculateIdealWeightRange(heightCm);

  const diffFromGoal = Math.round((currentWeightKg - weightGoalKg) * 10) / 10;

  let rangeStatusText = '';
  let rangeStatusColor = 'text-emerald-700 dark:text-emerald-400';

  if (currentWeightKg < minKg) {
    const belowKg = (minKg - currentWeightKg).toFixed(1);
    rangeStatusText = `${belowKg} kg below healthy range`;
    rangeStatusColor = 'text-blue-700 dark:text-blue-400';
  } else if (currentWeightKg > maxKg) {
    const aboveKg = (currentWeightKg - maxKg).toFixed(1);
    rangeStatusText = `${aboveKg} kg above healthy range`;
    rangeStatusColor = 'text-amber-700 dark:text-amber-400';
  } else {
    rangeStatusText = 'Within healthy weight range';
    rangeStatusColor = 'text-emerald-700 dark:text-emerald-400';
  }

  let goalDiffLabel = 'You are right at your target weight';
  if (diffFromGoal > 0.05) {
    goalDiffLabel = `${diffFromGoal.toFixed(1)} kg above your ${weightGoalKg.toFixed(1)} kg goal`;
  } else if (diffFromGoal < -0.05) {
    goalDiffLabel = `${Math.abs(diffFromGoal).toFixed(1)} kg below your ${weightGoalKg.toFixed(1)} kg goal`;
  }

  // Visual range bar mapping [minKg - 15, maxKg + 15]
  const scaleMin = Math.max(20, minKg - 15);
  const scaleMax = maxKg + 15;
  const span = Math.max(1, scaleMax - scaleMin);
  const healthyLeftPct = ((minKg - scaleMin) / span) * 100;
  const healthyWidthPct = ((maxKg - minKg) / span) * 100;
  const currentPct = Math.max(2, Math.min(98, ((currentWeightKg - scaleMin) / span) * 100));
  const goalPct = Math.max(2, Math.min(98, ((weightGoalKg - scaleMin) / span) * 100));

  const isGoalAlreadyMidpoint = Math.abs(weightGoalKg - midpointKg) < 0.1;

  return (
    <section
      aria-labelledby="ideal-weight-heading"
      className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between transition-colors"
    >
      <div>
        <div className="flex items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="ideal-weight-heading"
                className="text-lg font-semibold text-slate-900 dark:text-slate-50"
              >
                Ideal Weight Range
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                Based on {heightCm} cm height (BMI 18.5–24.9)
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Healthy Weight Band
            </span>
            <p className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-mono tabular-nums">
              {minKg.toFixed(1)}–{maxKg.toFixed(1)}
              <span className="ml-1 text-sm font-sans font-medium text-slate-500 dark:text-slate-400">
                kg
              </span>
            </p>
            <p className={`mt-1.5 text-xs font-medium ${rangeStatusColor}`}>
              {rangeStatusText}
            </p>
          </div>

          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Target Comparison
            </span>
            <p className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-mono tabular-nums">
              {diffFromGoal > 0 ? `+${diffFromGoal.toFixed(1)}` : diffFromGoal.toFixed(1)}
              <span className="ml-1 text-sm font-sans font-medium text-slate-500 dark:text-slate-400">
                kg
              </span>
            </p>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {goalDiffLabel}
            </p>
          </div>
        </div>

        {/* Visual Position Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Position vs. Healthy Range &amp; Goal</span>
            <span className="font-mono tabular-nums">Midpoint {midpointKg.toFixed(1)} kg</span>
          </div>

          <div className="relative h-8 flex items-center">
            {/* Base track */}
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full relative overflow-hidden">
              <div
                className="absolute top-0 bottom-0 bg-emerald-500/80 dark:bg-emerald-400/75 rounded-full"
                style={{ left: `${healthyLeftPct}%`, width: `${healthyWidthPct}%` }}
              />
            </div>

            {/* Goal Marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-emerald-600 dark:border-emerald-400 bg-white dark:bg-slate-900 shadow-xs"
              style={{ left: `${goalPct}%` }}
              title={`Weight Goal: ${weightGoalKg.toFixed(1)} kg`}
            />

            {/* Current Weight Marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-600 dark:bg-blue-400 ring-4 ring-blue-600/15 dark:ring-blue-400/20"
              style={{ left: `${currentPct}%` }}
              title={`Current Weight: ${currentWeightKg.toFixed(1)} kg`}
            />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400" aria-hidden="true" />
              Current ({currentWeightKg.toFixed(1)} kg)
            </span>
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-emerald-600 dark:border-emerald-400" aria-hidden="true" />
              Goal ({weightGoalKg.toFixed(1)} kg)
            </span>
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <span className="w-3 h-2 rounded-xs bg-emerald-500/80 dark:bg-emerald-400/75" aria-hidden="true" />
              Healthy Band
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Recommended midpoint: <strong className="text-slate-700 dark:text-slate-200 tabular-nums">{midpointKg.toFixed(1)} kg</strong>
        </span>
        <button
          type="button"
          onClick={() => onSetGoalWeight(midpointKg)}
          disabled={isGoalAlreadyMidpoint}
          className={`inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 text-xs font-medium rounded-xl transition-colors whitespace-nowrap shrink-0 ${
            isGoalAlreadyMidpoint
              ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-default'
              : 'bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 dark:text-blue-300 cursor-pointer'
          }`}
        >
          <Target className="w-3.5 h-3.5" aria-hidden="true" />
          {isGoalAlreadyMidpoint ? 'Midpoint Set as Goal' : 'Use Midpoint as Goal'}
        </button>
      </div>
    </section>
  );
};
