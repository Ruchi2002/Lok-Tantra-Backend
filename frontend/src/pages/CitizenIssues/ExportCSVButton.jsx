import react, { useEffect, useState, useCallback } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { translateText } from "../../utils/translateText";

const fallbackTranslations = {
  buttonLabel: {
    hi: "रिपोर्ट डाउनलोड करें",
    ta: "அறிக்கையை பதிவிறக்கவும்", 
    bn: "রিপোর্ট ডাউনলোড করুন",
    mr: "अहवाल डाउनलोड करा",
  },
  noDataAlert: {
    hi: "निर्यात करने के लिए कोई डेटा नहीं है!",
    ta: "ஏற்றுமதி செய்ய தரவு இல்லை!",
    bn: "রপ্তানি করার জন্য কোনও ডেটা নেই!",
    mr: "निर्यात करण्यासाठी कोणताही डेटा नाही!",
  },
  exportError: {
    hi: "निर्यात करने में त्रुटि हुई!",
    ta: "ஏற்றுமதியில் பிழை ஏற்பட்டது!",
    bn: "রপ্তানি করতে ত্রুটি হয়েছে!",
    mr: "निर्यात करताना त्रुटी झाली!",
  },
  exporting: {
    hi: "निर्यात हो रहा है...",
    ta: "ஏற்றுமதி செய்யப்படுகிறது...",
    bn: "রপ্তানি হচ্ছে...",
    mr: "निर्यात होत आहे...",
  },
  // Translatable headers
  issueHeader: {
    hi: "समस्या",
    ta: "பிரச்சனை",
    bn: "সমস্যা",
    mr: "समस्या",
  },
  statusHeader: {
    hi: "स्थिति",
    ta: "நிலை",
    bn: "অবস্থা",
    mr: "स्थिती",
  },
  dateHeader: {
    hi: "दिनांक",
    ta: "தேதி",
    bn: "তারিখ",
    mr: "दिनांक",
  },
  priorityHeader: {
    hi: "प्राथमिकता",
    ta: "முன்னுரिमै",
    bn: "অগ্রাধিকার",
    mr: "प्राधान्य",
  },
  locationHeader: {
    hi: "स्थान",
    ta: "இடம்",
    bn: "অবস্থান",
    mr: "स्थान",
  },
  assistantHeader: {
    hi: "सहायक",
    ta: "உதவியாளர்",
    bn: "সহায়ক",
    mr: "सहायक",
  },
};

const defaultLabels = {
  buttonLabel: "Download Report",
  noDataAlert: "No data to export!",
  exportError: "Error occurred while exporting!",
  exporting: "Exporting...",
  issueHeader: "Issue",
  statusHeader: "Status",
  dateHeader: "Date",
  priorityHeader: "Priority",
  locationHeader: "Location",
  assistantHeader: "Assistant",
};

// Utility function to properly escape CSV values
const escapeCSVValue = (value) => {
  if (value === null || value === undefined) return "";
  
  const stringValue = String(value);
  
  // If the value contains comma, quotes, or newlines, wrap in quotes and escape internal quotes
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n") || stringValue.includes("\r")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
};

// Utility function to generate CSV content
const generateCSV = (data, headers) => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("No data to export");
  }

  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.map(escapeCSVValue).join(","));
  
  // Add data rows
  data.forEach((item) => {
    const row = [
      item.issue || "",
      item.status || "",
      item.date || "",
      item.priority || "",
      item.location || "",
      item.assistant || "",
    ];
    csvRows.push(row.map(escapeCSVValue).join(","));
  });
  
  return csvRows.join("\n");
};

// Utility function to download CSV
const downloadCSV = (csvContent, filename) => {
  const BOM = "\uFEFF"; // UTF-8 BOM for better Excel compatibility
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  try {
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    link.style.display = "none";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    // Clean up the URL to prevent memory leaks
    URL.revokeObjectURL(url);
  }
};

const ExportCSVButton = ({ data = [], filename = "citizen-issues.csv" }) => {
  const { currentLang } = useLanguage();
  const [labels, setLabels] = useState(defaultLabels);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  // Load translations
  useEffect(() => {
    const loadTranslations = async () => {
      if (currentLang === "en") {
        setLabels(defaultLabels);
        return;
      }

      const translated = {};
      
      try {
        // Use fallback translations as base
        for (const key in defaultLabels) {
          const fallback = fallbackTranslations[key]?.[currentLang] || defaultLabels[key];
          translated[key] = fallback;
          
          // Optionally enhance with API translation
          try {
            const apiTranslation = await translateText(defaultLabels[key], currentLang, fallback);
            if (apiTranslation && apiTranslation !== defaultLabels[key]) {
              translated[key] = apiTranslation;
            }
          } catch (translationError) {
            console.warn(`Translation failed for ${key}:`, translationError);
            // Keep fallback
          }
        }
      } catch (error) {
        console.error("Translation error:", error);
        // Use fallback translations if everything fails
        for (const key in defaultLabels) {
          translated[key] = fallbackTranslations[key]?.[currentLang] || defaultLabels[key];
        }
      }
      
      setLabels(translated);
    };

    loadTranslations();
  }, [currentLang]);

  // Handle export with proper error handling
  const handleExport = useCallback(async () => {
    if (isExporting) return; // Prevent multiple simultaneous exports
    
    setError(null);
    
    if (!data || data.length === 0) {
      setError(labels.noDataAlert);
      return;
    }

    setIsExporting(true);
    
    try {
      const headers = [
        labels.issueHeader,
        labels.statusHeader,
        labels.dateHeader,
        labels.priorityHeader,
        labels.locationHeader,
        labels.assistantHeader,
      ];
      
      const csvContent = generateCSV(data, headers);
      
      // Add timestamp to filename
      const timestamp = new Date().toISOString().slice(0, 10);
      const timestampedFilename = filename.replace('.csv', `_${timestamp}.csv`);
      
      downloadCSV(csvContent, timestampedFilename);
      
    } catch (error) {
      console.error("Export error:", error);
      setError(labels.exportError);
    } finally {
      setIsExporting(false);
    }
  }, [data, labels, filename, isExporting]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="relative">
      <button
        onClick={handleExport}
        disabled={isExporting || !data || data.length === 0}
        className={`
          px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base rounded transition-all duration-200 w-full sm:w-auto
          ${isExporting || !data || data.length === 0
            ? "bg-gray-400 text-gray-600 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
          }
        `}
        aria-label={isExporting ? labels.exporting : labels.buttonLabel}
        title={!data || data.length === 0 ? labels.noDataAlert : labels.buttonLabel}
      >
        {isExporting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="hidden sm:inline">{labels.exporting}</span>
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="hidden sm:inline">{labels.buttonLabel}</span>
            <span className="sm:hidden">Export</span>
          </span>
        )}
      </button>

      {/* Error Toast */}
      {error && (
        <div className="absolute top-full left-0 right-0 mt-2 z-10">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm">{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900"
                aria-label="Close error"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportCSVButton;