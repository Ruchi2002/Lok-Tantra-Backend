import React, { useState, useEffect } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { translateText } from '../../../utils/translateText';

const ORIGINAL_LABELS = {
  title: "Profile Settings",
  photoLabel: "Profile Photo",
  photoDesc: "Click to upload or drag and drop",
  photoSubtext: "SVG, PNG, JPG or GIF (max. 800x400px)",
  logoLabel: "Organization Logo",
  logoDesc: "Click to upload or drag and drop",
  logoSubtext: "SVG, PNG, JPG or GIF (max. 800x400px)",
  chooseFile: "Choose File",
};

const FALLBACK_TRANSLATIONS = {
  hi: {
    title: "प्रोफ़ाइल सेटिंग्स",
    photoLabel: "प्रोफ़ाइल फ़ोटो",
    photoDesc: "अपलोड करने के लिए क्लिक करें या ड्रैग और ड्रॉप करें",
    photoSubtext: "SVG, PNG, JPG या GIF (अधिकतम 800x400px)",
    logoLabel: "संगठन का लोगो",
    logoDesc: "अपलोड करने के लिए क्लिक करें या ड्रैग और ड्रॉप करें",
    logoSubtext: "SVG, PNG, JPG या GIF (अधिकतम 800x400px)",
    chooseFile: "फ़ाइल चुनें"
  },
  bn: {
    title: "প্রোফাইল সেটিংস",
    photoLabel: "প্রোফাইল ছবি",
    photoDesc: "আপলোড করতে ক্লিক করুন বা ড্র্যাগ এবং ড্রপ করুন",
    photoSubtext: "SVG, PNG, JPG বা GIF (সর্বোচ্চ 800x400px)",
    logoLabel: "সংস্থার লোগো",
    logoDesc: "আপলোড করতে ক্লিক করুন বা ড্র্যাগ এবং ড্রপ করুন",
    logoSubtext: "SVG, PNG, JPG বা GIF (সর্বোচ্চ 800x400px)",
    chooseFile: "ফাইল নির্বাচন করুন"
  },
  ta: {
    title: "சுயவிவர அமைப்புகள்",
    photoLabel: "சுயவிவர புகைப்படம்",
    photoDesc: "பதிவேற்ற கிளிக் செய்யவும் அல்லது இழுத்து விடவும்",
    photoSubtext: "SVG, PNG, JPG அல்லது GIF (அதிகபட்சம் 800x400px)",
    logoLabel: "அமைப்பின் லோகோ",
    logoDesc: "பதிவேற்ற கிளிக் செய்யவும் அல்லது இழுத்து விடவும்",
    logoSubtext: "SVG, PNG, JPG அல்லது GIF (அதிகபட்சம் 800x400px)",
    chooseFile: "கோப்பை தேர்வுசெய்க"
  },
  mr: {
    title: "प्रोफाइल सेटिंग्ज",
    photoLabel: "प्रोफाइल फोटो",
    photoDesc: "अपलोड करण्यासाठी क्लिक करा किंवा ड्रॅग आणि ड्रॉप करा",
    photoSubtext: "SVG, PNG, JPG किंवा GIF (कमाल 800x400px)",
    logoLabel: "संस्थेचा लोगो",
    logoDesc: "अपलोड करण्यासाठी क्लिक करा किंवा ड्रॅग आणि ड्रॉप करा",
    logoSubtext: "SVG, PNG, JPG किंवा GIF (कमाल 800x400px)",
    chooseFile: "फाईल निवडा"
  }
};

const UploadBox = ({ labelKey, descriptionKey, subtextKey, translatedLabels, isTranslating }) => {
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{translatedLabels[labelKey]}</label>
      <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="mx-auto h-32 w-32 rounded-full object-cover mb-4 border"
          />
        ) : (
          <>
            <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-2">{translatedLabels[descriptionKey]}</p>
            <p className="text-xs text-gray-500">{translatedLabels[subtextKey]}</p>
          </>
        )}
        <label className={`mt-3 inline-block px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-700 cursor-pointer transition-colors ${isTranslating ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {translatedLabels.chooseFile}
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
            disabled={isTranslating}
          />
        </label>
      </div>
    </div>
  );
};

const ProfileTab = () => {
  const { currentLang } = useLanguage();
  const [translatedLabels, setTranslatedLabels] = useState(ORIGINAL_LABELS);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState(null);

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
          originalTexts.map((text) => translateText(text, 'en', currentLang))
        );

        const updatedLabels = keys.reduce((acc, key, idx) => {
          acc[key] = translations[idx] || ORIGINAL_LABELS[key];
          return acc;
        }, {});

        setTranslatedLabels(updatedLabels);
      } catch (err) {
        console.error("❌ Translation failed:", err);
        setTranslationError(err.message || 'Translation failed');
        setTranslatedLabels(FALLBACK_TRANSLATIONS['en'] || ORIGINAL_LABELS);
      } finally {
        setIsTranslating(false);
      }
    };

    fetchTranslations();
  }, [currentLang]);

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
          <Camera className="mr-2 h-5 w-5" />
          {translatedLabels.title}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UploadBox
            labelKey="photoLabel"
            descriptionKey="photoDesc"
            subtextKey="photoSubtext"
            translatedLabels={translatedLabels}
            isTranslating={isTranslating}
          />
          <UploadBox
            labelKey="logoLabel"
            descriptionKey="logoDesc"
            subtextKey="logoSubtext"
            translatedLabels={translatedLabels}
            isTranslating={isTranslating}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
