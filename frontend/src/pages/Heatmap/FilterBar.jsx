import React, { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { translateText } from "../../utils/translateText";

const fallbackLabels = {
  en: {
    priority: "Priority",
    status: "Status",
    category: "Category",
    timeRange: "Time Range",
  },
  hi: {
    priority: "प्राथमिकता",
    status: "स्थिति",
    category: "श्रेणी",
    timeRange: "समय सीमा",
  },
  ta: {
    priority: "முன்னுரிமை",
    status: "நிலை",
    category: "வகை",
    timeRange: "கால வரம்பு",
  },
  mr: {
    priority: "प्राधान्य",
    status: "स्थिती",
    category: "वर्ग",
    timeRange: "कालावधी",
  },
  bn: {
    priority: "অগ্রাধিকার",
    status: "অবস্থা",
    category: "বিভাগ",
    timeRange: "সময়সীমা",
  },
};

const fallbackOptions = {
  en: {},
  hi: {
    All: "सभी",
    Urgent: "अत्यावश्यक",
    High: "उच्च",
    Medium: "मध्यम",
    Low: "निम्न",
    Open: "खुला",
    "In Progress": "चालू",
    Resolved: "सुलझा",
    Pending: "लंबित",
    Committed: "प्रतिबद्ध",
    Roads: "सड़कें",
    Electricity: "बिजली",
    Sanitation: "स्वच्छता",
    Drainage: "जल निकासी",
    Water: "पानी",
    Environment: "पर्यावरण",
    Encroachment: "अतिक्रमण",
    Infrastructure: "बुनियादी ढांचा",
    Health: "स्वास्थ्य",
    Today: "आज",
    "This Week": "इस सप्ताह",
    "This Month": "इस माह",
    "This Year": "इस वर्ष",
  },
  ta: {
    All: "அனைத்தும்",
    Urgent: "அவசரம்",
    High: "உயர்",
    Medium: "மிதமான",
    Low: "குறைந்த",
    Open: "திறந்த",
    "In Progress": "நடப்பில் உள்ளது",
    Resolved: "தீர்வு செய்யப்பட்ட",
    Pending: "நிலுவையில் உள்ளது",
    Committed: "உறுதி",
    Roads: "சாலைகள்",
    Electricity: "மின்சாரம்",
    Sanitation: "பொதுநலன்",
    Drainage: "வாழ்வூற்று",
    Water: "தண்ணீர்",
    Environment: "சுற்றுச்சூழல்",
    Encroachment: "மீறல்",
    Infrastructure: "அடித்தள வசதி",
    Health: "ஆரோக்கியம்",
    Today: "இன்று",
    "This Week": "இந்த வாரம்",
    "This Month": "இந்த மாதம்",
    "This Year": "இந்த ஆண்டு",
  },
  bn: {
  All: "সব",
  Urgent: "জরুরি",
  High: "উচ্চ",
  Medium: "মাঝারি",
  Low: "নিম্ন",
  Open: "খোলা",
  "In Progress": "চলমান",
  Resolved: "সমাধান",
  Pending: "মুলতুবি",
  Committed: "প্রতিশ্রুত",
  Roads: "রাস্তা",
  Electricity: "বিদ্যুৎ",
  Sanitation: "সাফাই",
  Drainage: "নর্দমা",
  Water: "পানি",
  Environment: "পরিবেশ",
  Encroachment: "দখল",
  Infrastructure: "অবকাঠামো",
  Health: "স্বাস্থ্য",
  Today: "আজ",
  "This Week": "এই সপ্তাহ",
  "This Month": "এই মাস",
  "This Year": "এই বছর"
},
mr: {
  All: "सर्व",
  Urgent: "तात्काळ",
  High: "उच्च",
  Medium: "मध्यम",
  Low: "कमी",
  Open: "उघडलेले",
  "In Progress": "चालू आहे",
  Resolved: "निकाल लागले",
  Pending: "प्रलंबित",
  Committed: "प्रतिबद्ध",
  Roads: "रस्ते",
  Electricity: "वीज",
  Sanitation: "स्वच्छता",
  Drainage: "नाली",
  Water: "पाणी",
  Environment: "पर्यावरण",
  Encroachment: "अतिक्रमण",
  Infrastructure: "पायाभूत सुविधा",
  Health: "आरोग्य",
  Today: "आज",
  "This Week": "हा आठवडा",
  "This Month": "हा महिना",
  "This Year": "हे वर्ष"
},

};

const FilterBar = ({ filter, setFilter }) => {
  const { currentLang } = useLanguage();
  const [labels, setLabels] = useState(fallbackLabels.en);
  const translateOption = (text) =>
    fallbackOptions[currentLang]?.[text] || text;

  const priorities = ["All", "Urgent", "High", "Medium", "Low"];
  const statuses = ["All", "Open", "In Progress", "Resolved", "Pending", "Committed"];
  const categories = [
    "All",
    "Roads",
    "Electricity",
    "Sanitation",
    "Drainage",
    "Water",
    "Environment",
    "Encroachment",
    "Infrastructure",
    "Health",
  ];
  const timeRanges = ["All", "Today", "This Week", "This Month", "This Year"];

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="bg-white shadow-sm rounded-xl p-4 flex flex-wrap md:flex-nowrap gap-4 justify-between items-center">
      {/* Priority */}
      <div className="flex flex-col w-full md:w-1/4">
        <label className="text-sm font-medium text-gray-600 mb-1">
          {labels.priority}
        </label>
        <select
          name="priority"
          value={filter.priority}
          onChange={handleChange}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none"
        >
          {priorities.map((p) => (
            <option key={p} value={p}>
              {translateOption(p)}
            </option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div className="flex flex-col w-full md:w-1/4">
        <label className="text-sm font-medium text-gray-600 mb-1">
          {labels.status}
        </label>
        <select
          name="status"
          value={filter.status}
          onChange={handleChange}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {translateOption(s)}
            </option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div className="flex flex-col w-full md:w-1/4">
        <label className="text-sm font-medium text-gray-600 mb-1">
          {labels.category}
        </label>
        <select
          name="category"
          value={filter.category}
          onChange={handleChange}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {translateOption(c)}
            </option>
          ))}
        </select>
      </div>

      {/* Time Range */}
      <div className="flex flex-col w-full md:w-1/4">
        <label className="text-sm font-medium text-gray-600 mb-1">
          {labels.timeRange}
        </label>
        <select
          name="timeRange"
          value={filter.timeRange}
          onChange={handleChange}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none"
        >
          {timeRanges.map((range) => (
            <option key={range} value={range}>
              {translateOption(range)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterBar;
