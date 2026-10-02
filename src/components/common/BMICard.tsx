import React, { useState } from 'react';
import { calculateBMI, BMI_DISCLAIMER } from '../../services/fitnessService';
import { Info, Sparkles } from 'lucide-react';

interface BMICardProps {
  currentWeight: number;
  height: number;
  onUpdateWeight?: (weight: number) => void;
  showInlineCalculator?: boolean;
}

export const BMICard: React.FC<BMICardProps> = ({
  currentWeight,
  height,
  onUpdateWeight,
  showInlineCalculator = false,
}) => {
  const [tempWeight, setTempWeight] = useState<number>(currentWeight || 70);
  const [tempHeight, setTempHeight] = useState<number>(height || 175);
  const [showInfo, setShowInfo] = useState(false);

  const { value, category } = calculateBMI(
    showInlineCalculator ? tempWeight : currentWeight,
    showInlineCalculator ? tempHeight : height
  );

  // Calculate percentage along standard 15 - 40 scale for gauge bar
  const gaugePercent = Math.min(100, Math.max(0, ((value - 15) / (38 - 15)) * 100));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden transition-all duration-300">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
            Body Composition
          </span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            BMI Analysis
            <button
              type="button"
              onClick={() => setShowInfo(!showInfo)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="About BMI"
            >
              <Info className="w-4 h-4" />
            </button>
          </h3>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${category.bgLight} ${category.color}`}
        >
          {category.category}
        </span>
      </div>

      {/* Main Score */}
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-['Outfit']">
          {value > 0 ? value : '--'}
        </span>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          kg/m²
        </span>
      </div>

      {/* Visual BMI Gauge Spectrum */}
      <div className="space-y-1.5 mb-4">
        <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 flex relative">
          <div className="h-full w-[25%] bg-amber-400/80 rounded-l-full" title="Underweight (< 18.5)" />
          <div className="h-full w-[35%] bg-emerald-500" title="Normal (18.5 - 24.9)" />
          <div className="h-full w-[20%] bg-orange-400" title="Overweight (25 - 29.9)" />
          <div className="h-full w-[20%] bg-rose-500 rounded-r-full" title="Obesity (30+)" />

          {/* Indicator pin */}
          {value > 0 && (
            <div
              className="absolute top-0 bottom-0 w-2 bg-slate-900 dark:bg-white rounded-full shadow-md -translate-x-1/2 transition-all duration-500"
              style={{ left: `${gaugePercent}%` }}
            />
          )}
        </div>
        <div className="flex justify-between text-[10px] font-medium text-slate-400">
          <span>15</span>
          <span>18.5</span>
          <span>25</span>
          <span>30</span>
          <span>38+</span>
        </div>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
        {category.description}
      </p>

      {/* Optional Interactive adjustments */}
      {showInlineCalculator && (
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={tempWeight}
              onChange={(e) => {
                const w = parseFloat(e.target.value) || 0;
                setTempWeight(w);
                if (onUpdateWeight) onUpdateWeight(w);
              }}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Height (cm)
            </label>
            <input
              type="number"
              value={tempHeight}
              onChange={(e) => setTempHeight(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* Medical Disclaimer Requirement */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed flex gap-2">
        <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <span>{BMI_DISCLAIMER}</span>
      </div>
    </div>
  );
};
