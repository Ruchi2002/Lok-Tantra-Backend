import React, { useState, useEffect } from "react";
import { Search, Filter, X, MapPin, Calendar, User, Tag } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { fallbackTranslations } from "../../utils/fallbackTranslation";
import { useGetIssueCategoriesQuery, useGetAreasQuery, useGetAvailableUsersQuery } from "../../store/api/appApi";

// Transform function moved here since the old API file was deleted
const transformIssueData = (rawIssues) => {
  return rawIssues.map(issue => ({
    id: issue.id,
    title: issue.title || issue.subject || 'No Title',
    description: issue.description || issue.content || 'No Description',
    status: issue.status || 'Open',
    priority: issue.priority || 'Medium',
    category: issue.category || issue.issue_category || 'General',
    location: issue.location || issue.area || 'Unknown',
    reportedBy: issue.reported_by || issue.citizen_name || 'Anonymous',
    reportedDate: issue.reported_date || issue.created_at || new Date().toISOString(),
    assignedTo: issue.assigned_to || issue.assigned_user || 'Unassigned',
    lastUpdated: issue.last_updated || issue.updated_at || issue.created_at,
    coordinates: issue.coordinates || null,
    images: issue.images || [],
    contactInfo: issue.contact_info || {},
    tags: issue.tags || [],
    notes: issue.notes || [],
    followUpDate: issue.follow_up_date || null,
    resolution: issue.resolution || null,
    resolutionDate: issue.resolution_date || null,
    rating: issue.rating || null,
    feedback: issue.feedback || null
  }));
};

const defaultLabels = {
  all: "All",
  open: "Open",
  inProgress: "In Progress",
  urgent: "Urgent",
  pending:"Pending",
  resolved :"Resolved",
  low: "Low",
  medium: "Medium",
  high: "High",
  searchLabel: "Search",
  statusLabel: "Status",
  priorityLabel: "Priority",
  categoryLabel: "Category",
  areaLabel: "Area",
  assistantLabel: "Assistant",
  clearFilters: "Clear all filters",
  searchPlaceholder: "Search...",
};

