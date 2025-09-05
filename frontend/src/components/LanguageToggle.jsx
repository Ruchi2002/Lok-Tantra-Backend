import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';

const LanguageToggle = () => {
  const { currentLang, setCurrentLang } = useLanguage();
  const { t } = useTranslation();

  const handleLanguageChange = () => {
    const newLang = currentLang === 'en' ? 'hi' : 'en';
    setCurrentLang(newLang);
  };

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-medium text-gray-700">
        {t('language')}
      </span>
      
      <button
        onClick={handleLanguageChange}
        className="relative inline-flex h-8 w-16 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:bg-gray-300"
        aria-label={`Switch to ${currentLang === 'en' ? 'Hindi' : 'English'}`}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${
            currentLang === 'hi' ? 'translate-x-8' : 'translate-x-1'
          }`}
        />
        
        {/* Language Labels */}
        <span className={`absolute left-1 text-xs font-medium transition-colors duration-200 ${
          currentLang === 'en' ? 'text-blue-600' : 'text-gray-400'
        }`}>
          EN
        </span>
        <span className={`absolute right-1 text-xs font-medium transition-colors duration-200 ${
          currentLang === 'hi' ? 'text-blue-600' : 'text-gray-400'
        }`}>
          हि
        </span>
      </button>
      
      <span className="text-sm text-gray-500">
        {currentLang === 'en' ? 'English' : 'हिंदी'}
      </span>
    </div>
  );
};

export default LanguageToggle;
