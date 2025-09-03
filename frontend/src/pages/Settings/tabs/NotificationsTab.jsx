import React, { useState, useEffect } from 'react';
import { Smartphone, Loader2 } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { translateText } from '../../../utils/translateText';

const ORIGINAL_LABELS = {
  whatsappTitle: "WhatsApp Notifications",
  otherTitle: "Other Notification Preferences",
  enableWhatsapp: "Enable WhatsApp Alerts",
  whatsappDesc: "Receive notifications via WhatsApp for important updates",
  alertTypes: "Alert Types",
  visitReminders: "Visit Reminders",
  urgentIssues: "Urgent Issues",
  dailySummary: "Daily Summary",
  email: "Email Notifications",
  sms: "SMS Notifications",
  push: "Push Notifications",
};

const FALLBACK_TRANSLATIONS = {
  ta: {
    whatsappTitle: "வாட்ஸ்அப் அறிவிப்புகள்",
    otherTitle: "மற்ற அறிவிப்பு விருப்பத்தேர்வுகள்",
    enableWhatsapp: "வாட்ஸ்அப் எச்சரிக்கைகளை இயக்கவும்",
    whatsappDesc: "முக்கிய புதுப்பிப்புகளுக்கான வாட்ஸ்அப்பின் மூலம் அறிவிப்புகளைப் பெறவும்",
    alertTypes: "எச்சரிக்கை வகைகள்",
    visitReminders: "பரிசோதனை நினைவூட்டல்கள்",
    urgentIssues: "அவசர பிரச்சனைகள்",
    dailySummary: "தினசரி சுருக்கம்",
    email: "மின்னஞ்சல் அறிவிப்புகள்",
    sms: "எஸ்எம்எஸ் அறிவிப்புகள்",
    push: "புஷ் அறிவிப்புகள்",
  },
  mr: {
    whatsappTitle: "व्हॉट्सअ‍ॅप सूचना",
    otherTitle: "इतर सूचना प्राधान्ये",
    enableWhatsapp: "व्हॉट्सअ‍ॅप सूचना सक्षम करा",
    whatsappDesc: "महत्त्वाच्या अद्यतनांसाठी व्हॉट्सअ‍ॅपद्वारे सूचना प्राप्त करा",
    alertTypes: "सूचना प्रकार",
    visitReminders: "भेटीच्या आठवणी",
    urgentIssues: "तातडीची प्रकरणे",
    dailySummary: "दैनंदिन सारांश",
    email: "ईमेल सूचना",
    sms: "एसएमएस सूचना",
    push: "पुश सूचना",
  }
};

const NotificationsTab = () => {
  const { currentLang } = useLanguage();
  const [translatedLabels, setTranslatedLabels] = useState(ORIGINAL_LABELS);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState(null);

  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [pushAlerts, setPushAlerts] = useState(true);

  const [subOptions, setSubOptions] = useState({
    visitReminders: true,
    urgentIssues: true,
    dailySummary: false,
  });

  useEffect(() => {
    const fetchTranslations = async () => {
      setTranslationError(null);
      if (currentLang === 'en') {
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
          originalTexts.map(text => translateText(text, 'en', currentLang))
        );

        const updatedLabels = keys.reduce((acc, key, idx) => {
          acc[key] = translations[idx] || ORIGINAL_LABELS[key];
          return acc;
        }, {});

        setTranslatedLabels(updatedLabels);
      } catch (err) {
        setTranslationError(err.message || 'Translation failed');
        setTranslatedLabels(ORIGINAL_LABELS);
      } finally {
        setIsTranslating(false);
      }
    };

    fetchTranslations();
  }, [currentLang]);

  const toggleSubOption = (key) => {
    setSubOptions((prev) => ({ ...prev, [key]: !prev[key] }));
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
          <p className="text-red-600 text-sm">
            Translation failed. Showing original text.
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Smartphone className="mr-2 h-5 w-5" />
          {translatedLabels.whatsappTitle}
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">{translatedLabels.enableWhatsapp}</label>
              <p className="text-sm text-gray-600">{translatedLabels.whatsappDesc}</p>
            </div>
            <button
              onClick={() => setWhatsappAlerts(!whatsappAlerts)}
              disabled={isTranslating}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                whatsappAlerts ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  whatsappAlerts ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {whatsappAlerts && (
            <div className="ml-4 space-y-3 border-l-4 border-green-200 pl-4">
              <label className="block font-medium text-sm text-gray-700 mb-2">
                {translatedLabels.alertTypes}
              </label>
              {Object.entries(subOptions).map(([key, value]) => (
                <div className="flex items-center" key={key}>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => toggleSubOption(key)}
                    disabled={isTranslating}
                    className="mr-2 disabled:opacity-50"
                  />
                  <span className="text-sm">{translatedLabels[key]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">
          {translatedLabels.otherTitle}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>{translatedLabels.email}</span>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={() => setEmailAlerts(!emailAlerts)}
              disabled={isTranslating}
              className="disabled:opacity-50"
            />
          </div>

          <div className="flex items-center justify-between">
            <span>{translatedLabels.sms}</span>
            <input
              type="checkbox"
              checked={smsAlerts}
              onChange={() => setSmsAlerts(!smsAlerts)}
              disabled={isTranslating}
              className="disabled:opacity-50"
            />
          </div>

          <div className="flex items-center justify-between">
            <span>{translatedLabels.push}</span>
            <input
              type="checkbox"
              checked={pushAlerts}
              onChange={() => setPushAlerts(!pushAlerts)}
              disabled={isTranslating}
              className="disabled:opacity-50"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsTab;
