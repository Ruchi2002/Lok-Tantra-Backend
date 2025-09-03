import React, { useState, useEffect } from 'react';
import { Lock, Save, ShieldCheck, Loader2, LogOut } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import {translateText} from '../../../utils/translateText';
import { LogoutButton } from '../../../components/LogoutButton';

// Original English labels
const ORIGINAL_LABELS = {
  // Main sections
  passwordSecurity: "Password & Security",
  twoFactorAuth: "Two-Factor Authentication",
  accountActions: "Account Actions",
  
  // Form labels
  currentPassword: "Current Password",
  newPassword: "New Password",
  confirmPassword: "Confirm Password",
  
  // Placeholders
  currentPasswordPlaceholder: "Enter current password",
  newPasswordPlaceholder: "Enter new password",
  confirmPasswordPlaceholder: "Re-enter new password",
  
  // Buttons
  updatePassword: "Update Password",
  enable2fa: "Enable 2FA",
  logout: "Logout",
  
  // 2FA
  twoFAEnabled: "Enabled",
  twoFADescription: "Add an extra layer of security to your account",
  
  // Logout
  logoutDescription: "Sign out of your account and return to the login page",
  logoutWarning: "This will end your current session",
  
  // Messages
  fillAllFields: "Please fill in all fields",
  passwordMismatch: "Passwords do not match",
  passwordSuccess: "Password updated successfully",
  
  // Loading/Error
  translatingInterface: "Translating interface...",
  translationFailed: "Translation failed. Showing original text.",
};

