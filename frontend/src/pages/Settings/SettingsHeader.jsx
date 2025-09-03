import React, { useState, useEffect } from 'react';
import { Settings, Save, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {translateText} from '../../utils/translateText';

// Original English labels
const ORIGINAL_LABELS = {
  title: "Settings",
  saveChanges: "Save Changes",
};

// Pre-defined translations for better performance
const TRANSLATIONS = {
  hi: {
    title: "सेटिंग्स",
    saveChanges: "परिवर्तन सहेजें",
  },
  bn: {
    title: "সেটিংস",
    saveChanges: "পরিবর্তন সংরক্ষণ করুন",
  },
  ta: {
    title: "அமைப்புகள்",
    saveChanges: "மாற்றங்களை சேமிக்கவும்",
  },
  mr: {
    title: "सेटिंग्स",
    saveChanges: "बदल जतन करा",
  }
};

const SettingsHeader = () => {
  const { currentLang } = useLanguage();
  const [translatedLabels, setTranslatedLabels] = useState(ORIGINAL_LABELS);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState(null);

  // Translate labels when language changes
  useEffect(() => {
    const fetchTranslations = async () => {
      setTranslationError(null);

      console.log("🌐 Translating settings header to:", currentLang);

      // If language is English, use original labels
      if (currentLang === "en") {
        setTranslatedLabels(ORIGINAL_LABELS);
        return;
      }

      // If we have pre-defined translations, use them
      if (TRANSLATIONS[currentLang]) {
        console.log(`🌍 Using pre-defined ${currentLang} translations for settings header`);
        setTranslatedLabels(TRANSLATIONS[currentLang]);
        return;
      }

      // For other languages, use the translation API
      setIsTranslating(true);

      try {
        const keys = Object.keys(ORIGINAL_LABELS);
        const originalTexts = Object.values(ORIGINAL_LABELS);
        
        console.log("🔄 Translating settings header labels to:", currentLang);
        
        // Translate all texts in parallel
        const translations = await Promise.all(
          originalTexts.map((text) => translateText(text, currentLang))
        );

        console.log("🎯 Settings header translation results:", translations);

        // Build the translated labels object
        const updatedLabels = keys.reduce((acc, key, idx) => {
          acc[key] = translations[idx] || ORIGINAL_LABELS[key];
          return acc;
        }, {});

        setTranslatedLabels(updatedLabels);
      } catch (err) {
        console.error("Settings header translation failed:", err);
        setTranslationError(err.message || "Translation failed");
        setTranslatedLabels(ORIGINAL_LABELS);
      } finally {
        setIsTranslating(false);
      }
    };

    fetchTranslations();
  }, [currentLang]);

  const handleSave = () => {
    console.log('Settings saved!');
  };

  return (
    <div className="space-y-4">
      {/* Translation loading indicator */}
      {isTranslating && (
        <div className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-md">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600 mr-2" />
          <span className="text-blue-600 text-sm">Translating interface...</span>
        </div>
      )}

      {/* Translation error indicator */}
      {translationError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">
            {currentLang === "hi"
              ? "अनुवाद विफल हुआ। मूल पाठ दिखाया जा रहा है।"
              : currentLang === "bn"
              ? "অনুবাদ ব্যর্থ হয়েছে। মূল পাঠ্য দেখানো হচ্ছে।"
              : currentLang === "ta"
              ? "மொழிபெயர்ப்பு தோல்வியடைந்தது. அசல் உரை காட்டப்படுகிறது."
              : currentLang === "mr"
              ? "भाषांतर अयशस्वी. मूळ मजकूर दाखवला जात आहे."
              : "Translation failed. Showing original text."}
          </p>
        </div>
      )}

      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Title */}
            <div className="flex items-center">
              <Settings className="h-6 w-6 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                {translatedLabels.title}
              </h1>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className={`flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition ${isTranslating ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isTranslating}
            >
              <Save className="mr-2 h-4 w-4" />
              {translatedLabels.saveChanges}
            </button>
          </div>
        </div>
      </header>
    </div>
  );
};

export default SettingsHeader;