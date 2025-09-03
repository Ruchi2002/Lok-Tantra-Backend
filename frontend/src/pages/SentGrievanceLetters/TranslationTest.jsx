import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { fallbackTranslations } from '../../utils/fallbackTranslation';

const TranslationTest = () => {
  const { currentLang } = useLanguage();

  const testTranslation = (key) => {
    const translation = fallbackTranslations?.sentGrievanceLetters?.[key]?.[currentLang] ||
                       fallbackTranslations?.sentGrievanceLetters?.[key]?.en ||
                       key;
    return translation;
  };

  return (
    <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
      <h3 className="font-bold mb-2">Translation Test</h3>
      <p>Current Language: {currentLang}</p>
      <p>Fallback Translations Available: {fallbackTranslations ? 'Yes' : 'No'}</p>
      <p>SentGrievanceLetters Available: {fallbackTranslations?.sentGrievanceLetters ? 'Yes' : 'No'}</p>
      <p>Title: {testTranslation('title')}</p>
      <p>Search Placeholder: {testTranslation('searchPlaceholder')}</p>
      <p>All Statuses: {testTranslation('allStatuses')}</p>
      <p>All Priorities: {testTranslation('allPriorities')}</p>
      <p>All Categories: {testTranslation('allCategories')}</p>
      <p>Clear Filters: {testTranslation('clearFilters')}</p>
    </div>
  );
};

export default TranslationTest;
