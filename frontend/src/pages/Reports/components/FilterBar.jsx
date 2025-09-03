import React, { useEffect, useState, useMemo } from "react";
import { X, Filter, Calendar, MapPin, Tag, Activity, ChevronDown, ChevronUp, Search } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";
import { translateText } from "../../../utils/translateText";

const FALLBACK_TRANSLATIONS = {
  ta: {
    heading: "வடிகட்டி",
    active: "செயல்பாட்டில்",
    quick: "விரைவு",
    clearAll: "அனைத்தையும் அழி",
    fromDate: "தொடக்க தேதி",
    toDate: "இறுதி தேதி",
    area: "பகுதி",
    available: "கிடைக்கின்றன",
    searchAreas: "பகுதிகளைத் தேடு",
    allAreas: "அனைத்து பகுதிகள்",
    searchByArea: "பகுதி மூலம் தேடு",
    category: "வகை",
    searchCategories: "வகைகளைத் தேடு",
    allCategories: "அனைத்து வகைகள்",
    searchByCategory: "வகை மூலம் தேடு",
    status: "நிலை",
    statusOptions: {
      all: "அனைத்தும்",
      pending: "நிலுவையில்",
      resolved: "தீர்க்கப்பட்டது",
      inProgress: "செயல்பாட்டில்",
      rejected: "நிராகரிக்கப்பட்டது"
    },
    activeFilters: "செயல்பாட்டு வடிகட்டிகள்",
    from: "தொடக்கம்",
    to: "இறுதி",
    found: "கண்டறியப்பட்டது",
    totalIssues: "மொத்த பிரச்சினைகள்",
    across: "முழுவதும்",
    areas: "பகுதிகள்",
    in: "இல்",
    categories: "வகைகள்",
    resetAllFilters: "அனைத்து வடிகட்டிகளையும் மீட்டமை",
    quickFilters: {
      last7Days: "கடந்த 7 நாட்கள்",
      last30Days: "கடந்த 30 நாட்கள்",
      thisMonth: "இந்த மாதம்"
    }
  },
  mr: {
    heading: "फिल्टर",
    active: "सक्रिय",
    quick: "जलद",
    clearAll: "सर्व साफ करा",
    fromDate: "पासून दिनांक",
    toDate: "पर्यंत दिनांक",
    area: "क्षेत्र",
    available: "उपलब्ध",
    searchAreas: "क्षेत्रे शोधा",
    allAreas: "सर्व क्षेत्रे",
    searchByArea: "क्षेत्रानुसार शोधा",
    category: "श्रेणी",
    searchCategories: "श्रेणी शोधा",
    allCategories: "सर्व श्रेणी",
    searchByCategory: "श्रेणीनुसार शोधा",
    status: "स्थिती",
    statusOptions: {
      all: "सर्व",
      pending: "प्रलंबित",
      resolved: "निराकरण झाले",
      inProgress: "प्रगतीपथावर",
      rejected: "नाकारले"
    },
    activeFilters: "सक्रिय फिल्टर",
    from: "पासून",
    to: "पर्यंत",
    found: "सापडले",
    totalIssues: "एकूण समस्या",
    across: "मध्ये",
    areas: "क्षेत्रे",
    in: "मध्ये",
    categories: "श्रेणी",
    resetAllFilters: "सर्व फिल्टर रीसेट करा",
    quickFilters: {
      last7Days: "गेले 7 दिवस",
      last30Days: "गेले 30 दिवस",
      thisMonth: "हा महिना"
    }
  },
  hi: {
    heading: "फिल्टर",
    active: "सक्रिय",
    quick: "त्वरित",
    clearAll: "सभी साफ करें",
    fromDate: "प्रारंभ तिथि",
    toDate: "अंत तिथि",
    area: "क्षेत्र",
    available: "उपलब्ध",
    searchAreas: "क्षेत्र खोजें",
    allAreas: "सभी क्षेत्र",
    searchByArea: "क्षेत्र के अनुसार खोजें",
    category: "श्रेणी",
    searchCategories: "श्रेणी खोजें",
    allCategories: "सभी श्रेणी",
    searchByCategory: "श्रेणी के अनुसार खोजें",
    status: "स्थिति",
    statusOptions: {
      all: "सभी",
      pending: "लंबित",
      resolved: "सुलझाया गया",
      inProgress: "प्रगति में",
      rejected: "अस्वीकृत"
    },
    activeFilters: "सक्रिय फिल्टर",
    from: "से",
    to: "तक",
    found: "मिला",
    totalIssues: "कुल समस्याएं",
    across: "में",
    areas: "क्षेत्र",
    in: "में",
    categories: "श्रेणी",
    resetAllFilters: "सभी फिल्टर रीसेट करें",
    quickFilters: {
      last7Days: "पिछले 7 दिन",
      last30Days: "पिछले 30 दिन",
      thisMonth: "इस महीने"
    }
  },
  bn: {
    heading: "ফিল্টার",
    active: "সক্রিয়",
    quick: "দ্রুত",
    clearAll: "সব সাফ করুন",
    fromDate: "শুরুর তারিখ",
    toDate: "শেষ তারিখ",
    area: "এলাকা",
    available: "উপলব্ধ",
    searchAreas: "এলাকা অনুসন্ধান করুন",
    allAreas: "সব এলাকা",
    searchByArea: "এলাকা অনুযায়ী অনুসন্ধান করুন",
    category: "বিভাগ",
    searchCategories: "বিভাগ অনুসন্ধান করুন",
    allCategories: "সব বিভাগ",
    searchByCategory: "বিভাগ অনুযায়ী অনুসন্ধান করুন",
    status: "অবস্থা",
    statusOptions: {
      all: "সব",
      pending: "অপেক্ষমান",
      resolved: "সমাধান করা হয়েছে",
      inProgress: "চলমান",
      rejected: "প্রত্যাখ্যাত"
    },
    activeFilters: "সক্রিয় ফিল্টার",
    from: "থেকে",
    to: "পর্যন্ত",
    found: "পাওয়া গেছে",
    totalIssues: "মোট সমস্যা",
    across: "জুড়ে",
    areas: "এলাকা",
    in: "এ",
    categories: "বিভাগ",
    resetAllFilters: "সব ফিল্টার রিসেট করুন",
    quickFilters: {
      last7Days: "গত ৭ দিন",
      last30Days: "গত ৩০ দিন",
      thisMonth: "এই মাস"
    }
  }
};

