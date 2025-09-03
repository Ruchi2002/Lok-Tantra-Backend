// contexts/LanguageContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  // Initialize currentLang directly from localStorage using a function
  // This function runs only ONCE during the initial render.
  const [currentLang, setCurrentLangState] = useState(() => {
    const savedLang = localStorage.getItem('selectedLanguage');
    console.log('🌐 Language context initialized (from useState) with:', savedLang || 'en');
    return savedLang || 'en';
  });

  // This useEffect is now only for saving the language when it changes,
  // not for initial loading.
  useEffect(() => {
    localStorage.setItem('selectedLanguage', currentLang);
    console.log('💾 Language preference saved to localStorage:', currentLang);
  }, [currentLang]); // Only run when currentLang changes

  // Save language preference and update state
  const setCurrentLang = (lang) => {
    console.log('🔄 Changing language to:', lang);
    setCurrentLangState(lang);
    // The localStorage.setItem is now handled by the useEffect above.
    // Removed the CustomEvent dispatch as it's redundant with context.
  };

  return (
    <LanguageContext.Provider value={{
      currentLang,
      setCurrentLang
    }}>
      {children}
    </LanguageContext.Provider>
  );
};
