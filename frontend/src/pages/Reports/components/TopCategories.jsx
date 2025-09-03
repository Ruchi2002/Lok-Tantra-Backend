import React, { useEffect, useState } from "react";
import { FaRoad, FaTint, FaBolt, FaTrash } from "react-icons/fa";
import { useLanguage } from "../../../context/LanguageContext";
import { translateText } from "../../../utils/translateText";

const categoryStyles = {
  Roads: { icon: <FaRoad className="text-white text-2xl" />, bg: "bg-rose-400" },
  Water: { icon: <FaTint className="text-white text-2xl" />, bg: "bg-teal-500" },
  Electricity: { icon: <FaBolt className="text-white text-2xl" />, bg: "bg-yellow-500" },
  Sanitation: { icon: <FaTrash className="text-white text-2xl" />, bg: "bg-violet-400" },
  Default: { icon: <div className="w-6 h-6 bg-white rounded-full" />, bg: "bg-blue-400" },
};

const getTopCategories = (data) => {
  const count = {};
  data.forEach((item) => {
    const category = item?.properties?.category || "Unknown";
    count[category] = (count[category] || 0) + 1;
  });

  return Object.entries(count)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);
};

const FALLBACK_TRANSLATIONS = {
 ta: {
    Roads: "சாலை",
    Water: "தண்ணீர்",
    Electricity: "மின்சாரம்",
    Sanitation: "மாசுப்படுத்தல்",
    Drainage: "வாழ்வூற்று",
    Unknown: "அறியப்படாதது",
    issues: "பிரச்சனைகள்",
    topCategories: "முக்கிய பிரிவுகள்"
  },
  mr: {
    Roads: "रस्ते",
    Water: "पाणी",
    Electricity: "वीज",
    Sanitation: "स्वच्छता",
    Drainage: "नाली",
    Unknown: "अज्ञात",
    issues: "समस्या",
    topCategories: "शीर्ष श्रेण्या"
  },
  hi: {
    Roads: "सड़कें",
    Water: "पानी",
    Electricity: "बिजली",
    Sanitation: "स्वच्छता",
    Drainage: "जल निकासी",
    Unknown: "अज्ञात",
    issues: "समस्याएँ",
    topCategories: "शीर्ष श्रेणियाँ"
  },
  bn: {
    Roads: "রাস্তা",
    Water: "পানি",
    Electricity: "বিদ্যুৎ",
    Sanitation: "সাফাই",
    Drainage: "নর্দমা",
    Unknown: "অজানা",
    issues: "সমস্যা",
    topCategories: "শীর্ষ বিভাগগুলি"
  }
};

const TopCategories = ({ data }) => {
  const { currentLang } = useLanguage();
  const [translatedCategories, setTranslatedCategories] = useState([]);
  const rawCategories = getTopCategories(data || []);

  useEffect(() => {
    const fetchTranslations = async () => {
      if (currentLang === "en") {
        setTranslatedCategories(
          rawCategories.map((item) => ({ ...item, translatedName: item.name }))
        );
        return;
      }

      if (FALLBACK_TRANSLATIONS[currentLang]) {
        setTranslatedCategories(
          rawCategories.map((item) => ({
            ...item,
            translatedName:
              FALLBACK_TRANSLATIONS[currentLang][item.name] || item.name,
          }))
        );
        return;
      }

      const translated = await Promise.all(
        rawCategories.map(async (item) => {
          const label = await translateText(item.name, currentLang);
          return { ...item, translatedName: label };
        })
      );
      setTranslatedCategories(translated);
    };

    fetchTranslations();
  }, [data, currentLang]);

  const issueLabel = FALLBACK_TRANSLATIONS[currentLang]?.issues || "issues";

  return (
    <div className="bg-white rounded-xl p-4 shadow-md">
      <h2 className="text-lg font-semibold text-[#2E3A59] mb-4">
      {FALLBACK_TRANSLATIONS[currentLang]?.topCategories || "Top Categories"}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
        {translatedCategories.map((item, index) => {
          const { icon, bg } = categoryStyles[item.name] || categoryStyles.Default;

          return (
            <div
              key={index}
              className={`flex items-center justify-between ${bg} font-bold text-white p-4 rounded-xl shadow-sm`}
            >
              <div className="flex items-center gap-3">
                {icon}
                <div className="text-sm font-medium">{item.translatedName}</div>
              </div>
              <div className="text-right text-sm">
                {item.value} {issueLabel}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopCategories;
