import React, { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { translateText } from "../../utils/translateText";

const fallbackLabels = {
  en: {
    send: "📩 Send Confirmation Messages",
    save: "💾 Save Visit Record",
    sentAlert: "✅ Confirmation SMS/WhatsApp sent to selected citizens!",
    savedAlert: "📁 Visit record saved successfully!",
  },
  hi: {
    send: "📩 पुष्टिकरण संदेश भेजें",
    save: "💾 यात्रा रिकॉर्ड सहेजें",
    sentAlert: "✅ चयनित नागरिकों को SMS/WhatsApp पुष्टिकरण भेजा गया!",
    savedAlert: "📁 यात्रा रिकॉर्ड सफलतापूर्वक सहेजा गया!",
  },
  ta: {
    send: "📩 உறுதிப்படுத்தும் செய்திகளை அனுப்பவும்",
    save: "💾 சந்திப்பு பதிவை சேமிக்கவும்",
    sentAlert: "✅ தேர்ந்தெடுக்கப்பட்ட குடிமக்களுக்கு SMS/WhatsApp அனுப்பப்பட்டது!",
    savedAlert: "📁 சந்திப்பு பதிவுகள் வெற்றிகரமாக சேமிக்கப்பட்டன!",
  },
  mr: {
    send: "📩 पुष्टीकरण संदेश पाठवा",
    save: "💾 भेटीचा रेकॉर्ड जतन करा",
    sentAlert: "✅ निवडलेल्या नागरिकांना SMS/WhatsApp पाठवले गेले!",
    savedAlert: "📁 भेटीचा रेकॉर्ड यशस्वीरित्या जतन केला!",
  },
  bn: {
    send: "📩 নিশ্চিতকরণ বার্তা পাঠান",
    save: "💾 ভিজিট রেকর্ড সংরক্ষণ করুন",
    sentAlert: "✅ নির্বাচিত নাগরিকদের SMS/WhatsApp পাঠানো হয়েছে!",
    savedAlert: "📁 ভিজিট রেকর্ড সফলভাবে সংরক্ষিত হয়েছে!",
  },
};

const ActionButtons = ({ onPrint }) => {
  const { currentLang } = useLanguage();
  const [labels, setLabels] = useState(fallbackLabels.en);

  useEffect(() => {
    const loadLabels = async () => {
      if (currentLang === "en" || fallbackLabels[currentLang]) {
        setLabels(fallbackLabels[currentLang] || fallbackLabels.en);
      } else {
        const keys = Object.keys(fallbackLabels.en);
        const translated = await Promise.all(
          keys.map((key) => translateText(fallbackLabels.en[key], currentLang))
        );
        const obj = {};
        keys.forEach((key, i) => (obj[key] = translated[i]));
        setLabels(obj);
      }
    };

    loadLabels();
  }, [currentLang]);

  const handleSendMessages = () => {
    alert(labels.sentAlert);
  };

  const handleSaveVisitRecord = () => {
    alert(labels.savedAlert);
    console.log("✅ Saving visit data (hook this to backend later)");
  };

  return (
    <div className="flex flex-wrap gap-4 justify-end mt-6">
      <button
        onClick={handleSendMessages}
        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition"
      >
        {labels.send}
      </button>

      <button
        onClick={handleSaveVisitRecord}
        className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition"
      >
        {labels.save}
      </button>
    </div>
  );
};

export default ActionButtons;
