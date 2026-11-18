import React, { useState } from 'react';
import { Apple, Droplets, Dumbbell, HeartPulse, Sparkles, SunMedium } from 'lucide-react';
import { CATEGORY_GUIDANCE, HEALTH_TIPS } from '../data/healthTips';
import { BmiResult, TipTopic } from '../types/health';

interface HealthTipsSectionProps {
  bmiResult: BmiResult;
  currentWeightKg: number;
}

const TOPIC_TABS: { id: TipTopic; label: string }[] = [
  { id: TipTopic.All, label: 'All Guidance' },
  { id: TipTopic.Hydration, label: 'Hydration' },
  { id: TipTopic.Nutrition, label: 'Nutrition' },
  { id: TipTopic.Exercise, label: 'Exercise' },
  { id: TipTopic.Lifestyle, label: 'Lifestyle' },
];

const TOPIC_ICON_MAP = {
  [TipTopic.Hydration]: Droplets,
  [TipTopic.Nutrition]: Apple,
  [TipTopic.Exercise]: Dumbbell,
  [TipTopic.Lifestyle]: SunMedium,
};

const TOPIC_LABEL_MAP = {
  [TipTopic.Hydration]: 'Hydration',
  [TipTopic.Nutrition]: 'Nutrition',
  [TipTopic.Exercise]: 'Exercise',
  [TipTopic.Lifestyle]: 'Lifestyle',
};

export const HealthTipsSection: React.FC<HealthTipsSectionProps> = ({
  bmiResult,
  currentWeightKg,
}) => {
  const [activeTopic, setActiveTopic] = useState<TipTopic>(TipTopic.All);

  const guidance = CATEGORY_GUIDANCE[bmiResult.category];
  // ~33 ml per kg of body weight as a general daily baseline
  const dailyWaterLiters = Math.max(1.5, Math.min(4.0, Math.round((currentWeightKg * 0.033) * 10) / 10));

  const visibleTips =
    activeTopic === TipTopic.All
      ? HEALTH_TIPS
      : HEALTH_TIPS.filter((tip) => tip.topic === activeTopic);

  return (
    <section
      id="tips"
      aria-labelledby="health-tips-heading"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-colors scroll-mt-20"
    >
      {/* Header & Interactive Topic Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <HeartPulse className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2
              id="health-tips-heading"
              className="text-lg font-semibold text-slate-900 dark:text-slate-50"
            >
              Personalized Health Guidance
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tailored to your {bmiResult.label.toLowerCase()} BMI profile · Daily hydration target{' '}
              <span className="font-mono tabular-nums font-medium text-slate-700 dark:text-slate-300">
                ~{dailyWaterLiters.toFixed(1)} L
              </span>
            </p>
          </div>
        </div>

        <div
          className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl"
          role="tablist"
          aria-label="Filter health tips by topic"
        >
          {TOPIC_TABS.map((tab) => {
            const active = activeTopic === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTopic(tab.id)}
                className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category-Specific Educational Guidance */}
      <div className={`mt-5 rounded-xl border p-5 ${bmiResult.surfaceTintClass}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            <span>BMI Focus</span>
            <span aria-hidden="true">·</span>
            <span className={bmiResult.textColorClass}>{bmiResult.label}</span>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
            BMI {bmiResult.bmi.toFixed(1)}
          </span>
        </div>

        <h3 className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-50">
          {guidance.headline}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {guidance.explanation}
        </p>

        <ul className="mt-4 space-y-2 border-t border-slate-200/70 dark:border-slate-800/80 pt-3">
          {guidance.focusPoints.map((point, index) => (
            <li
              key={index}
              className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300"
            >
              <span
                className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0"
                aria-hidden="true"
              />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* General Lifestyle Grid (Hydration, Nutrition, Exercise, Lifestyle) */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleTips.map((tip) => {
          const Icon = TOPIC_ICON_MAP[tip.topic];
          return (
            <article
              key={tip.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                    <span>{TOPIC_LABEL_MAP[tip.topic]}</span>
                  </div>
                  <span className="tabular-nums">{tip.actionableTarget}</span>
                </div>

                <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {tip.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {tip.description}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <p className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        Educational note: BMI is a practical screening indicator and does not measure body fat percentage, muscle mass, or individual medical conditions. Consult a qualified clinician for personalized medical guidance.
      </p>
    </section>
  );
};
