import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, HelpCircle } from 'lucide-react';
import { RiskLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number | null;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  score,
  size = 'md',
  showIcon = true,
}) => {
  let label = 'Low Risk';
  let colorClasses = 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800';
  let Icon = ShieldCheck;

  switch (level) {
    case 'low':
      label = 'Low Risk';
      colorClasses = 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800';
      Icon = ShieldCheck;
      break;
    case 'medium':
      label = 'Needs Review';
      colorClasses = 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800';
      Icon = ShieldAlert;
      break;
    case 'high':
      label = 'High Risk';
      colorClasses = 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800';
      Icon = ShieldAlert;
      break;
    case 'uncertain':
      label = 'Uncertain';
      colorClasses = 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800';
      Icon = HelpCircle;
      break;
  }

  const sizeClasses =
    size === 'sm'
      ? 'text-xs px-2.5 py-0.5 gap-1.5'
      : size === 'lg'
      ? 'text-sm font-semibold px-4 py-1.5 gap-2'
      : 'text-xs font-medium px-3 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full border whitespace-nowrap transition-colors duration-200 ${colorClasses} ${sizeClasses}`}
    >
      {showIcon && <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{label}</span>
      {score !== undefined && score !== null && (
        <span className="opacity-80 pl-1 font-mono">({score}/100)</span>
      )}
    </span>
  );
};
