import React, { useState, useEffect, useCallback } from "react";
import { Calendar, X } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { translateText } from "../../utils/translateText";

const fallbackTranslations = {
  dateRangeFilter: { hi: "दिनांक रेंज फ़िल्टर", ta: "தேதி வரம்பு வடிப்பான்", bn: "তারিখের পরিসর ফিল্টার", mr: "दिनांक श्रेणी फिल्टर" },
  fromDate: { hi: "प्रारंभ तिथि", ta: "தொடக்க தேதி", bn: "শুরুর তারিখ", mr: "प्रारंभ तारीख" },
  toDate: { hi: "अंतिम तिथि", ta: "இறுதி தேதி", bn: "শেষ তারিখ", mr: "अंतिम तारीख" },
  clear: { hi: "साफ़ करें", ta: "அழிக்க", bn: "মুছুন", mr: "साफ करा" },
  apply: { hi: "लागू करें", ta: "பயன்படுத்து", bn: "প্রয়োগ করুন", mr: "लागू करा" },
};

const defaultLabels = {
  dateRangeFilter: "Date Range Filter",
  fromDate: "From Date",
  toDate: "To Date",
  clear: "Clear",
  apply: "Apply",
};

const DateRangeFilter = ({ onDateRangeChange, initialFromDate = "", initialToDate = "" }) => {
  const { currentLang } = useLanguage();
  const [labels, setLabels] = useState(defaultLabels);
  const [fromDate, setFromDate] = useState(initialFromDate);
  const [toDate, setToDate] = useState(initialToDate);
  const [isExpanded, setIsExpanded] = useState(false);

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

  // Initialize dates when props change
  useEffect(() => {
    setFromDate(initialFromDate);
    setToDate(initialToDate);
  }, [initialFromDate, initialToDate]);

  const handleFromDateChange = (e) => {
    const value = e.target.value;
    setFromDate(value);
    
    // Auto-apply if both dates are set
    if (value && toDate) {
      onDateRangeChange(value, toDate);
    }
  };

  const handleToDateChange = (e) => {
    const value = e.target.value;
    setToDate(value);
    
    // Auto-apply if both dates are set
    if (fromDate && value) {
      onDateRangeChange(fromDate, value);
    }
  };

  const handleApply = () => {
    if (fromDate && toDate) {
      onDateRangeChange(fromDate, toDate);
    }
  };

  const handleClear = () => {
    setFromDate("");
    setToDate("");
    onDateRangeChange("", "");
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Check if any date is set
  const hasDateFilter = fromDate || toDate;

  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Calendar size={16} className="text-blue-600" />
          {labels.dateRangeFilter}
        </h3>
        <button
          onClick={toggleExpanded}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
        >
          {isExpanded ? "Hide" : "Show"}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="from-date" className="block text-sm font-medium text-gray-700 mb-1">
                {labels.fromDate}
              </label>
              <input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={handleFromDateChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                max={toDate || undefined} // Prevent selecting date after 'to date'
              />
            </div>
            <div>
              <label htmlFor="to-date" className="block text-sm font-medium text-gray-700 mb-1">
                {labels.toDate}
              </label>
              <input
                id="to-date"
                type="date"
                value={toDate}
                onChange={handleToDateChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                min={fromDate || undefined} // Prevent selecting date before 'from date'
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleApply}
              disabled={!fromDate || !toDate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {labels.apply}
            </button>
            {hasDateFilter && (
              <button
                onClick={handleClear}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-1"
              >
                <X size={14} />
                {labels.clear}
              </button>
            )}
          </div>

          {hasDateFilter && (
            <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded-lg">
              <strong>Active Filter:</strong> {fromDate} to {toDate}
            </div>
          )}
        </div>
      )}

      {!isExpanded && hasDateFilter && (
        <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded-lg">
          <strong>Active Filter:</strong> {fromDate} to {toDate}
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;
