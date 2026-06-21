'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TranslationDictionary, DICTIONARIES } from './index';

interface LanguageContextProps {
  language: Language;
  dictionary: TranslationDictionary;
  dir: 'ltr' | 'rtl';
  changeLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  // Detect browser language as the initial default
  useEffect(() => {
    // Check local storage first
    const savedLang = localStorage.getItem('asknewton_lang') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'es' || savedLang === 'ar')) {
      setLanguage(savedLang);
      return;
    }

    if (typeof window !== 'undefined' && window.navigator) {
      const browserLang = window.navigator.language || (window.navigator.languages && window.navigator.languages[0]);
      if (browserLang) {
        const primaryCode = browserLang.split('-')[0].toLowerCase();
        if (primaryCode === 'es') {
          setLanguage('es');
        } else if (primaryCode === 'ar') {
          setLanguage('ar');
        } else {
          setLanguage('en');
        }
      }
    }
  }, []);

  // Sync document attribute for direction and language
  useEffect(() => {
    const dir = DICTIONARIES[language].dir;
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language]);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('asknewton_lang', lang);
  };

  const dictionary = DICTIONARIES[language];
  const dir = dictionary.dir;

  return (
    <LanguageContext.Provider value={{ language, dictionary, dir, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
