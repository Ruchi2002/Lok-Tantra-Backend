import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import LanguageToggle from './LanguageToggle';

const LanguageExample = () => {
  const { t, tSection, currentLang, isHindi, isEnglish } = useTranslation();
  const tDashboard = tSection('dashboard');

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('language')} {t('system')} {t('example')}
        </h1>
        <LanguageToggle />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Language Info */}
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-900 mb-2">
              {t('currentLanguage')}
            </h2>
            <p className="text-blue-800">
              {isHindi ? 'हिंदी (Hindi)' : 'English (अंग्रेजी)'}
            </p>
            <p className="text-sm text-blue-600 mt-2">
              Language Code: {currentLang}
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-green-900 mb-2">
              {t('features')}
            </h2>
            <ul className="text-green-800 space-y-1">
              <li>• {t('beautifulToggle')}</li>
              <li>• {t('persistentStorage')}</li>
              <li>• {t('easyIntegration')}</li>
              <li>• {t('fallbackSystem')}</li>
            </ul>
          </div>
        </div>

        {/* Right Column - Translation Examples */}
        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-purple-900 mb-2">
              {t('translationExamples')}
            </h2>
            <div className="space-y-2 text-purple-800">
              <p><strong>{t('common')}:</strong> {t('save')}</p>
              <p><strong>{t('dashboard')}:</strong> {tDashboard('dashboard')}</p>
              <p><strong>{t('welcome')}:</strong> {tDashboard('welcome')}</p>
              <p><strong>{t('quickActions')}:</strong> {tDashboard('quickActions')}</p>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-yellow-900 mb-2">
              {t('howToUse')}
            </h2>
            <div className="text-sm text-yellow-800 space-y-1">
              <p>1. {t('importHook')}</p>
              <p>2. {t('useHook')}</p>
              <p>3. {t('addTranslations')}</p>
              <p>4. {t('enjoy')} 🎉</p>
            </div>
          </div>
        </div>
      </div>

      {/* Language-specific content */}
      {isHindi && (
        <div className="mt-6 bg-red-50 p-4 rounded-lg border border-red-200">
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            🎯 हिंदी में विशेष सामग्री
          </h3>
          <p className="text-red-800">
            यह सामग्री केवल हिंदी भाषा में दिखाई देगी। आप अंग्रेजी में स्विच करके 
            अंतर देख सकते हैं।
          </p>
        </div>
      )}

      {isEnglish && (
        <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            🎯 Special Content in English
          </h3>
          <p className="text-blue-800">
            This content will only show in English. You can switch to Hindi to see the difference.
          </p>
        </div>
      )}
    </div>
  );
};

export default LanguageExample;
