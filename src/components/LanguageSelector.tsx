import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../contexts/I18nContext';
import { Languages, Check, Search, ChevronDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LanguageCode } from '../i18n';

interface LanguageSelectorProps {
  variant?: 'compact' | 'full' | 'header' | 'footer' | 'inline';
  className?: string;
  showLabel?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'header',
  className = '',
  showLabel = true,
}) => {
  const { language, currentLanguage, setLanguage, supportedLanguages, t, isRTL } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const filteredLanguages = supportedLanguages.filter(lang => 
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        id="language-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`flex items-center gap-2 rounded-xl transition-all duration-200 border cursor-pointer select-none ${
          variant === 'compact'
            ? 'p-2 bg-slate-900/40 dark:bg-slate-900/60 hover:bg-slate-800/80 border-slate-700/60 text-slate-200 text-sm shadow-sm backdrop-blur-md'
            : variant === 'inline'
            ? 'px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/70 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm shadow-sm'
            : 'px-3 py-2 bg-slate-900/50 hover:bg-slate-800/80 dark:bg-slate-900/70 dark:hover:bg-slate-800 border-slate-700/60 dark:border-slate-700 text-slate-100 text-sm font-medium shadow-sm hover:border-teal-500/50 backdrop-blur-md'
        }`}
        title={`${t.common.language}: ${currentLanguage.nativeName} (${currentLanguage.name})`}
      >
        <span className="text-base leading-none select-none">{currentLanguage.flag}</span>
        <div className="flex items-center gap-1.5">
          <Languages className="w-4 h-4 text-teal-400 shrink-0" />
          {showLabel && (
            <span className="truncate max-w-[90px] sm:max-w-[120px] font-medium">
              {currentLanguage.nativeName}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-teal-400' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute z-50 mt-2 w-72 sm:w-80 rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-700/70 shadow-2xl overflow-hidden ${
              isRTL ? 'left-0 origin-top-left' : 'right-0 origin-top-right'
            }`}
          >
            {/* Search and Header */}
            <div className="p-3 border-b border-slate-800/80 bg-slate-900/80">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-teal-400" />
                  {t.common.selectLanguage}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  {supportedLanguages.length} Languages
                </span>
              </div>
              
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.common.searchPlaceholder || "Search language..."}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-800/90 text-slate-100 placeholder-slate-400 rounded-xl border border-slate-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                />
              </div>
            </div>

            {/* Language List */}
            <div className="max-h-72 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
              {filteredLanguages.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No languages found for "{searchQuery}"
                </div>
              ) : (
                filteredLanguages.map((lang) => {
                  const isSelected = lang.code === language;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleSelect(lang.code)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-teal-500/20 border border-teal-500/40 text-teal-200 shadow-sm'
                          : 'hover:bg-slate-800/80 text-slate-200 hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-lg leading-none shrink-0">{lang.flag}</span>
                        <div className="truncate">
                          <div className="font-medium text-sm text-slate-100 flex items-center gap-1.5">
                            <span>{lang.nativeName}</span>
                            {lang.dir === 'rtl' && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                                RTL
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {lang.name}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-1 text-teal-400 shrink-0">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer banner */}
            <div className="px-3 py-2 bg-slate-950/80 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1 text-teal-400/90 font-medium">
                <Sparkles className="w-3 h-3" />
                Live Instant Translation
              </span>
              <span className="text-slate-400">DOCUSENTRY i18n</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