const FilterBar = ({ 
  filters = {}, 
  setFilters = () => {}, 
  data = [], 
  onReset = () => {} 
}) => {
  const { currentLang } = useLanguage();
  
  // Translation state
  const [translations, setTranslations] = useState({
    heading: "Filter",
    active: "active",
    quick: "Quick",
    clearAll: "Clear All",
    fromDate: "From Date",
    toDate: "To Date",
    area: "Area",
    available: "available",
    searchAreas: "Search areas",
    allAreas: "All Areas",
    searchByArea: "Search by area",
    category: "Category",
    searchCategories: "Search categories",
    allCategories: "All Categories",
    searchByCategory: "Search by category",
    status: "Status",
    statusOptions: {
      all: "All",
      pending: "Pending",
      resolved: "Resolved",
      inProgress: "In Progress",
      rejected: "Rejected"
    },
    activeFilters: "Active Filters",
    from: "From",
    to: "To",
    found: "Found",
    totalIssues: "total issues",
    across: "across",
    areas: "areas",
    in: "in",
    categories: "categories",
    resetAllFilters: "Reset All Filters",
    quickFilters: {
      last7Days: "Last 7 Days",
      last30Days: "Last 30 Days",
      thisMonth: "This Month"
    }
  });
  
  // Destructure with fallbacks to prevent crash
  const {
    from = "",
    to = "",
    area = "",
    status = "All",
    category = "All",
  } = filters;

  // State for UI management
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchTerms, setSearchTerms] = useState({
    area: "",
    category: ""
  });

  // Load translations
  useEffect(() => {
    const loadTranslations = async () => {
      if (currentLang === "en") {
        return;
      }

      if (FALLBACK_TRANSLATIONS[currentLang]) {
        setTranslations(FALLBACK_TRANSLATIONS[currentLang]);
        return;
      }

      try {
        const translatedTexts = await Promise.all([
          translateText("Filter", currentLang),
          translateText("active", currentLang),
          translateText("Quick", currentLang),
          translateText("Clear All", currentLang),
          translateText("From Date", currentLang),
          translateText("To Date", currentLang),
          translateText("Area", currentLang),
          translateText("available", currentLang),
          translateText("Search areas", currentLang),
          translateText("All Areas", currentLang),
          translateText("Search by area", currentLang),
          translateText("Category", currentLang),
          translateText("Search categories", currentLang),
          translateText("All Categories", currentLang),
          translateText("Search by category", currentLang),
          translateText("Status", currentLang),
          translateText("All", currentLang),
          translateText("Pending", currentLang),
          translateText("Resolved", currentLang),
          translateText("In Progress", currentLang),
          translateText("Rejected", currentLang),
          translateText("Active Filters", currentLang),
          translateText("From", currentLang),
          translateText("To", currentLang),
          translateText("Found", currentLang),
          translateText("total issues", currentLang),
          translateText("across", currentLang),
          translateText("areas", currentLang),
          translateText("in", currentLang),
          translateText("categories", currentLang),
          translateText("Reset All Filters", currentLang),
          translateText("Last 7 Days", currentLang),
          translateText("Last 30 Days", currentLang),
          translateText("This Month", currentLang)
        ]);

        setTranslations({
          heading: translatedTexts[0],
          active: translatedTexts[1],
          quick: translatedTexts[2],
          clearAll: translatedTexts[3],
          fromDate: translatedTexts[4],
          toDate: translatedTexts[5],
          area: translatedTexts[6],
          available: translatedTexts[7],
          searchAreas: translatedTexts[8],
          allAreas: translatedTexts[9],
          searchByArea: translatedTexts[10],
          category: translatedTexts[11],
          searchCategories: translatedTexts[12],
          allCategories: translatedTexts[13],
          searchByCategory: translatedTexts[14],
          status: translatedTexts[15],
          statusOptions: {
            all: translatedTexts[16],
            pending: translatedTexts[17],
            resolved: translatedTexts[18],
            inProgress: translatedTexts[19],
            rejected: translatedTexts[20]
          },
          activeFilters: translatedTexts[21],
          from: translatedTexts[22],
          to: translatedTexts[23],
          found: translatedTexts[24],
          totalIssues: translatedTexts[25],
          across: translatedTexts[26],
          areas: translatedTexts[27],
          in: translatedTexts[28],
          categories: translatedTexts[29],
          resetAllFilters: translatedTexts[30],
          quickFilters: {
            last7Days: translatedTexts[31],
            last30Days: translatedTexts[32],
            thisMonth: translatedTexts[33]
          }
        });
      } catch (error) {
        console.error("Error loading translations:", error);
      }
    };

    loadTranslations();
  }, [currentLang]);

  // Memoized data processing for better performance
  const { availableAreas, availableCategories, statusCounts } = useMemo(() => {
    if (!data || data.length === 0) {
      return { availableAreas: [], availableCategories: [], statusCounts: {} };
    }

    // Extract unique areas
    const areas = [...new Set(
      data
        .map(item => item.properties?.location)
        .filter(location => location && location.trim())
    )].sort();

    // Extract unique categories
    const categories = [...new Set(
      data
        .map(item => item.properties?.category)
        .filter(category => category && category.trim())
    )].sort();

    // Count status occurrences
    const statusCounts = data.reduce((acc, item) => {
      const status = item.properties?.status || "Unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return { availableAreas: areas, availableCategories: categories, statusCounts };
  }, [data]);

  // Filter areas and categories based on search
  const filteredAreas = useMemo(() => {
    if (!searchTerms.area) return availableAreas;
    return availableAreas.filter(area => 
      area.toLowerCase().includes(searchTerms.area.toLowerCase())
    );
  }, [availableAreas, searchTerms.area]);

  const filteredCategories = useMemo(() => {
    if (!searchTerms.category) return availableCategories;
    return availableCategories.filter(category => 
      category.toLowerCase().includes(searchTerms.category.toLowerCase())
    );
  }, [availableCategories, searchTerms.category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearchChange = (field, value) => {
    setSearchTerms(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      from: "",
      to: "",
      area: "",
      status: "All",
      category: "All",
    });
    setSearchTerms({
      area: "",
      category: ""
    });
    if (onReset) onReset();
  };

  const clearIndividualFilter = (filterName) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: filterName === "status" || filterName === "category" ? "All" : "",
    }));
    
    // Clear search terms if clearing area or category
    if (filterName === "area" || filterName === "category") {
      setSearchTerms(prev => ({
        ...prev,
        [filterName]: ""
      }));
    }
  };

  const applyQuickFilter = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Check if any filters are active
  const hasActiveFilters = from || to || area || status !== "All" || category !== "All";
  const activeFilterCount = [from, to, area, status !== "All" ? status : null, category !== "All" ? category : null]
    .filter(Boolean).length;

  // Get today's date for max date input
  const today = new Date().toISOString().split('T')[0];

  // Quick filter presets
  const quickFilters = [
    { label: translations.quickFilters.last7Days, type: "date", value: () => {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      return { from: date.toISOString().split('T')[0], to: today };
    }},
    { label: translations.quickFilters.last30Days, type: "date", value: () => {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      return { from: date.toISOString().split('T')[0], to: today };
    }},
    { label: translations.quickFilters.thisMonth, type: "date", value: () => {
      const date = new Date();
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      return { from: firstDay.toISOString().split('T')[0], to: today };
    }},
  ];

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 transition-all duration-200">
      {/* Header with toggle */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-800">{translations.heading}</h3>
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                {activeFilterCount} {translations.active}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Quick Filters Dropdown */}
          <div className="relative group">
            <button className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1 px-3 py-1 rounded-md hover:bg-gray-100">
              <Calendar className="w-4 h-4" />
              {translations.quick}
            </button>
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
              {quickFilters.map((filter, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const values = filter.value();
                    setFilters(prev => ({ ...prev, ...values }));
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 px-3 py-1 rounded-md hover:bg-red-50"
            >
              <X className="w-4 h-4" />
              {translations.clearAll}
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-gray-100 hover:bg-gray-200 p-2 rounded-md transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Filter Content */}
      <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-none' : 'max-h-0'}`}>
        <div className="p-4 space-y-4">
          {/* Date Range Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4" />
                {translations.fromDate}
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="from"
                  value={from}
                  onChange={handleChange}
                  max={to || today}
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                {from && (
                  <button
                    onClick={() => clearIndividualFilter("from")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4" />
                {translations.toDate}
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="to"
                  value={to}
                  onChange={handleChange}
                  min={from}
                  max={today}
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                {to && (
                  <button
                    onClick={() => clearIndividualFilter("to")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Area and Category Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Area Filter */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <MapPin className="w-4 h-4" />
                {translations.area} ({availableAreas.length} {translations.available})
              </label>
              <div className="relative">
                {availableAreas.length > 0 ? (
                  <div className="space-y-2">
                    {availableAreas.length > 10 && (
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder={translations.searchAreas}
                          value={searchTerms.area}
                          onChange={(e) => handleSearchChange("area", e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}
                    <select
                      name="area"
                      value={area}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">{translations.allAreas}</option>
                      {filteredAreas.map((areaOption) => (
                        <option key={areaOption} value={areaOption}>
                          {areaOption}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <input
                    type="text"
                    name="area"
                    value={area}
                    onChange={handleChange}
                    placeholder={translations.searchByArea}
                    className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                )}
                {area && (
                  <button
                    onClick={() => clearIndividualFilter("area")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Tag className="w-4 h-4" />
                {translations.category} ({availableCategories.length} {translations.available})
              </label>
              <div className="relative">
                {availableCategories.length > 0 ? (
                  <div className="space-y-2">
                    {availableCategories.length > 10 && (
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder={translations.searchCategories}
                          value={searchTerms.category}
                          onChange={(e) => handleSearchChange("category", e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}
                    <select
                      name="category"
                      value={category}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="All">{translations.allCategories}</option>
                      {filteredCategories.map((categoryOption) => (
                        <option key={categoryOption} value={categoryOption}>
                          {categoryOption}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <input
                    type="text"
                    name="category"
                    value={category === "All" ? "" : category}
                    onChange={handleChange}
                    placeholder={translations.searchByCategory}
                    className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                )}
                {category && category !== "All" && (
                  <button
                    onClick={() => clearIndividualFilter("category")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Activity className="w-4 h-4" />
              {translations.status}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {[
                { key: "All", label: translations.statusOptions.all },
                { key: "Pending", label: translations.statusOptions.pending },
                { key: "Resolved", label: translations.statusOptions.resolved },
                { key: "In Progress", label: translations.statusOptions.inProgress },
                { key: "Rejected", label: translations.statusOptions.rejected }
              ].map((statusOption) => (
                <button
                  key={statusOption.key}
                  onClick={() => applyQuickFilter("status", statusOption.key)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    status === statusOption.key
                      ? "bg-blue-100 text-blue-800 border-2 border-blue-300"
                      : "bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200"
                  }`}
                >
                  {statusOption.label}
                  {statusCounts[statusOption.key] && (
                    <span className="ml-2 text-xs bg-white px-1.5 py-0.5 rounded-full">
                      {statusCounts[statusOption.key]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="border-t border-gray-100 p-4 bg-gray-50">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-sm font-medium text-gray-700">{translations.activeFilters}:</span>
              
              {from && (
                <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  <Calendar className="w-3 h-3" />
                  {translations.from} {from}
                  <button
                    onClick={() => clearIndividualFilter("from")}
                    className="ml-1 hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              {to && (
                <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  <Calendar className="w-3 h-3" />
                  {translations.to} {to}
                  <button
                    onClick={() => clearIndividualFilter("to")}
                    className="ml-1 hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              {area && (
                <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  <MapPin className="w-3 h-3" />
                  {area}
                  <button
                    onClick={() => clearIndividualFilter("area")}
                    className="ml-1 hover:text-green-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              {category && category !== "All" && (
                <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  <Tag className="w-3 h-3" />
                  {category}
                  <button
                    onClick={() => clearIndividualFilter("category")}
                    className="ml-1 hover:text-purple-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              {status !== "All" && (
                <div className="flex items-center gap-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                  <Activity className="w-3 h-3" />
                  {translations.statusOptions[status.toLowerCase().replace(' ', '')] || status}
                  <button
                    onClick={() => clearIndividualFilter("status")}
                    className="ml-1 hover:text-orange-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            
            {/* Results Summary */}
            <div className="text-sm text-gray-600 mb-3">
              {translations.found} <span className="font-semibold">{data.length}</span> {translations.totalIssues}
              {availableAreas.length > 0 && (
                <span> {translations.across} <span className="font-semibold">{availableAreas.length}</span> {translations.areas}</span>
              )}
              {availableCategories.length > 0 && (
                <span> {translations.in} <span className="font-semibold">{availableCategories.length}</span> {translations.categories}</span>
              )}
            </div>
            
            {/* Reset All Button */}
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-red-50 border border-red-200"
            >
              <X className="w-4 h-4" />
              {translations.resetAllFilters}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
