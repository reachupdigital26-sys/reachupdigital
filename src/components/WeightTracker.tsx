import React, { useMemo, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ChartOptions,
  ScriptableContext,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  Check,
  Database,
  Pencil,
  Plus,
  Scale,
  Trash2,
  X,
} from 'lucide-react';
import {
  ThemeMode,
  TimeRangeFilter,
  ValidationErrors,
  WeightRecord,
} from '../types/health';
import {
  calculateBmi,
  formatFullDate,
  formatShortDate,
  getTodayIsoDate,
  validateWeightRecordInputs,
} from '../utils/healthCalculations';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface WeightTrackerProps {
  records: WeightRecord[];
  heightCm: number;
  weightGoalKg: number;
  theme: ThemeMode;
  weightInputRef?: React.RefObject<HTMLInputElement | null>;
  onAddRecord: (record: Omit<WeightRecord, 'id' | 'createdAt'>) => void;
  onUpdateRecord: (id: string, updated: { date: string; weightKg: number; note?: string }) => void;
  onDeleteRecord: (id: string) => void;
  onRequestClearAll: () => void;
  onLoadSampleData: () => void;
}

const RANGE_OPTIONS: { id: TimeRangeFilter; label: string }[] = [
  { id: TimeRangeFilter.SevenDays, label: '7D' },
  { id: TimeRangeFilter.ThirtyDays, label: '30D' },
  { id: TimeRangeFilter.NinetyDays, label: '90D' },
  { id: TimeRangeFilter.All, label: 'All' },
];

