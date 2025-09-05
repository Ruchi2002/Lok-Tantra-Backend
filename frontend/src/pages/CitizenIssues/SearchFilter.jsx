import React, { useState, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { translateText } from "../../utils/translateText";

const fallbackTranslations = {
  searchFilter: { hi: "खोज फ़िल्टर", ta: "தேடல் வடிப்பான்", bn: "অনুসন্ধান ফিল্টার", mr: "शोध फिल्टर" },
  searchPlaceholder: { hi: "शीर्षक, विवरण, स्थान या श्रेणी द्वारा खोजें...", ta: "தலைப்பு, விளக்கம், இடம் அல்லது வகை மூலம் தேடு...", bn: "শিরোনাম, বিবরণ, অবস্থান বা বিভাগ দ্বারা অনুসন্ধান করুন...", mr: "शीर्षक, वर्णन, स्थान किंवा श्रेणीद्वारे शोधा..." },
  clear: { hi: "साफ़ करें", ta: "அழிக்க", bn: "মুছুন", mr: "साफ करा" },
  searchResults: { hi: "खोज परिणाम", ta: "தேடல் முடிவுகள்", bn: "অনুসন্ধানের ফলাফল", mr: "शोध परिणाम" },
  noResults: { hi: "कोई परिणाम नहीं मिला", ta: "முடிவுகள் இல்லை", bn: "কোন ফলাফল নেই", mr: "परिणाम नाहीत" },
};

const defaultLabels = {
  searchFilter: "Search Filter",
  searchPlaceholder: "Search by title, description, location, or category...",
  clear: "Clear",
  searchResults: "Search Results",
  noResults: "No results found",
};

const SearchFilter = ({ onSearchChange, initialSearchTerm = "", searchResultsCount = 0 }) => {
  const { currentLang } = useLanguage();
  const [labels, setLabels] = useState(defaultLabels);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
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

  // Initialize search term when props change
  useEffect(() => {
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Debounce search - only trigger after user stops typing
    const timeoutId = setTimeout(() => {
      onSearchChange(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleClear = () => {
    setSearchTerm("");
    onSearchChange("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onSearchChange(searchTerm);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Check if search is active
  const hasSearchFilter = searchTerm.trim().length > 0;

  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Search size={16} className="text-green-600" />
          {labels.searchFilter}
        </h3>
        <button
          onClick={toggleExpanded}
          className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors"
        >
          {isExpanded ? "Hide" : "Show"}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              placeholder={labels.searchPlaceholder}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 pl-10 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            {hasSearchFilter && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                title={labels.clear}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {hasSearchFilter && (
            <div className="text-xs text-gray-600 bg-green-50 p-2 rounded-lg">
              <strong>{labels.searchResults}:</strong> {searchResultsCount} {searchResultsCount === 1 ? 'result' : 'results'} found for "{searchTerm}"
            </div>
          )}

          {hasSearchFilter && searchResultsCount === 0 && (
            <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded-lg">
              {labels.noResults} for "{searchTerm}"
            </div>
          )}
        </div>
      )}

      {!isExpanded && hasSearchFilter && (
        <div className="text-xs text-gray-600 bg-green-50 p-2 rounded-lg">
          <strong>Active Search:</strong> "{searchTerm}" ({searchResultsCount} results)
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
