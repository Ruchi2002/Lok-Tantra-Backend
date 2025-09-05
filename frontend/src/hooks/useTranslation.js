import { useLanguage } from '../context/LanguageContext';
import { fallbackTranslations } from '../utils/fallbackTranslation';

export const useTranslation = () => {
  const { currentLang } = useLanguage();

  const t = (key, section = 'common') => {
    // Try to get translation from the specified section
    let translation = fallbackTranslations[section]?.[key]?.[currentLang];
    
    // If not found in section, try common
    if (!translation) {
      translation = fallbackTranslations.common?.[key]?.[currentLang];
    }
    
    // Fallback to English if translation not found
    if (!translation) {
      translation = fallbackTranslations[section]?.[key]?.['en'] || 
                   fallbackTranslations.common?.[key]?.['en'] || 
                   key;
    }
    
    return translation;
  };

  const tSection = (section) => {
    return (key) => t(key, section);
  };

  return {
    t,
    tSection,
    currentLang,
    isHindi: currentLang === 'hi',
    isEnglish: currentLang === 'en'
  };
};