const FilterBar = ({ filters, onChange }) => {
  const { currentLang } = useLanguage();
  const [labels, setLabels] = useState(defaultLabels);
  const [isLoading, setIsLoading] = useState(false);
  const [translationCache, setTranslationCache] = useState({});
  
  // RTK Query hooks for dynamic filter options
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useGetIssueCategoriesQuery();
  const { data: areas = [], isLoading: areasLoading, error: areasError } = useGetAreasQuery();
  const { data: users = [], isLoading: usersLoading, error: usersError } = useGetAvailableUsersQuery();
  
  const loadingOptions = categoriesLoading || areasLoading || usersLoading;
  const hasErrors = categoriesError || areasError || usersError;

  // Define consistent options with value/label pairs
  const statusOptions = useState(() => [
    { value: "All", labelKey: "all" },
    { value: "Open", labelKey: "open" },
    { value: "In Progress", labelKey: "inProgress" },
    {value:"Pending" , labelKey:"pending"},
    { value: "Resolved", labelKey: "resolved" },
    
  ])[0];

  const priorityOptions = useState(() => [
    { value: "All", labelKey: "all" },
    { value: "Low", labelKey: "low" },
    { value: "Medium", labelKey: "medium" },
    { value: "High", labelKey: "high" },
    { value: "Urgent", labelKey: "urgent" },
  ])[0];

  // Dynamic options from API with fallbacks
  const categoryOptions = useState(() => {
    const options = [{ value: "All", labelKey: "all" }];
    if (Array.isArray(categories) && categories.length > 0) {
      options.push(...categories.map(cat => ({ value: cat.id, label: cat.name })));
    }
    return options;
  })[0];

  const areaOptions = useState(() => {
    const options = [{ value: "All", labelKey: "all" }];
    if (Array.isArray(areas) && areas.length > 0) {
      options.push(...areas.map(area => ({ value: area.id, label: area.name })));
    }
    return options;
  })[0];

  const userOptions = useState(() => {
    const options = [{ value: "All", labelKey: "all" }];
    if (Array.isArray(users) && users.length > 0) {
      options.push(...users.map(user => ({ value: user.id, label: user.name || user.email })));
    }
    return options;
  })[0];

  const getCachedTranslation = (key, lang) => {
    return translationCache[`${key}_${lang}`];
  };

  const setCachedTranslation = (key, lang, translation) => {
    setTranslationCache(prev => ({
      ...prev,
      [`${key}_${lang}`]: translation
    }));
  };

  const loadTranslations = async () => {
    if (currentLang === "en") {
      setLabels(defaultLabels);
      return;
    }

    setIsLoading(true);
    const translated = {};

    try {
      for (const key in defaultLabels) {
        // Check cache first
        const cachedTranslation = getCachedTranslation(key, currentLang);
        if (cachedTranslation) {
          translated[key] = cachedTranslation;
          continue;
        }

        // Use fallback as default
        const fallback = fallbackTranslations[key]?.[currentLang] || defaultLabels[key];
        translated[key] = fallback;

        try {
          // The translateText function is no longer available, so this part will be removed
          // const apiTranslation = await translateText(defaultLabels[key], currentLang, fallback);
          // if (apiTranslation && apiTranslation !== defaultLabels[key]) {
          //   translated[key] = apiTranslation;
          //   setCachedTranslation(key, currentLang, apiTranslation);
          // }
          // For now, we'll just set the fallback as the translation
          translated[key] = fallback;
          setCachedTranslation(key, currentLang, fallback);
        } catch (err) {
          console.warn(`Translation failed for ${key}:`, err);
          // Keep fallback translation
        }
      }

      setLabels(translated);
    } catch (error) {
      console.error('Failed to load translations:', error);
      // Use fallback translations
      const fallbackLabels = {};
      for (const key in defaultLabels) {
        fallbackLabels[key] = fallbackTranslations[key]?.[currentLang] || defaultLabels[key];
      }
      setLabels(fallbackLabels);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTranslations();
  }, [loadTranslations]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value });
  };

  const handleClearFilters = () => {
    onChange({ 
      status: "All", 
      priority: "All", 
      category: "All",
      area: "All",
      assistant: "All",
      search: "" 
    });
  };

  const inputClasses =
    "px-3 py-2 sm:px-4 sm:py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed";

  const hasActiveFilters = filters.status !== "All" || 
    filters.priority !== "All" || 
    filters.category !== "All" ||
    filters.area !== "All" ||
    filters.assistant !== "All" ||
    filters.search !== "";

  // Show error state if API calls fail
  if (hasErrors) {
    return (
      <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl shadow-md mb-4 sm:mb-6">
        <div className="text-center py-8">
          <div className="text-red-500 text-lg mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Filter Options
          </h3>
          <p className="text-gray-600 mb-4">
            Some filter options could not be loaded. Please refresh the page or try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl shadow-md mb-4 sm:mb-6">
      {/* Mobile Layout */}
      <div className="block sm:hidden space-y-4">
        <div>
          <label 
            htmlFor="mobile-search" 
            className="text-gray-600 text-sm mb-1 font-medium block"
          >
            {labels.searchLabel}
          </label>
          <input
            id="mobile-search"
            type="text"
            name="search"
            value={filters.search}
            onChange={handleInputChange}
            placeholder={labels.searchPlaceholder}
            className={`${inputClasses} w-full`}
            disabled={isLoading || loadingOptions}
            aria-label={labels.searchLabel}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label 
              htmlFor="mobile-status" 
              className="text-gray-600 text-sm mb-1 font-medium block"
            >
              {labels.statusLabel}
            </label>
            <select
              id="mobile-status"
              name="status"
              value={filters.status}
              onChange={handleInputChange}
              className={`${inputClasses} w-full bg-white`}
              disabled={isLoading || loadingOptions}
              aria-label={labels.statusLabel}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {labels[option.labelKey]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label 
              htmlFor="mobile-priority" 
              className="text-gray-600 text-sm mb-1 font-medium block"
            >
              {labels.priorityLabel}
            </label>
            <select
              id="mobile-priority"
              name="priority"
              value={filters.priority}
              onChange={handleInputChange}
              className={`${inputClasses} w-full bg-white`}
              disabled={isLoading || loadingOptions}
              aria-label={labels.priorityLabel}
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {labels[option.labelKey]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label 
              htmlFor="mobile-category" 
              className="text-gray-600 text-sm mb-1 font-medium block"
            >
              {labels.categoryLabel}
            </label>
            <select
              id="mobile-category"
              name="category"
              value={filters.category || "All"}
              onChange={handleInputChange}
              className={`${inputClasses} w-full bg-white`}
              disabled={isLoading || loadingOptions}
              aria-label={labels.categoryLabel}
            >
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.labelKey ? labels[option.labelKey] : option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label 
              htmlFor="mobile-area" 
              className="text-gray-600 text-sm mb-1 font-medium block"
            >
              {labels.areaLabel}
            </label>
            <select
              id="mobile-area"
              name="area"
              value={filters.area || "All"}
              onChange={handleInputChange}
              className={`${inputClasses} w-full bg-white`}
              disabled={isLoading || loadingOptions}
              aria-label={labels.areaLabel}
            >
              {areaOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.labelKey ? labels[option.labelKey] : option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label 
            htmlFor="mobile-assistant" 
            className="text-gray-600 text-sm mb-1 font-medium block"
          >
            {labels.assistantLabel}
          </label>
          <select
            id="mobile-assistant"
            name="assistant"
            value={filters.assistant || "All"}
            onChange={handleInputChange}
            className={`${inputClasses} w-full bg-white`}
            disabled={isLoading || loadingOptions}
            aria-label={labels.assistantLabel}
          >
            {userOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.labelKey ? labels[option.labelKey] : option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex flex-wrap gap-4 lg:gap-6 items-end">
        <div className="flex flex-col w-32 sm:w-36 lg:w-40">
          <label 
            htmlFor="desktop-status" 
            className="text-gray-600 text-sm mb-1 font-medium"
          >
            {labels.statusLabel}
          </label>
          <select
            id="desktop-status"
            name="status"
            value={filters.status}
            onChange={handleInputChange}
            className={`${inputClasses} bg-white`}
            disabled={isLoading || loadingOptions}
            aria-label={labels.statusLabel}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {labels[option.labelKey]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col w-32 sm:w-36 lg:w-40">
          <label 
            htmlFor="desktop-priority" 
            className="text-gray-600 text-sm mb-1 font-medium"
          >
            {labels.priorityLabel}
          </label>
          <select
            id="desktop-priority"
            name="priority"
            value={filters.priority}
            onChange={handleInputChange}
            className={`${inputClasses} bg-white`}
            disabled={isLoading || loadingOptions}
            aria-label={labels.priorityLabel}
          >
            {priorityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {labels[option.labelKey]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col w-32 sm:w-36 lg:w-40">
          <label 
            htmlFor="desktop-category" 
            className="text-gray-600 text-sm mb-1 font-medium"
          >
            {labels.categoryLabel}
          </label>
          <select
            id="desktop-category"
            name="category"
            value={filters.category || "All"}
            onChange={handleInputChange}
            className={`${inputClasses} bg-white`}
            disabled={isLoading || loadingOptions}
            aria-label={labels.categoryLabel}
          >
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.labelKey ? labels[option.labelKey] : option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col w-32 sm:w-36 lg:w-40">
          <label 
            htmlFor="desktop-area" 
            className="text-gray-600 text-sm mb-1 font-medium"
          >
            {labels.areaLabel}
          </label>
          <select
            id="desktop-area"
            name="area"
            value={filters.area || "All"}
            onChange={handleInputChange}
            className={`${inputClasses} bg-white`}
            disabled={isLoading || loadingOptions}
            aria-label={labels.areaLabel}
          >
            {areaOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.labelKey ? labels[option.labelKey] : option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col w-32 sm:w-36 lg:w-40">
          <label 
            htmlFor="desktop-assistant" 
            className="text-gray-600 text-sm mb-1 font-medium"
          >
            {labels.assistantLabel}
          </label>
          <select
            id="desktop-assistant"
            name="assistant"
            value={filters.assistant || "All"}
            onChange={handleInputChange}
            className={`${inputClasses} bg-white`}
            disabled={isLoading || loadingOptions}
            aria-label={labels.assistantLabel}
          >
            {userOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.labelKey ? labels[option.labelKey] : option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col flex-1 min-w-[200px] sm:min-w-[220px] lg:min-w-[280px]">
          <label 
            htmlFor="desktop-search" 
            className="text-gray-600 text-sm mb-1 font-medium"
          >
            {labels.searchLabel}
          </label>
          <input
            id="desktop-search"
            type="text"
            name="search"
            value={filters.search}
            onChange={handleInputChange}
            placeholder={labels.searchPlaceholder}
            className={inputClasses}
            disabled={isLoading || loadingOptions}
            aria-label={labels.searchLabel}
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <button
            onClick={handleClearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
            aria-label={labels.clearFilters}
          >
            {labels.clearFilters}
          </button>
        </div>
      )}

      {(isLoading || loadingOptions) && (
        <div className="mt-2 text-xs text-gray-500" role="status" aria-live="polite">
          {isLoading ? "Loading translations..." : "Loading filter options..."}
        </div>
      )}
      
      {/* Show filter options status */}
      <div className="mt-2 text-xs text-gray-500">
        Categories: {categories.length} | Areas: {areas.length} | Users: {users.length}
      </div>
    </div>
  );
};

export default FilterBar;