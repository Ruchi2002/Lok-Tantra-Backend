import React, { useState, useEffect } from 'react';
import { Globe, Loader2 } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { translateText } from '../../../utils/translateText';

const ORIGINAL_LABELS = {
  languageAndRegionalSettings: "Language & Regional Settings",
  defaultVisitSettings: "Default Visit Settings",
  primaryLanguage: "Primary Language",
  dateFormat: "Date Format",
  defaultVisitDuration: "Default Visit Duration",
  preparationTime: "Preparation Time",
  english: "English",
  hindi: "हिंदी (Hindi)",
  bengali: "বাংলা (Bengali)",
  tamil: "தமிழ் (Tamil)",
  marathi: "मराठी (Marathi)",
  "15min": "15 minutes",
  "30min": "30 minutes",
  "1hour": "1 hour",
  "2hours": "2 hours",
  halfDay: "Half day",
  fullDay: "Full day",
};

const FALLBACK_TRANSLATIONS = {
  ta: {
    languageAndRegionalSettings: "மொழி மற்றும் பிராந்திய அமைப்புகள்",
    defaultVisitSettings: "இயல்புநிலை வருகை அமைப்புகள்",
    primaryLanguage: "முதன்மை மொழி",
    dateFormat: "தேதி வடிவம்",
    defaultVisitDuration: "இயல்புநிலை வருகை கால அளவு",
    preparationTime: "தயாரிப்பு நேரம்",
    english: "ஆங்கிலம்",
    hindi: "இந்தி",
    bengali: "பெங்காலி",
    tamil: "தமிழ்",
    marathi: "மராத்தி",
    "15min": "15 நிமிடங்கள்",
    "30min": "30 நிமிடங்கள்",
    "1hour": "1 மணி நேரம்",
    "2hours": "2 மணி நேரம்",
    halfDay: "அரை நாள்",
    fullDay: "முழு நாள்",
  },
  mr: {
    languageAndRegionalSettings: "भाषा आणि प्रादेशिक सेटिंग्ज",
    defaultVisitSettings: "मूलभूत भेट सेटिंग्ज",
    primaryLanguage: "प्राथमिक भाषा",
    dateFormat: "दिनांक प्रारूप",
    defaultVisitDuration: "मूलभूत भेट कालावधी",
    preparationTime: "तयारीची वेळ",
    english: "इंग्रजी",
    hindi: "हिंदी",
    bengali: "बंगाली",
    tamil: "तमिळ",
    marathi: "मराठी",
    "15min": "15 मिनिटे",
    "30min": "30 मिनिटे",
    "1hour": "1 तास",
    "2hours": "2 तास",
    halfDay: "अर्धा दिवस",
    fullDay: "पूर्ण दिवस",
  }
};

const PreferencesTab = () => {
  const { currentLang, setCurrentLang } = useLanguage();
  const [translatedLabels, setTranslatedLabels] = useState(ORIGINAL_LABELS);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState(null);

  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [visitDuration, setVisitDuration] = useState('1 hour');
  const [prepTime, setPrepTime] = useState('30 minutes');

  useEffect(() => {
    const fetchTranslations = async () => {
      setTranslationError(null);
      if (currentLang === "en") {
        setTranslatedLabels(ORIGINAL_LABELS);
        return;
      }
      if (FALLBACK_TRANSLATIONS[currentLang]) {
        setTranslatedLabels(FALLBACK_TRANSLATIONS[currentLang]);
        return;
      }

      setIsTranslating(true);
      try {
        const keys = Object.keys(ORIGINAL_LABELS);
        const originalTexts = Object.values(ORIGINAL_LABELS);

        const translations = await Promise.all(
          originalTexts.map((text) => translateText(text, "en", currentLang))
        );

        const updatedLabels = keys.reduce((acc, key, idx) => {
          acc[key] = translations[idx] || ORIGINAL_LABELS[key];
          return acc;
        }, {});

        setTranslatedLabels(updatedLabels);
      } catch (err) {
        setTranslationError(err.message || "Translation failed");
        setTranslatedLabels(ORIGINAL_LABELS);
      } finally {
        setIsTranslating(false);
      }
    };

    fetchTranslations();
  }, [currentLang]);

  const handleLanguageChange = (e) => {
    setCurrentLang(e.target.value);
  };

  return (
    <div className="space-y-6">
      {isTranslating && (
        <div className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-md">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600 mr-2" />
          <span className="text-blue-600 text-sm">Translating interface...</span>
        </div>
      )}

      {translationError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">Translation failed. Showing original text.</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Globe className="mr-2 h-5 w-5" />
          {translatedLabels.languageAndRegionalSettings}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              {translatedLabels.primaryLanguage}
            </label>
            <select
              value={currentLang}
              onChange={handleLanguageChange}
              disabled={isTranslating}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="en">{translatedLabels.english}</option>
              <option value="hi">{translatedLabels.hindi}</option>
              <option value="bn">{translatedLabels.bengali}</option>
              <option value="ta">{translatedLabels.tamil}</option>
              <option value="mr">{translatedLabels.marathi}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {translatedLabels.dateFormat}
            </label>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              disabled={isTranslating}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">
          {translatedLabels.defaultVisitSettings}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              {translatedLabels.defaultVisitDuration}
            </label>
            <select
              value={visitDuration}
              onChange={(e) => setVisitDuration(e.target.value)}
              disabled={isTranslating}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="30 minutes">{translatedLabels["30min"]}</option>
              <option value="1 hour">{translatedLabels["1hour"]}</option>
              <option value="2 hours">{translatedLabels["2hours"]}</option>
              <option value="Half day">{translatedLabels.halfDay}</option>
              <option value="Full day">{translatedLabels.fullDay}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {translatedLabels.preparationTime}
            </label>
            <select
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              disabled={isTranslating}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="15 minutes">{translatedLabels["15min"]}</option>
              <option value="30 minutes">{translatedLabels["30min"]}</option>
              <option value="1 hour">{translatedLabels["1hour"]}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesTab;
