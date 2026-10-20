import React, { useState, useRef, useEffect } from 'react';
import { Globe2, Check, ChevronDown, Sparkles } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES, Language } from '../context/LanguageContext';

interface LanguageSwitcherProps {
  variant?: 'pill' | 'dropdown' | 'mobile';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'pill',
  className = '',
}) => {
  const { language, setLanguage, currentOption } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Sleek Compact Pill Toggle (EN | FR with quick click)
  if (variant === 'pill') {
    return (
      <div 
        className={`relative inline-flex items-center bg-slate-950/90 p-1 rounded-xl border border-slate-800 shadow-inner ${className}`}
        id="header-language-pill-toggle"
        role="group"
        aria-label="Language Switcher"
      >
        <div className="flex items-center gap-1">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isActive = language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black scale-100'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
                title={`Switch to ${lang.label} (${lang.regionHint})`}
                id={`lang-btn-${lang.code}`}
              >
                <span className="text-xs select-none">{lang.flag}</span>
                <span className="tracking-wide uppercase text-[11px]">{lang.code}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. Dropdown Menu Variant (with Pan-African details)
  if (variant === 'dropdown') {
    return (
      <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700/80 text-xs font-bold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          id="language-dropdown-button"
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
        >
          <Globe2 className="w-3.5 h-3.5 text-amber-400" />
          <span className="select-none text-sm">{currentOption.flag}</span>
          <span className="uppercase tracking-wider font-extrabold text-[11px]">{currentOption.code}</span>
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
            {/* Header info */}
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-black text-white uppercase tracking-wider">
                  Pan-African Locale
                </span>
              </div>
              <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                ECOWAS
              </span>
            </div>

            {/* Language Options */}
            <div className="p-1.5 space-y-1">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border border-amber-500/30 text-white'
                        : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className="text-xl shrink-0 select-none pt-0.5">{lang.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white flex items-center gap-1.5">
                          {lang.nativeLabel}
                          <span className="text-[10px] text-slate-400 font-normal">({lang.label})</span>
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {lang.regionHint}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Pan-African Footer hint */}
            <div className="p-2.5 bg-slate-950/60 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Cross-border logistics support in Nigeria, Ghana & West Africa</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. Mobile View Switcher (Expanded in drawer)
  return (
    <div className={`p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
        <span className="flex items-center gap-1.5 text-amber-400">
          <Globe2 className="w-3.5 h-3.5" />
          <span>Regional Language</span>
        </span>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Pan-Africa</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isActive = language === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-black transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md ring-2 ring-amber-400/20'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span className="text-base select-none">{lang.flag}</span>
              <span>{lang.nativeLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
