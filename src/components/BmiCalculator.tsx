import React, { useEffect, useState } from 'react';
import { Calculator, Check, RotateCcw } from 'lucide-react';
import { BmiCategory, ValidationErrors } from '../types/health';
import { calculateBmi, validateBmiInputs } from '../utils/healthCalculations';

interface BmiCalculatorProps {
  profileHeightCm: number;
  profileWeightKg: number;
  onSyncToProfile: (heightCm: number, weightKg: number) => void;
}

const BMI_BANDS = [
  {
    category: BmiCategory.Underweight,
    label: 'Underweight',
    range: '< 18.5',
    barClass: 'bg-blue-500 dark:bg-blue-400',
    widthPercent: ((18.5 - 12) / (40 - 12)) * 100, // ~23.2%
  },
  {
    category: BmiCategory.Normal,
    label: 'Normal',
    range: '18.5 – 24.9',
    barClass: 'bg-emerald-500 dark:bg-emerald-400',
    widthPercent: ((25 - 18.5) / (40 - 12)) * 100, // ~23.2%
  },
  {
    category: BmiCategory.Overweight,
    label: 'Overweight',
    range: '25.0 – 29.9',
    barClass: 'bg-amber-500 dark:bg-amber-400',
    widthPercent: ((30 - 25) / (40 - 12)) * 100, // ~17.9%
  },
  {
    category: BmiCategory.Obesity,
    label: 'Obesity',
    range: '≥ 30.0',
    barClass: 'bg-rose-500 dark:bg-rose-400',
    widthPercent: ((40 - 30) / (40 - 12)) * 100, // ~35.7%
  },
];

export const BmiCalculator: React.FC<BmiCalculatorProps> = ({
  profileHeightCm,
  profileWeightKg,
  onSyncToProfile,
}) => {
  const [heightInput, setHeightInput] = useState(String(profileHeightCm));
  const [weightInput, setWeightInput] = useState(String(profileWeightKg));
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [syncedNotice, setSyncedNotice] = useState(false);

  // Sync calculator inputs when profile height/weight changes externally
  useEffect(() => {
    setHeightInput(String(profileHeightCm));
    setWeightInput(String(profileWeightKg));
    setErrors({});
  }, [profileHeightCm, profileWeightKg]);

  const handleHeightChange = (value: string) => {
    setHeightInput(value);
    setSyncedNotice(false);
    setErrors(validateBmiInputs(value, weightInput));
  };

  const handleWeightChange = (value: string) => {
    setWeightInput(value);
    setSyncedNotice(false);
    setErrors(validateBmiInputs(heightInput, value));
  };

  const handleReset = () => {
    setHeightInput('170');
    setWeightInput('65');
    setErrors({});
    setSyncedNotice(false);
  };

  const handleApplyToProfile = () => {
    const validation = validateBmiInputs(heightInput, weightInput);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    const parsedHeight = Math.round(Number(heightInput) * 10) / 10;
    const parsedWeight = Math.round(Number(weightInput) * 10) / 10;
    onSyncToProfile(parsedHeight, parsedWeight);
    setSyncedNotice(true);
    window.setTimeout(() => setSyncedNotice(false), 2400);
  };

  const validationErrors = validateBmiInputs(heightInput, weightInput);
  const isValid = Object.keys(validationErrors).length === 0;
  const result = isValid
    ? calculateBmi(Number(weightInput), Number(heightInput))
    : null;

  return (
    <section
      id="calculator"
      aria-labelledby="bmi-calculator-heading"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-colors scroll-mt-20"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Calculator className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2
              id="bmi-calculator-heading"
              className="text-lg font-semibold text-slate-900 dark:text-slate-50"
            >
              BMI Calculator
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Formula: Weight (kg) / Height (m)²
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          Reset Calculator
        </button>
      </div>

      {/* Inputs */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="calc-height"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
          >
            Height (cm)
          </label>
          <input
            id="calc-height"
            type="number"
            inputMode="decimal"
            min={50}
            max={260}
            step={0.5}
            value={heightInput}
            onChange={(e) => handleHeightChange(e.target.value)}
            placeholder="e.g. 170"
            className="w-full min-h-[44px] px-3.5 py-2 text-base font-medium tabular-nums bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
          />
          {errors.height && (
            <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400" role="alert">
              {errors.height}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="calc-weight"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
          >
            Weight (kg)
          </label>
          <input
            id="calc-weight"
            type="number"
            inputMode="decimal"
            min={15}
            max={350}
            step={0.1}
            value={weightInput}
            onChange={(e) => handleWeightChange(e.target.value)}
            placeholder="e.g. 68.4"
            className="w-full min-h-[44px] px-3.5 py-2 text-base font-medium tabular-nums bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
          />
          {errors.weight && (
            <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400" role="alert">
              {errors.weight}
            </p>
          )}
        </div>
      </div>

      {/* BMI Result & Colorful Indicator */}
      {result ? (
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Calculated BMI Score
              </span>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 font-mono tabular-nums">
                  {result.bmi.toFixed(1)}
                </span>
                <span className={`text-base font-semibold ${result.textColorClass}`}>
                  {result.label}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleApplyToProfile}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {syncedNotice ? (
                <>
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  Synced to Profile
                </>
              ) : (
                'Apply to Profile'
              )}
            </button>
          </div>

          <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-400">
            {result.summary}
          </p>

          {/* Colorful BMI Indicator Spectrum */}
          <div className="mt-6" aria-label="BMI category spectrum">
            <div className="relative pt-5 pb-2">
              {/* Indicator Marker */}
              <div
                className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-transform duration-300 ease-out"
                style={{ left: `${result.indicatorPercent}%` }}
              >
                <span className="text-[11px] font-mono font-semibold text-slate-900 dark:text-slate-50 tabular-nums">
                  {result.bmi.toFixed(1)}
                </span>
                <span
                  className="mt-0.5 w-2.5 h-2.5 rotate-45 bg-slate-900 dark:bg-slate-50"
                  aria-hidden="true"
                />
              </div>

              {/* Segmented Color Bar */}
              <div className="flex h-3 w-full rounded-full overflow-hidden gap-0.5 bg-slate-100 dark:bg-slate-800">
                {BMI_BANDS.map((band) => (
                  <div
                    key={band.category}
                    className={`${band.barClass} h-full transition-opacity ${
                      result.category === band.category ? 'opacity-100' : 'opacity-45'
                    }`}
                    style={{ width: `${band.widthPercent}%` }}
                    title={`${band.label}: ${band.range}`}
                  />
                ))}
              </div>
            </div>

            {/* Category Legend */}
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              {BMI_BANDS.map((band) => {
                const active = result.category === band.category;
                return (
                  <div
                    key={band.category}
                    className={`flex items-start gap-2 ${
                      active ? 'opacity-100' : 'opacity-65'
                    }`}
                  >
                    <span
                      className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${band.barClass}`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p
                        className={`text-xs font-semibold truncate ${
                          active
                            ? 'text-slate-900 dark:text-slate-50'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {band.label}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                        {band.range}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
          Enter valid height (50–260 cm) and weight (15–350 kg) values to compute your BMI score.
        </div>
      )}
    </section>
  );
};
