import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  to?: string;
  label?: string;
  fallbackTo?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  to,
  label = 'Back',
  fallbackTo = '/dashboard',
  className = '',
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallbackTo);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700/80 shadow-xs hover:border-[#AD343E]/40 hover:text-[#AD343E] dark:hover:text-rose-400 hover:bg-zinc-50 dark:hover:bg-zinc-700/60 active:scale-95 transition-all cursor-pointer group ${className}`}
      aria-label={`Go back: ${label}`}
    >
      <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
      <span>{label}</span>
    </button>
  );
};
