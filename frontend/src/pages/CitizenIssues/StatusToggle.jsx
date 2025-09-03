import React, { useState, useEffect, useCallback } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { translateText } from "../../utils/translateText";

const fallbackTranslations = {
  all: { hi: "सभी", ta: "அனைத்தும்", bn: "সব", mr: "सर्व" },
  inProgress: { hi: "प्रगति पर", ta: "முன்னேற்றத்தில்", bn: "চলমান", mr: "प्रगतीत" },
  pending: { hi: "लंबित", ta: "நிலுவையில்", bn: "অপেক্ষমান", mr: "प्रतीक्षेत" },
  resolved: { hi: "समाधान", ta: "தீர்க்கப்பட்ட", bn: "সমাধান", mr: "सोडवले" },
  statusFilter: { hi: "स्थिति फ़िल्टर", ta: "நிலை வடிப்பான்", bn: "অবস্থা ফিল্টার", mr: "स्थिती फिल्टर" },
};

const defaultLabels = {
  all: "All",
  inProgress: "In Progress",
  pending: "Pending",
  resolved: "Resolved",
  statusFilter: "Status Filter",
};

const StatusToggle = ({ selectedStatus, onStatusChange }) => {
  const { currentLang } = useLanguage();
  const [labels, setLabels] = useState(defaultLabels);

  const statusOptions = [
    { value: "All", labelKey: "all", color: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
    { value: "In Progress", labelKey: "inProgress", color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" },
    { value: "Pending", labelKey: "pending", color: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
    { value: "Resolved", labelKey: "resolved", color: "bg-green-100 text-green-700 hover:bg-green-200" },
  ];

  const loadTranslations = useCallback(async () => {
    if (currentLang === "en") {
      setLabels(defaultLabels);
      return;
    }

    const translated = {};
    for (const key in defaultLabels) {
      const fallback = fallbackTranslations[key]?.[currentLang] || defaultLabels[key];
      translated[key] = fallback;

      try {
        const apiTranslation = await translateText(defaultLabels[key], currentLang, fallback);
        if (apiTranslation && apiTranslation !== defaultLabels[key]) {
          translated[key] = apiTranslation;
        }
      } catch (err) {
        console.warn(`Translation failed for ${key}:`, err);
      }
    }
    setLabels(translated);
  }, [currentLang]);

  useEffect(() => {
    loadTranslations();
  }, [loadTranslations]);

  const handleStatusClick = (status) => {
    onStatusChange(status);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700 mb-2 sm:mb-0">
          {labels.statusFilter}
        </h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleStatusClick(option.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedStatus === option.value
                ? `${option.color} ring-2 ring-offset-2 ring-blue-500 shadow-md`
                : `${option.color} hover:shadow-sm`
            }`}
            aria-label={`Filter by ${labels[option.labelKey]} status`}
          >
            {labels[option.labelKey]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StatusToggle;
