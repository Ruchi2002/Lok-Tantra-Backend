import React, { useEffect, useState } from "react";
import { FaWhatsapp, FaEnvelope, FaLink } from "react-icons/fa";
import { useLanguage } from "../../../context/LanguageContext";
import { translateText } from "../../../utils/translateText";

// 🔁 Static fallbacks
const FALLBACK_TRANSLATIONS = {
  hi: {
    whatsapp: "व्हाट्सएप",
    email: "ईमेल",
    copy: "लिंक कॉपी करें",
    copied: "लिंक क्लिपबोर्ड पर कॉपी हो गया!",
  },
  ta: {
    whatsapp: "வாட்ஸ்அப்",
    email: "மின்னஞ்சல்",
    copy: "இணைப்பை நகலெடு",
    copied: "இணைப்பு நகலெடுக்கப்பட்டது!",
  },
  mr: {
    whatsapp: "व्हॉट्सअॅप",
    email: "ईमेल",
    copy: "लिंक कॉपी करा",
    copied: "लिंक क्लिपबोर्डवर कॉपी झाला!",
  },
  bn: {
    whatsapp: "হোয়াটসঅ্যাপ",
    email: "ইমেইল",
    copy: "লিংক কপি করুন",
    copied: "লিংক ক্লিপবোর্ডে কপি হয়েছে!",
  },
};

const ShareButtons = ({ shareUrl }) => {
  const { currentLang } = useLanguage();
  const url = shareUrl || window.location.href;

  const [labels, setLabels] = useState({
    whatsapp: "WhatsApp",
    email: "Email",
    copy: "Copy Link",
    copied: "Link copied to clipboard!",
  });

  useEffect(() => {
    const translateLabels = async () => {
      if (currentLang === "en") return;

      const fallback = FALLBACK_TRANSLATIONS[currentLang];
      if (fallback) {
        setLabels(fallback);
      } else {
        try {
          const [whatsapp, email, copy, copied] = await Promise.all([
            translateText("WhatsApp", currentLang),
            translateText("Email", currentLang),
            translateText("Copy Link", currentLang),
            translateText("Link copied to clipboard!", currentLang),
          ]);
          setLabels({ whatsapp, email, copy, copied });
        } catch (err) {
          console.error("Translation failed for ShareButtons:", err);
        }
      }
    };

    translateLabels();
  }, [currentLang]);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    alert(labels.copied);
  };

  const handleWhatsAppShare = () => {
    const message = `Check out this report: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleEmailShare = () => {
    const subject = "Smart Politician Report";
    const body = `Hey,\n\nTake a look at this report:\n${url}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  return (
    <div className="flex gap-4 mt-4 flex-wrap">
      <button
        onClick={handleWhatsAppShare}
        className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-all"
      >
        <FaWhatsapp />
        {labels.whatsapp}
      </button>

      <button
        onClick={handleEmailShare}
        className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-all"
      >
        <FaEnvelope />
        {labels.email}
      </button>

      <button
        onClick={handleCopy}
        className="flex items-center gap-2 bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200 transition-all"
      >
        <FaLink />
        {labels.copy}
      </button>
    </div>
  );
};

export default ShareButtons;
