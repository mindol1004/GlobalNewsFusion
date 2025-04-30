import React, { useState, useRef, useEffect } from 'react';
import { useTranslationContext } from '@/contexts/TranslationContext';

export default function LanguageSwitcher() {
  const { supportedLanguages, userLanguage, setUserLanguage } = useTranslationContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 현재 선택된 언어 찾기
  const currentLanguage = supportedLanguages.find(lang => lang.code === userLanguage) || supportedLanguages[0];

  // 언어 변경 핸들러
  const handleLanguageChange = (langCode: string) => {
    setUserLanguage(langCode);
    setIsOpen(false);
  };

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span>{currentLanguage.name}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 z-10 min-w-[160px] p-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-lg">
          <ul className="py-1">
            {supportedLanguages.map((language) => (
              <li key={language.code}>
                <button
                  className={`w-full text-left px-4 py-2 text-sm ${
                    language.code === userLanguage
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-neutral-100 dark:hover:bg-neutral-700'
                  } rounded-sm transition-colors`}
                  onClick={() => handleLanguageChange(language.code)}
                >
                  {language.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}