// Pre-defined translations for better performance
const TRANSLATIONS = {
  hi: {
    passwordSecurity: "पासवर्ड और सुरक्षा",
    twoFactorAuth: "द्विकारक प्रमाणीकरण",
    accountActions: "खाता कार्रवाई",
    currentPassword: "वर्तमान पासवर्ड",
    newPassword: "नया पासवर्ड",
    confirmPassword: "पासवर्ड की पुष्टि करें",
    currentPasswordPlaceholder: "वर्तमान पासवर्ड दर्ज करें",
    newPasswordPlaceholder: "नया पासवर्ड दर्ज करें",
    confirmPasswordPlaceholder: "नया पासवर्ड फिर से दर्ज करें",
    updatePassword: "पासवर्ड अपडेट करें",
    enable2fa: "2FA सक्षम करें",
    logout: "लॉग आउट",
    twoFAEnabled: "सक्षम",
    twoFADescription: "अपने खाते में सुरक्षा की एक अतिरिक्त परत जोड़ें",
    logoutDescription: "अपने खाते से साइन आउट करें और लॉगिन पेज पर वापस जाएं",
    logoutWarning: "यह आपका वर्तमान सेशन समाप्त कर देगा",
    fillAllFields: "कृपया सभी फील्ड भरें",
    passwordMismatch: "पासवर्ड मेल नहीं खाते",
    passwordSuccess: "पासवर्ड सफलतापूर्वक अपडेट किया गया",
    translatingInterface: "इंटरफेस का अनुवाद किया जा रहा है...",
    translationFailed: "अनुवाद विफल हुआ। मूल पाठ दिखाया जा रहा है।",
  },
  bn: {
    passwordSecurity: "পাসওয়ার্ড এবং নিরাপত্তা",
    twoFactorAuth: "দুই-ফ্যাক্টর প্রমাণীকরণ",
    accountActions: "অ্যাকাউন্ট ক্রিয়া",
    currentPassword: "বর্তমান পাসওয়ার্ড",
    newPassword: "নতুন পাসওয়ার্ড",
    confirmPassword: "পাসওয়ার্ড নিশ্চিত করুন",
    currentPasswordPlaceholder: "বর্তমান পাসওয়ার্ড লিখুন",
    newPasswordPlaceholder: "নতুন পাসওয়ার্ড লিখুন",
    confirmPasswordPlaceholder: "নতুন পাসওয়ার্ড আবার লিখুন",
    updatePassword: "পাসওয়ার্ড আপডেট করুন",
    enable2fa: "2FA সক্রিয় করুন",
    logout: "লগআউট",
    twoFAEnabled: "সক্রিয়",
    twoFADescription: "আপনার অ্যাকাউন্টে নিরাপত্তার একটি অতিরিক্ত স্তর যোগ করুন",
    logoutDescription: "আপনার অ্যাকাউন্ট থেকে সাইন আউট করুন এবং লগইন পেজে ফিরে যান",
    logoutWarning: "এটি আপনার বর্তমান সেশন শেষ করবে",
    fillAllFields: "অনুগ্রহ করে সব ক্ষেত্র পূরণ করুন",
    passwordMismatch: "পাসওয়ার্ড মিল নেই",
    passwordSuccess: "পাসওয়ার্ড সফলভাবে আপডেট হয়েছে",
    translatingInterface: "ইন্টারফেস অনুবাদ করা হচ্ছে...",
    translationFailed: "অনুবাদ ব্যর্থ হয়েছে। মূল পাঠ্য দেখানো হচ্ছে।",
  },
  ta: {
    passwordSecurity: "கடவுச்சொல் மற்றும் பாதுகாப்பு",
    twoFactorAuth: "இரு-காரணி அங்கீகாரம்",
    accountActions: "கணக்கு செயல்கள்",
    currentPassword: "தற்போதைய கடவுச்சொல்",
    newPassword: "புதிய கடவுச்சொல்",
    confirmPassword: "கடவுச்சொல்லை உறுதிப்படுத்தவும்",
    currentPasswordPlaceholder: "தற்போதைய கடவுச்சொல்லை உள்ளிடவும்",
    newPasswordPlaceholder: "புதிய கடவுச்சொல்லை உள்ளிடவும்",
    confirmPasswordPlaceholder: "புதிய கடவுச்சொல்லை மீண்டும் உள்ளிடவும்",
    updatePassword: "கடவுச்சொல்லை மேம்படுத்தவும்",
    enable2fa: "2FA ஐ இயக்கவும்",
    logout: "வெளியேறு",
    twoFAEnabled: "இயக்கப்பட்டது",
    twoFADescription: "உங்கள் கணக்கில் பாதுகாப்பின் கூடுதல் அடுக்கை சேர்க்கவும்",
    logoutDescription: "உங்கள் கணக்கிலிருந்து வெளியேறி உள்நுழைவு பக்கத்திற்குத் திரும்பவும்",
    logoutWarning: "இது உங்கள் தற்போதைய அமர்வை முடிவுக்கு கொண்டு வரும்",
    fillAllFields: "அனைத்து புலங்களையும் நிரப்பவும்",
    passwordMismatch: "கடவுச்சொற்கள் பொருந்தவில்லை",
    passwordSuccess: "கடவுச்சொல் வெற்றிகரமாக மேம்படுத்தப்பட்டது",
    translatingInterface: "இடைமுகம் மொழிபெயர்க்கப்படுகிறது...",
    translationFailed: "மொழிபெயர்ப்பு தோல்வியடைந்தது। அசல் உரை காட்டப்படுகிறது।",
  },
  mr: {
    passwordSecurity: "पासवर्ड आणि सुरक्षा",
    twoFactorAuth: "द्विकारक प्रमाणीकरण",
    accountActions: "खाते कृती",
    currentPassword: "सध्याचा पासवर्ड",
    newPassword: "नवीन पासवर्ड",
    confirmPassword: "पासवर्डची पुष्टी करा",
    currentPasswordPlaceholder: "सध्याचा पासवर्ड प्रविष्ट करा",
    newPasswordPlaceholder: "नवीन पासवर्ड प्रविष्ट करा",
    confirmPasswordPlaceholder: "नवीन पासवर्ड पुन्हा प्रविष्ट करा",
    updatePassword: "पासवर्ड अपडेट करा",
    enable2fa: "2FA सक्षम करा",
    logout: "लॉग आउट",
    twoFAEnabled: "सक्षम",
    twoFADescription: "तुमच्या खात्यात सुरक्षिततेचा अतिरिक्त स्तर जोडा",
    logoutDescription: "तुमच्या खात्यातून साइन आउट करा आणि लॉगिन पेजवर परत जा",
    logoutWarning: "हे तुमचा सध्याचा सेशन संपवेल",
    fillAllFields: "कृपया सर्व फील्ड भरा",
    passwordMismatch: "पासवर्ड जुळत नाहीत",
    passwordSuccess: "पासवर्ड यशस्वीरित्या अपडेट केला",
    translatingInterface: "इंटरफेस भाषांतर केले जात आहे...",
    translationFailed: "भाषांतर अयशस्वी. मूळ मजकूर दाखवला जात आहे।",
  }
};