export const WeightTracker: React.FC<WeightTrackerProps> = ({
  records,
  heightCm,
  weightGoalKg,
  theme,
  weightInputRef,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  onRequestClearAll,
  onLoadSampleData,
}) => {
  const internalWeightRef = useRef<HTMLInputElement>(null);
  const inputRef = weightInputRef ?? internalWeightRef;

  const [date, setDate] = useState(getTodayIsoDate());
  const [weightInput, setWeightInput] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [rangeFilter, setRangeFilter] = useState<TimeRangeFilter>(TimeRangeFilter.ThirtyDays);

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editErrors, setEditErrors] = useState<ValidationErrors>({});

  const filteredRecords = useMemo(() => {
    if (rangeFilter === TimeRangeFilter.All) return records;

    const daysMap: Record<Exclude<TimeRangeFilter, TimeRangeFilter.All>, number> = {
      [TimeRangeFilter.SevenDays]: 7,
      [TimeRangeFilter.ThirtyDays]: 30,
      [TimeRangeFilter.NinetyDays]: 90,
    };
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysMap[rangeFilter]);
    const cutoffIso = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(cutoff.getDate()).padStart(2, '0')}`;

    return records.filter((r) => r.date >= cutoffIso);
  }, [records, rangeFilter]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateWeightRecordInputs({
      date,
      weightKg: weightInput,
      note,
    });
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    onAddRecord({
      date,
      weightKg: Math.round(Number(weightInput) * 10) / 10,
      note: note.trim() || undefined,
    });
    setWeightInput('');
    setNote('');
    setErrors({});
  };

  const startEditing = (record: WeightRecord) => {
    setEditingId(record.id);
    setEditDate(record.date);
    setEditWeight(String(record.weightKg));
    setEditNote(record.note ?? '');
    setEditErrors({});
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditErrors({});
  };

  const saveEditing = (id: string) => {
    const validation = validateWeightRecordInputs({
      date: editDate,
      weightKg: editWeight,
      note: editNote,
    });
    if (Object.keys(validation).length > 0) {
      setEditErrors(validation);
      return;
    }

    onUpdateRecord(id, {
      date: editDate,
      weightKg: Math.round(Number(editWeight) * 10) / 10,
      note: editNote.trim() || undefined,
    });
    setEditingId(null);
    setEditErrors({});
  };

  const isDark = theme === 'dark';

  const chartData = useMemo(() => {
    const labels = filteredRecords.map((r) => formatShortDate(r.date));
    const weights = filteredRecords.map((r) => r.weightKg);
    const goalLine = filteredRecords.map(() => weightGoalKg);

    return {
      labels,
      datasets: [
        {
          label: 'Weight (kg)',
          data: weights,
          borderColor: isDark ? '#60A5FA' : '#2563EB',
          backgroundColor: (context: ScriptableContext<'line'>) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) {
              return isDark ? 'rgba(59, 130, 246, 0.14)' : 'rgba(37, 99, 235, 0.12)';
            }
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(
              0,
              isDark ? 'rgba(59, 130, 246, 0.28)' : 'rgba(37, 99, 235, 0.20)'
            );
            gradient.addColorStop(
              1,
              isDark ? 'rgba(16, 185, 129, 0.02)' : 'rgba(16, 185, 129, 0.02)'
            );
            return gradient;
          },
          borderWidth: 2.5,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: isDark ? '#0F172A' : '#FFFFFF',
          pointBorderColor: isDark ? '#60A5FA' : '#2563EB',
          pointBorderWidth: 2,
          fill: true,
          tension: 0.32,
        },
        {
          label: `Goal (${weightGoalKg.toFixed(1)} kg)`,
          data: goalLine,
          borderColor: isDark ? '#34D399' : '#16A34A',
          borderWidth: 1.75,
          borderDash: [6, 6],
          pointRadius: 0,
          pointHoverRadius: 0,
          fill: false,
        },
      ],
    };
  }, [filteredRecords, weightGoalKg, isDark]);

  const chartOptions: ChartOptions<'line'> = useMemo(() => {
    const allValues = [
      ...filteredRecords.map((r) => r.weightKg),
      weightGoalKg,
    ];
    const minVal = allValues.length > 0 ? Math.min(...allValues) : 50;
    const maxVal = allValues.length > 0 ? Math.max(...allValues) : 80;
    const padding = Math.max(1.5, (maxVal - minVal) * 0.25);

    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            color: isDark ? '#CBD5E1' : '#475569',
            usePointStyle: true,
            pointStyle: 'line',
            boxWidth: 20,
            font: {
              family: '"DM Sans", system-ui, sans-serif',
              size: 12,
            },
          },
        },
        tooltip: {
          backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
          titleColor: isDark ? '#F8FAFC' : '#0F172A',
          bodyColor: isDark ? '#CBD5E1' : '#334155',
          borderColor: isDark ? '#334155' : '#E2E8F0',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 10,
          displayColors: true,
          callbacks: {
            title: (items) => {
              const idx = items[0]?.dataIndex;
              if (idx === undefined || !filteredRecords[idx]) return '';
              return formatFullDate(filteredRecords[idx].date);
            },
            label: (ctx) => {
              const val = Number(ctx.parsed.y);
              if (ctx.datasetIndex === 0) {
                const bmiAtWeight = calculateBmi(val, heightCm).bmi;
                return ` Weight: ${val.toFixed(1)} kg (BMI ${bmiAtWeight.toFixed(1)})`;
              }
              return ` Goal: ${val.toFixed(1)} kg`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: isDark ? '#94A3B8' : '#64748B',
            font: {
              family: '"DM Sans", system-ui, sans-serif',
              size: 11,
            },
            maxRotation: 0,
          },
        },
        y: {
          suggestedMin: Math.floor((minVal - padding) * 10) / 10,
          suggestedMax: Math.ceil((maxVal + padding) * 10) / 10,
          grid: {
            color: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.8)',
          },
          ticks: {
            color: isDark ? '#94A3B8' : '#64748B',
            font: {
              family: '"JetBrains Mono", monospace',
              size: 11,
            },
            callback: (value) => `${Number(value).toFixed(1)}`,
          },
        },
      },
    };
  }, [filteredRecords, weightGoalKg, heightCm, isDark]);

  // Display newest first in the history table
  const reverseRecords = useMemo(() => [...records].reverse(), [records]);

  return (
    <section
      id="tracker"
      aria-labelledby="weight-tracker-heading"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-colors scroll-mt-20"
    >
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2
              id="weight-tracker-heading"
              className="text-lg font-semibold text-slate-900 dark:text-slate-50"
            >
              Weight Tracker &amp; Progress
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Log daily weights, inspect trends, and edit or manage your history
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time Range Segmented Control */}
          <div
            className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl"
            role="group"
            aria-label="Chart time range"
          >
            {RANGE_OPTIONS.map((option) => {
              const active = rangeFilter === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setRangeFilter(option.id)}
                  className={`min-h-[34px] px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {records.length > 0 && (
            <button
              type="button"
              onClick={onRequestClearAll}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Add Daily Weight Form */}
      <form
        onSubmit={handleAddSubmit}
        noValidate
        className="mt-5 pb-6 border-b border-slate-100 dark:border-slate-800"
      >
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
          <div className="sm:col-span-3">
            <label
              htmlFor="log-date"
              className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5"
            >
              Date
            </label>
            <input
              id="log-date"
              type="date"
              max={getTodayIsoDate()}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (errors.date) setErrors((prev) => ({ ...prev, date: '' }));
              }}
              className="w-full min-h-[44px] px-3 py-2 text-sm tabular-nums bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
            />
            {errors.date && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400" role="alert">
                {errors.date}
              </p>
            )}
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="log-weight"
              className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5"
            >
              Weight (kg)
            </label>
            <input
              ref={inputRef}
              id="log-weight"
              type="number"
              inputMode="decimal"
              min={15}
              max={350}
              step={0.1}
              value={weightInput}
              onChange={(e) => {
                setWeightInput(e.target.value);
                if (errors.weightKg) setErrors((prev) => ({ ...prev, weightKg: '' }));
              }}
              placeholder="e.g. 68.2"
              className="w-full min-h-[44px] px-3 py-2 text-sm font-medium tabular-nums bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
            />
            {errors.weightKg && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400" role="alert">
                {errors.weightKg}
              </p>
            )}
          </div>

          <div className="sm:col-span-4">
            <label
              htmlFor="log-note"
              className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5"
            >
              Note (Optional)
            </label>
            <input
              id="log-note"
              type="text"
              maxLength={80}
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                if (errors.note) setErrors((prev) => ({ ...prev, note: '' }));
              }}
              placeholder="e.g. Morning weigh-in"
              className="w-full min-h-[44px] px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
            />
            {errors.note && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400" role="alert">
                {errors.note}
              </p>
            )}
          </div>

          <div className="sm:col-span-2 sm:pt-[22px]">
            <button
              type="submit"
              className="w-full min-h-[44px] px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl inline-flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              Add Entry
            </button>
          </div>
        </div>
      </form>

      {/* Chart.js Area */}
      {records.length === 0 ? (
        <div className="py-12 text-center">
          <Scale className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" aria-hidden="true" />
          <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-100">
            No weight records yet
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Add your first daily weigh-in above to track your progress chart, or load sample records to preview the trend view.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.focus()}
              className="min-h-[44px] px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              Log First Weight
            </button>
            <button
              type="button"
              onClick={onLoadSampleData}
              className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              <Database className="w-4 h-4" aria-hidden="true" />
              Load Sample Data
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {/* Interactive Chart.js Canvas */}
          <div>
            {filteredRecords.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 p-4">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  No records within the selected date window
                </p>
                <button
                  type="button"
                  onClick={() => setRangeFilter(TimeRangeFilter.All)}
                  className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Show all {records.length} records
                </button>
              </div>
            ) : (
              <div className="h-72 sm:h-80 w-full">
                <Line data={chartData} options={chartOptions} />
              </div>
            )}
          </div>

          {/* Weight History Table */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Weight History
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                {records.length} {records.length === 1 ? 'entry' : 'entries'} · Sorted newest first
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <th className="py-2.5 pr-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Weight</th>
                    <th className="py-2.5 px-3 text-right hidden sm:table-cell">BMI</th>
                    <th className="py-2.5 px-3 hidden md:table-cell">Note</th>
                    <th className="py-2.5 pl-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                  {reverseRecords.map((record) => {
                    const isEditing = editingId === record.id;
                    const recordBmi = calculateBmi(record.weightKg, heightCm);

                    if (isEditing) {
                      return (
                        <tr key={record.id} className="bg-blue-50/40 dark:bg-blue-950/20">
                          <td className="py-2.5 pr-2">
                            <input
                              type="date"
                              max={getTodayIsoDate()}
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              aria-label="Edit date"
                              className="w-full min-h-[38px] px-2.5 py-1 text-xs tabular-nums bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                            />
                            {editErrors.date && (
                              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
                                {editErrors.date}
                              </p>
                            )}
                          </td>
                          <td className="py-2.5 px-2">
                            <input
                              type="number"
                              step={0.1}
                              min={15}
                              max={350}
                              value={editWeight}
                              onChange={(e) => setEditWeight(e.target.value)}
                              aria-label="Edit weight in kg"
                              className="w-24 ml-auto block min-h-[38px] px-2.5 py-1 text-xs text-right tabular-nums bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                            />
                            {editErrors.weightKg && (
                              <p className="mt-1 text-[11px] text-right text-rose-600 dark:text-rose-400">
                                {editErrors.weightKg}
                              </p>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right hidden sm:table-cell text-xs text-slate-400 tabular-nums">
                            —
                          </td>
                          <td className="py-2.5 px-2 hidden md:table-cell">
                            <input
                              type="text"
                              maxLength={80}
                              value={editNote}
                              onChange={(e) => setEditNote(e.target.value)}
                              aria-label="Edit note"
                              placeholder="Optional note"
                              className="w-full min-h-[38px] px-2.5 py-1 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                            />
                          </td>
                          <td className="py-2.5 pl-2 text-right">
                            <div className="inline-flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => saveEditing(record.id)}
                                aria-label="Save changes"
                                className="min-h-[36px] min-w-[36px] flex items-center justify-center text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/60 rounded-lg transition-colors cursor-pointer"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditing}
                                aria-label="Cancel editing"
                                className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr
                        key={record.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 pr-3 whitespace-nowrap">
                          <span className="font-medium text-slate-900 dark:text-slate-100 tabular-nums">
                            {formatFullDate(record.date)}
                          </span>
                          {record.note && (
                            <span className="block md:hidden text-xs text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                              {record.note}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums whitespace-nowrap">
                          {record.weightKg.toFixed(1)} kg
                        </td>
                        <td className="py-3 px-3 text-right hidden sm:table-cell font-mono text-xs text-slate-600 dark:text-slate-400 tabular-nums whitespace-nowrap">
                          {recordBmi.bmi.toFixed(1)}
                        </td>
                        <td className="py-3 px-3 hidden md:table-cell text-slate-600 dark:text-slate-400 truncate max-w-xs">
                          {record.note || '—'}
                        </td>
                        <td className="py-3 pl-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => startEditing(record)}
                              aria-label={`Edit weight entry from ${record.date}`}
                              className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteRecord(record.id)}
                              aria-label={`Delete weight entry from ${record.date}`}
                              className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
