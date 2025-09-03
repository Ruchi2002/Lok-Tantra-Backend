import React, { useEffect, useState, useMemo } from "react";
import FilterBar from "./components/FilterBar";
import ReportTypes from "./components/ReportTypes";
import ResolutionChart from "./components/ResolutionChart";
import WorkloadChart from "./components/WorkloadChart";
import TopCategories from "./components/TopCategories";
import ExportButtons from "./components/ExportButtons";
import ShareButtons from "./components/ShareButtons";
import { useLanguage } from "../../context/LanguageContext";
import { translateText } from "../../utils/translateText";
import { useAppData } from '../../context/AppdataContext';

const ORIGINAL_LABELS = {
  heading: "Reports Dashboard",
  subheading: "Visual summary of resolution and workload",
  loading: "Loading data...",
  errorTitle: "Something went wrong!",
  retry: "Retry",
  noData: "No reports match your filters.",
  clearFilters: "Clear Filters",
};

const FALLBACK_TRANSLATIONS = {
  ta: {
    heading: "அறிக்கைகள் டாஷ்போர்டு",
    subheading: "தீர்வுகளும் பணிச்சுமையும் சார்ந்த பார்வை",
    loading: "தரவு ஏற்றப்படுகிறது...",
    errorTitle: "ஏதோ தவறு நடந்தது!",
    retry: "மீண்டும் முயற்சி செய்",
    noData: "உங்கள் வடிகட்டிகளுக்கு பொருந்தும் அறிக்கைகள் இல்லை.",
    clearFilters: "வடிகட்டிகளை அகற்று",
  },
  mr: {
    heading: "अहवाल डॅशबोर्ड",
    subheading: "निराकरण आणि कार्यभाराचा दृश्य सारांश",
    loading: "डेटा लोड केला जात आहे...",
    errorTitle: "काहीतरी चूक झाली!",
    retry: "पुन्हा प्रयत्न करा",
    noData: "आपल्या फिल्टरशी जुळणारे कोणतेही अहवाल नाहीत.",
    clearFilters: "फिल्टर साफ करा",
  },
};

const monthMap = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
};

const Reports = () => {
  const { currentLang } = useLanguage();
  const { geoJsonData, geoJsonLoading, geoJsonError } = useAppData();
  
  const [reportType, setReportType] = useState("Daily");
  const [translatedLabels, setTranslatedLabels] = useState(ORIGINAL_LABELS);
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    area: "",
    status: "All",
    category: "All",
  });

  // Extract geoData from context data with proper error handling
  const geoData = useMemo(() => {
    if (!geoJsonData) return [];
    if (Array.isArray(geoJsonData)) return geoJsonData;
    if (geoJsonData.features && Array.isArray(geoJsonData.features)) {
      return geoJsonData.features;
    }
    return [];
  }, [geoJsonData]);

  // Handle translations
  useEffect(() => {
    const fetchTranslations = async () => {
      if (currentLang === "en") {
        setTranslatedLabels(ORIGINAL_LABELS);
        return;
      }

      if (FALLBACK_TRANSLATIONS[currentLang]) {
        setTranslatedLabels(FALLBACK_TRANSLATIONS[currentLang]);
        return;
      }

      try {
        const keys = Object.keys(ORIGINAL_LABELS);
        const values = Object.values(ORIGINAL_LABELS); 
        const translations = await Promise.all(
          values.map((text) => translateText(text, "en", currentLang))
        );

        const result = keys.reduce((acc, key, idx) => {
          acc[key] = translations[idx] || ORIGINAL_LABELS[key];
          return acc;
        }, {});

        setTranslatedLabels(result);
      } catch (err) {
        console.error("Translation failed:", err);
        setTranslatedLabels(ORIGINAL_LABELS);
      }
    };

    fetchTranslations();
  }, [currentLang]);

  // Improved date parsing function
  const parseDate = (dateString) => {
    if (!dateString) return null;

    try {
      // Handle "DD MMM YYYY" format (e.g., "15 Jan 2024")
      if (dateString.includes(" ")) {
        const parts = dateString.trim().split(/\s+/);
        if (parts.length >= 3) {
          const day = parts[0];
          const monthAbbr = parts[1];
          const year = parts[2];
          
          const month = monthMap[monthAbbr];
          if (month) {
            return new Date(`${year}-${month}-${String(day).padStart(2, '0')}`);
          }
        }
      }
      
      // Handle standard date formats
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    } catch (error) {
      console.warn('Failed to parse date:', dateString, error);
      return null;
    }
  };

  // Memoized filtered data for better performance
  const filteredData = useMemo(() => {
    if (!geoData.length) return [];

    return geoData.filter((item) => {
      const props = item.properties || {};
      
      // Date filtering
      const itemDate = parseDate(props.date);
      const fromDate = filters.from ? new Date(filters.from) : null;
      const toDate = filters.to ? new Date(filters.to) : null;

      if (fromDate && itemDate && itemDate < fromDate) return false;
      if (toDate && itemDate && itemDate > toDate) return false;

      // Area filtering
      if (filters.area?.trim()) {
        const searchArea = filters.area.toLowerCase().trim();
        const itemLocation = (props.location || "").toLowerCase();
        if (!itemLocation.includes(searchArea)) return false;
      }

      // Status filtering
      if (filters.status !== "All" && props.status !== filters.status) return false;

      // Category filtering
      if (filters.category !== "All" && filters.category?.trim()) {
        const searchCategory = filters.category.toLowerCase().trim();
        const itemCategory = (props.category || "").toLowerCase();
        if (!itemCategory.includes(searchCategory)) return false;
      }

      return true;
    });
  }, [geoData, filters]);

  const resetAllFilters = () => {
    setFilters({ 
      from: "", 
      to: "", 
      area: "", 
      status: "All", 
      category: "All" 
    });
  };

  const handleRetry = () => {
    window.location.reload();
  };

  // Loading state
  if (geoJsonLoading) {
    return (
      <div className="px-6 py-4 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{translatedLabels.loading}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (geoJsonError) {
    return (
      <div className="px-6 py-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">{translatedLabels.errorTitle}</h3>
          <p className="text-red-600 mb-4">{geoJsonError}</p>
          <button 
            onClick={handleRetry} 
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            {translatedLabels.retry}
          </button>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="px-6 py-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{translatedLabels.heading}</h1>
          <p className="text-gray-600">{translatedLabels.subheading}</p>
        </div>
        <ShareButtons data={filteredData} />
      </div>

      {/* Filters */}
      <div className="mb-6">
        <FilterBar 
          filters={filters} 
          setFilters={setFilters} 
          data={geoData} 
          onReset={resetAllFilters} 
        />
      </div>

      {/* Report Types */}
      <div className="mb-6">
        <ReportTypes reportType={reportType} setReportType={setReportType} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <ResolutionChart data={filteredData} reportType={reportType} />
        <WorkloadChart data={filteredData} />
      </div>

      {/* Top Categories */}
      <div className="mb-6">
        <TopCategories data={filteredData} />
      </div>

      {/* Export Buttons */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <ExportButtons data={filteredData} />
      </div>

      {/* No Data Message */}
      {filteredData.length === 0 && geoData.length > 0 && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800">
            {translatedLabels.noData}
            <button 
              onClick={resetAllFilters} 
              className="ml-2 text-yellow-600 underline hover:text-yellow-800 transition-colors"
            >
              {translatedLabels.clearFilters}
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;