const SecurityTab = () => {
  const { currentLang } = useLanguage();
  const [translatedLabels, setTranslatedLabels] = useState(ORIGINAL_LABELS);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [message, setMessage] = useState('');

  // Translate labels when language changes
  useEffect(() => {
    const fetchTranslations = async () => {
      setTranslationError(null);

      console.log("🌐 Translating security to:", currentLang);

      // If language is English, use original labels
      if (currentLang === "en") {
        setTranslatedLabels(ORIGINAL_LABELS);
        return;
      }

      // If we have pre-defined translations, use them
      if (TRANSLATIONS[currentLang]) {
        console.log(`🌍 Using pre-defined ${currentLang} translations for security`);
        setTranslatedLabels(TRANSLATIONS[currentLang]);
        return;
      }

      // For other languages, use the translation API
      setIsTranslating(true);

      try {
        const keys = Object.keys(ORIGINAL_LABELS);
        const originalTexts = Object.values(ORIGINAL_LABELS);
        
        console.log("🔄 Translating security labels to:", currentLang);
        
        // Translate all texts in parallel
        const translations = await Promise.all(
          originalTexts.map((text) => translateText(text, currentLang))
        );

        console.log("🎯 Security translation results:", translations);

        // Build the translated labels object
        const updatedLabels = keys.reduce((acc, key, idx) => {
          acc[key] = translations[idx] || ORIGINAL_LABELS[key];
          return acc;
        }, {});

        setTranslatedLabels(updatedLabels);
      } catch (err) {
        console.error("Security translation failed:", err);
        setTranslationError(err.message || "Translation failed");
        setTranslatedLabels(ORIGINAL_LABELS);
      } finally {
        setIsTranslating(false);
      }
    };

    fetchTranslations();
  }, [currentLang]);

  const handlePasswordUpdate = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage(translatedLabels.fillAllFields);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage(translatedLabels.passwordMismatch);
      return;
    }

    setMessage(translatedLabels.passwordSuccess);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleToggle2FA = () => {
    setTwoFAEnabled(prev => !prev);
  };

  return (
    <div className="space-y-6">
      {/* Translation loading indicator */}
      {isTranslating && (
        <div className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-md">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600 mr-2" />
          <span className="text-blue-600 text-sm">{translatedLabels.translatingInterface}</span>
        </div>
      )}

      {/* Translation error indicator */}
      {translationError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{translatedLabels.translationFailed}</p>
        </div>
      )}

      {/* Password Update */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Lock className="mr-2 h-5 w-5" />
          {translatedLabels.passwordSecurity}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{translatedLabels.currentPassword}</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={translatedLabels.currentPasswordPlaceholder}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={isTranslating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{translatedLabels.newPassword}</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={translatedLabels.newPasswordPlaceholder}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={isTranslating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{translatedLabels.confirmPassword}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={translatedLabels.confirmPasswordPlaceholder}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={isTranslating}
            />
          </div>

          <button
            onClick={handlePasswordUpdate}
            className={`mt-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center ${isTranslating ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isTranslating}
          >
            <Save className="mr-2 h-4 w-4" />
            {translatedLabels.updatePassword}
          </button>

          {message && (
            <p className="mt-2 text-sm text-green-600">{message}</p>
          )}
        </div>
      </div>

      {/* 2FA Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <ShieldCheck className="mr-2 h-5 w-5" />
          {translatedLabels.twoFactorAuth}
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{translatedLabels.enable2fa}</p>
            <p className="text-sm text-gray-600">{translatedLabels.twoFADescription}</p>
          </div>
          <button
            onClick={handleToggle2FA}
            className={`px-4 py-2 rounded-md text-white ${
              twoFAEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600'
            } ${isTranslating ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isTranslating}
          >
            {twoFAEnabled ? translatedLabels.twoFAEnabled : translatedLabels.enable2fa}
          </button>
        </div>
      </div>

      {/* Logout Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <LogOut className="mr-2 h-5 w-5" />
          {translatedLabels.accountActions}
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{translatedLabels.logout}</p>
            <p className="text-sm text-gray-600">{translatedLabels.logoutDescription}</p>
            <p className="text-xs text-red-600 mt-1">{translatedLabels.logoutWarning}</p>
          </div>
          <LogoutButton 
            className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            {translatedLabels.logout}
          </LogoutButton>
        </div>
      </div>
    </div>
  );
};

export default SecurityTab;