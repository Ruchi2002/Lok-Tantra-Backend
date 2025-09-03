import React, { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { translateText } from "../../utils/translateText";
import { useGetEligibleCitizenIssuesQuery } from "../../store/api/appApi";

const fallbackLabels = {
  en: {
    location: "Filter by Location",
    assistant: "Filter by Assistant",
    all: "All",
    loading: "Loading filters...",
  },
  hi: {
    location: "स्थान द्वारा फ़िल्टर करें",
    assistant: "सहायक द्वारा फ़िल्टर करें",
    all: "सभी",
    loading: "फ़िल्टर लोड हो रहा है...",
  },
  ta: {
    location: "இடம் மூலம் வடிகட்டு",
    assistant: "உதவியாளர் மூலம் வடிகட்டு",
    all: "அனைத்தும்",
    loading: "வடிகட்டிகள் ஏற்றப்படுகிறது...",
  },
  mr: {
    location: "स्थानानुसार फिल्टर करा",
    assistant: "सहाय्यकानुसार फिल्टर करा",
    all: "सर्व",
    loading: "फिल्टर लोड होत आहेत...",
  },
  bn: {
    location: "অবস্থান অনুযায়ী ফিল্টার",
    assistant: "সহকারী অনুযায়ী ফিল্টার",
    all: "সব",
    loading: "ফিল্টার লোড হচ্ছে...",
  },
};

const FilterBar = ({ onFilterChange }) => {
  const { currentLang } = useLanguage();
  const [labels, setLabels] = useState(fallbackLabels.en);
  const [filters, setFilters] = useState({ location: "", assistant: "" });

  // RTK Query hook
  const { data: issues, isLoading: loading } = useGetEligibleCitizenIssuesQuery();

  // Process locations and assistants from the data
  const locations = ["", ...new Set(issues?.map(issue => issue.location).filter(Boolean) || [])];
  const assistants = ["", ...new Set(issues?.map(issue => issue.assistant_name).filter(Boolean) || [])];

  // 🔠 Load Labels
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
    const updated = { ...filters, [name]: value };
    setFilters(updated);
    if (typeof onFilterChange === "function") onFilterChange(updated);
  };

  if (loading) {
    return <div className="text-gray-500 text-sm py-2">{labels.loading}</div>;
  }

  return (
    <div className="flex flex-wrap gap-4 mb-4 items-center">
      {/* Location Filter */}
      <div>
        <label className="block text-sm text-gray-700 font-medium mb-1">
          {labels.location}
        </label>
        <select
          name="location"
          value={filters.location}
          onChange={handleChange}
          className="border border-gray-300 rounded-md px-3 py-2 w-48"
        >
          <option value="">{labels.all}</option>
          {locations
            .filter((loc) => loc)
            .map((loc, i) => (
              <option key={i} value={loc}>
                {loc}
              </option>
            ))}
        </select>
      </div>

      {/* Assistant Filter */}
      <div>
        <label className="block text-sm text-gray-700 font-medium mb-1">
          {labels.assistant}
        </label>
        <select
          name="assistant"
          value={filters.assistant}
          onChange={handleChange}
          className="border border-gray-300 rounded-md px-3 py-2 w-48"
        >
          <option value="">{labels.all}</option>
          {assistants
            .filter((a) => a)
            .map((a, i) => (
              <option key={i} value={a}>
                {a}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
};

export default FilterBar;
