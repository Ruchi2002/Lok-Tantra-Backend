import React, { useState, useEffect } from "react";
import { useLanguage } from "../../../context/LanguageContext";
import {translateText} from "../../../utils/translateText";

const PREDEFINED_LABELS = {
  en: {
    daily: "Daily",
    monthly: "Monthly",
  },
  hi: {
    daily: "दैनिक",
    monthly: "मासिक",
  },
  bn: {
    daily: "দৈনিক",
    monthly: "মাসিক",
  },
  ta: {
    daily: "தினசரி",
    monthly: "மாதாந்திர",
  },
  mr: {
    daily: "दैनिक",
    monthly: "मासिक",
  },
};

const ReportTypes = ({ reportType, setReportType }) => {
  const { currentLang } = useLanguage();
  const [labels, setLabels] = useState(PREDEFINED_LABELS.en);
  const [isTranslating, setIsTranslating] = useState(false);

  const keys = ["daily", "monthly"];

  useEffect(() => {
    const updateLabels = async () => {
      if (currentLang === "en") {
        setLabels(PREDEFINED_LABELS.en);
        return;
      }

      if (PREDEFINED_LABELS[currentLang]) {
        setLabels(PREDEFINED_LABELS[currentLang]);
        return;
      }

      setIsTranslating(true);

      try {
        const translated = await Promise.all(
          keys.map((key) => translateText(PREDEFINED_LABELS.en[key], currentLang))
        );

        const newLabels = keys.reduce((acc, key, idx) => {
          acc[key] = translated[idx] || PREDEFINED_LABELS.en[key];
          return acc;
        }, {});

        setLabels(newLabels);
      } catch (err) {
        console.error("ReportTypes translation failed:", err);
        setLabels(PREDEFINED_LABELS.en);
      } finally {
        setIsTranslating(false);
      }
    };

    updateLabels();
  }, [currentLang]);

  const reportOptions = [
    { label: "daily", value: "Daily" },
    { label: "monthly", value: "Monthly" },
  ];

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {reportOptions.map(({ label, value }) => (
        <button
          key={value}
          type="button"
          role="button"
          aria-pressed={reportType === value}
          onClick={() => setReportType(value)}
          disabled={isTranslating}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            reportType === value
              ? "bg-green-600 text-white shadow-md"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          } ${isTranslating ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {labels[label]}
        </button>
      ))}
    </div>
  );
};

export default ReportTypes;
