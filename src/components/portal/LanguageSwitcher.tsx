'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Languages, ChevronDown, Check } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import type { SupportedLanguage } from '@/lib/i18n/types';

interface LanguageSwitcherProps {
  className?: string;
}

export default function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const { language, setLanguage, supportedLanguages } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const currentLangObj = supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Language Switcher Pill Button */}
      <button
        type="button"
        id="portal-language-switcher-button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select portal language / ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white border-2 border-[#2563EB] text-[#2563EB] shadow-[0_2px_10px_rgba(37,99,235,0.08)] hover:bg-blue-50/70 hover:shadow-md transition-all font-semibold text-xs sm:text-sm select-none focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
      >
        <Languages className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#2563EB] shrink-0" />
        <span className="tracking-wide">{currentLangObj.nativeName}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2563EB] transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Languages"
          className="absolute right-0 mt-2 w-44 sm:w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3.5 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Language / ಭಾಷೆ
          </div>
          {supportedLanguages.map((lang) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                role="option"
                aria-selected={isSelected}
                type="button"
                onClick={() => {
                  setLanguage(lang.code as SupportedLanguage);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs sm:text-sm transition-colors ${
                  isSelected
                    ? 'bg-blue-50 text-[#2563EB] font-bold'
                    : 'text-slate-700 hover:bg-slate-50 font-medium'
                }`}
              >
                <div className="flex flex-col">
                  <span>{lang.nativeName}</span>
                  {lang.code === 'kn' && (
                    <span className="text-[10px] text-slate-400 font-normal">Kannada</span>
                  )}
                  {lang.code === 'en' && (
                    <span className="text-[10px] text-slate-400 font-normal">English</span>
                  )}
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#2563EB] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
