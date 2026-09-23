import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from '../../contexts/I18nContext';

export const HelpPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { t } = useTranslation();

  const faqs = [
    {
      q: t.help.faq1Q,
      a: t.help.faq1A,
    },
    {
      q: t.help.faq2Q,
      a: t.help.faq2A,
    },
    {
      q: t.help.faq3Q,
      a: t.help.faq3A,
    },
    {
      q: 'Can DOCUSENTRY be integrated into our enterprise API?',
      a: 'Yes, DOCUSENTRY offers a REST API with webhook integrations, enabling automated document verification pipelines for HR, banking, and legal workflows.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
          {t.help.title}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {t.help.subtitle}
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openFaq === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-zinc-200/80 dark:border-[#30343B] bg-linear-to-b from-white to-slate-50/50 dark:from-[#1A1D21] dark:to-slate-900/40 overflow-hidden interactive-card"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
              >
                <span className="text-sm font-bold text-zinc-900 dark:text-white">{faq.q}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

