import React, { useEffect, useState } from 'react';
import SettingsHeader from './SettingsHeader';
import SettingsSidebar from './SettingsSidebar';
import { useLanguage } from '../../context/LanguageContext';
import { translateText } from '../../utils/translateText';

// Import individual tab components
import ProfileTab from './tabs/ProfileTab';
import NotificationsTab from './tabs/NotificationsTab';
import PreferencesTab from './tabs/PreferencesTab';
import UsersTab from './tabs/UsersTab';
import AreasTab from './tabs/AreasTab';
import SecurityTab from './tabs/SecurityTab';

const fallbackLabels = {
  en: {
    profile: "Profile",
    notifications: "Notifications",
    preferences: "Preferences",
    users: "User Management",
    areas: "Constituency Areas",
    security: "Security",
  },
  hi: {
    profile: "प्रोफ़ाइल",
    notifications: "सूचनाएं",
    preferences: "पसंद",
    users: "उपयोगकर्ता प्रबंधन",
    areas: "क्षेत्र",
    security: "सुरक्षा",
  },
  ta: {
    profile: "சுயவிவரம்",
    notifications: "அறிவிப்புகள்",
    preferences: "விருப்பங்கள்",
    users: "பயனர் மேலாண்மை",
    areas: "மாவட்டங்கள்",
    security: "பாதுகாப்பு",
  },
  mr: {
    profile: "प्रोफाइल",
    notifications: "सूचना",
    preferences: "प्राधान्ये",
    users: "वापरकर्ता व्यवस्थापन",
    areas: "मतदारसंघ क्षेत्रे",
    security: "सुरक्षा",
  },
  bn: {
    profile: "প্রোফাইল",
    notifications: "বিজ্ঞপ্তি",
    preferences: "পছন্দসমূহ",
    users: "ব্যবহারকারী পরিচালনা",
    areas: "এলাকা",
    security: "নিরাপত্তা",
  }
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { currentLang } = useLanguage();
  const [tabLabels, setTabLabels] = useState(fallbackLabels.en);

  useEffect(() => {
    const fetchLabels = async () => {
      const fallback = fallbackLabels[currentLang] || fallbackLabels.en;

      if (currentLang === "en" || fallbackLabels[currentLang]) {
        setTabLabels(fallback);
      } else {
        const keys = Object.keys(fallbackLabels.en);
        const translatedEntries = await Promise.all(
          keys.map(async (key) => {
            const translated = await translateText(fallbackLabels.en[key], currentLang);
            return [key, translated];
          })
        );
        setTabLabels(Object.fromEntries(translatedEntries));
      }
    };

    fetchLabels();
  }, [currentLang]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfileTab />;
      case 'notifications': return <NotificationsTab />;
      case 'preferences': return <PreferencesTab />;
      case 'users': return <UsersTab />;
      case 'areas': return <AreasTab />;
      case 'security': return <SecurityTab />;
      default: return <ProfileTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SettingsHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:w-64">
            <SettingsSidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              tabLabels={tabLabels}
            />
          </div>

          {/* Dynamic Tab Content */}
          <div className="flex-1">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
