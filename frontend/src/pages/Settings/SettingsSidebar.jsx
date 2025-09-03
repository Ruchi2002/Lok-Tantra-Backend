import React, { useEffect, useState } from "react";
import {
  User,
  Bell,
  Settings,
  Users,
  MapPin,
  Lock,
  Loader2,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import {translateText} from "../../utils/translateText";

// Original English labels
const ORIGINAL_LABELS = {
  profile: "Profile",
  notifications: "Notifications",
  preferences: "Preferences",
  users: "Users",
  areas: "Areas",
  security: "Security",
};

// Pre-defined translations for better performance
const TRANSLATIONS = {
  hi: {
    profile: "प्रोफाइल",
    notifications: "सूचनाएं",
    preferences: "प्राथमिकताएं",
    users: "उपयोगकर्ता",
    areas: "क्षेत्र",
    security: "सुरक्षा",
  },
  bn: {
    profile: "প্রোফাইল",
    notifications: "বিজ্ঞপ্তি",
    preferences: "পছন্দসমূহ",
    users: "ব্যবহারকারী",
    areas: "এলাকা",
    security: "নিরাপত্তা",
  },
  ta: {
    profile: "சுயவிவரம்",
    notifications: "அறிவிப்புகள்",
    preferences: "விருப்பங்கள்",
    users: "பயனர்கள்",
    areas: "பகுதிகள்",
    security: "பாதுகாப்பு",
  },
  mr: {
    profile: "प्रोफाइल",
    notifications: "सूचना",
    preferences: "प्राधान्ये",
    users: "वापरकर्ते",
    areas: "क्षेत्रे",
    security: "सुरक्षा",
  }
};

const SettingsSidebar = ({ activeTab, setActiveTab }) => {
  const { currentLang } = useLanguage();
  const [translatedLabels, setTranslatedLabels] = useState(ORIGINAL_LABELS);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState(null);

  useEffect(() => {
    const fetchTranslations = async () => {
      setTranslationError(null);

      console.log("🌐 Translating sidebar to:", currentLang);

      // If language is English, use original labels
      if (currentLang === "en") {
        setTranslatedLabels(ORIGINAL_LABELS);
        return;
      }

      // If we have pre-defined translations, use them
      if (TRANSLATIONS[currentLang]) {
        console.log(`🌍 Using pre-defined ${currentLang} translations for sidebar`);
        setTranslatedLabels(TRANSLATIONS[currentLang]);
        return;
      }

      // For other languages, use the translation API
      setIsTranslating(true);

      try {
        const keys = Object.keys(ORIGINAL_LABELS);
        const originalTexts = Object.values(ORIGINAL_LABELS);
        
        console.log("🔄 Translating sidebar labels to:", currentLang);
        
        // Translate all texts in parallel
        const translations = await Promise.all(
          originalTexts.map((text) => translateText(text, currentLang))
        );

        console.log("🎯 Sidebar translation results:", translations);

        // Build the translated labels object
        const updatedLabels = keys.reduce((acc, key, idx) => {
          acc[key] = translations[idx] || ORIGINAL_LABELS[key];
          return acc;
        }, {});

        setTranslatedLabels(updatedLabels);
      } catch (err) {
        console.error("Sidebar translation failed:", err);
        setTranslationError(err.message || "Translation failed");
        setTranslatedLabels(ORIGINAL_LABELS);
      } finally {
        setIsTranslating(false);
      }
    };

    fetchTranslations();
  }, [currentLang]);

  const tabs = [
    { id: "profile", label: translatedLabels.profile, icon: User },
    { id: "notifications", label: translatedLabels.notifications, icon: Bell },
    { id: "preferences", label: translatedLabels.preferences, icon: Settings },
    { id: "users", label: translatedLabels.users, icon: Users },
    { id: "areas", label: translatedLabels.areas, icon: MapPin },
    { id: "security", label: translatedLabels.security, icon: Lock },
  ];

  return (
    <div className="relative">
      {/* Translation loading indicator */}
      {isTranslating && (
        <div className="absolute top-0 right-0 z-10 p-2">
          <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
        </div>
      )}

      {/* Translation error indicator */}
      {translationError && (
        <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-xs text-red-600">
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

      <nav className="space-y-2">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              disabled={isTranslating}
              className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors disabled:opacity-50 ${
                isActive
                  ? "bg-purple-100 text-purple-700 border-l-4 border-purple-600 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default SettingsSidebar;