import React from 'react';

interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 140,
  strokeWidth = 10,
  color = 'stroke-emerald-500',
  trackColor = 'stroke-slate-200 dark:stroke-slate-800',
  label,
  sublabel,
}) => {
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          className={`${trackColor} fill-none`}
        />
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`${color} fill-none transition-all duration-1000 ease-out`}
        />
      </svg>
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
        <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-['Outfit']">
          {label !== undefined ? label : `${Math.round(normalizedProgress)}%`}
        </span>
        {sublabel && (
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-wider">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};
