import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

import { churchContent as translations } from '../data/churchContent';

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('site_language') || 'en';
  });
  
  const [isLiveHeroActive, setIsLiveHeroActive] = useState(false);

  useEffect(() => {
    localStorage.setItem('site_language', language);
  }, [language]);

  const t = (key) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLiveHeroActive, setIsLiveHeroActive }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
