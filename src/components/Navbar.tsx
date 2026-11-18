import React from 'react';
import { Activity, Calculator, HeartPulse, LayoutDashboard, Scale } from 'lucide-react';

export type NavSection = 'dashboard' | 'calculator' | 'tracker' | 'tips';

interface NavbarProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  onQuickLogWeight: () => void;
}

const NAV_ITEMS: { id: NavSection; label: string; mobileLabel: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', mobileLabel: 'Overview', icon: LayoutDashboard },
  { id: 'calculator', label: 'BMI & Ideal', mobileLabel: 'BMI', icon: Calculator },
  { id: 'tracker', label: 'Weight Log', mobileLabel: 'Weight', icon: Scale },
  { id: 'tips', label: 'Health Tips', mobileLabel: 'Tips', icon: HeartPulse },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  onQuickLogWeight,
}) => {
  return (
    <>
      <header className="sticky top-0 z-30 h-13 md:h-16 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element Brand Wordmark */}
          <a
            href="#dashboard"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('dashboard');
            }}
            className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md"
          >
            <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
            <span className="font-display">FitTrack</span>
          </a>

          {/* Zone 2: Concise single-line text links */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Primary navigation">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(item.id);
                  }}
                  className={`relative py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                      aria-hidden="true"
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: Single primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onQuickLogWeight}
              className="min-h-[40px] px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] dark:bg-blue-500 dark:hover:bg-blue-600 rounded-xl transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
            >
              Log Weight
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (keeps total sticky height <= 15% of mobile viewport) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-14 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800"
        aria-label="Mobile navigation"
      >
        <div className="grid grid-cols-4 h-full">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center min-h-[44px] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                <span className="text-[11px] font-medium mt-0.5 whitespace-nowrap">
                  {item.mobileLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
