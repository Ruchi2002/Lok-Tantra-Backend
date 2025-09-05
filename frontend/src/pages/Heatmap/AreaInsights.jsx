import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetCitizenIssuesGeoJsonQuery } from "../../store/api/appApi";
import { useAuth } from "../../hooks/useAuth";
import FilterBar from "./FilterBar";
import HeatmapMap from "./HeatmapMap";
import InsightsPanel from "./InsightsPanel";
import dayjs from "dayjs";
import { useLanguage } from "../../context/LanguageContext";
import { translateText } from "../../utils/translateText";

const fallbackTexts = {
  en: {
    loadingMap: "Loading map...",
  },
  hi: {
    loadingMap: "मानचित्र लोड हो रहा है...",
  },
  ta: {
    loadingMap: "வரைபடம் ஏற்றப்படுகிறது...",
  },
  mr: {
    loadingMap: "नकाशा लोड होत आहे...",
  },
  bn: {
    loadingMap: "মানচিত্র লোড হচ্ছে...",
  },
};

const AreaInsights = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedArea, setSelectedArea] = useState(null);
  const [areaStats, setAreaStats] = useState(null);

  // Use RTK Query hook directly instead of AppDataContext
  const {
    data: geoJsonData,
    isLoading: geoJsonLoading,
    error: geoJsonError,
    refetch: refetchGeoJson
  } = useGetCitizenIssuesGeoJsonQuery(undefined, {
    skip: !isAuthenticated, // Only fetch if authenticated
  });

  const [filter, setFilter] = useState({
    priority: "All",
    status: "All",
    category: "All",
    timeRange: "All",
  });
  const [loadingText, setLoadingText] = useState("Loading map...");

  const { currentLang } = useLanguage();

  // Removed the useEffect that was fetching /CitizenIssues.geojson.json directly
  // useEffect(() => { ... fetchGeo() ... }, []); 

  useEffect(() => {
    const setTranslation = async () => {
      if (currentLang === "en") {
        setLoadingText("Loading map...");
      } else if (fallbackTexts[currentLang]) {
        setLoadingText(fallbackTexts[currentLang].loadingMap);
      } else {
        const translated = await translateText("Loading map...", currentLang);
        setLoadingText(translated);
      }
    };

    setTranslation();
  }, [currentLang]);

  const isWithinTimeRange = (dateString) => {
    const today = dayjs();
    const date = dayjs(dateString);
    const range = filter.timeRange;

    switch (range) {
      case "Today":
        return date.isSame(today, "day");
      case "This Week":
        return date.isSame(today, "week");
      case "This Month":
        return date.isSame(today, "month");
      case "This Year":
        return date.isSame(today, "year");
      default:
        return true;
    }
  };

  // Ensure filteredData handles geoJsonData being null while loading
  const filteredData =
    geoJsonData?.features.filter((feature) => {
      const { priority, status, category, date } = feature.properties;

      const matchPriority =
        filter.priority === "All" || priority === filter.priority;
      const matchStatus =
        filter.status === "All" || status === filter.status;
      const matchCategory =
        filter.category === "All" || category === filter.category;
      const matchDate = isWithinTimeRange(date);

      return matchPriority && matchStatus && matchCategory && matchDate;
    }) ?? []; // Use nullish coalescing to default to empty array if geoJsonData or features is null/undefined

  // Handle loading and error states based on context
  if (geoJsonLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
        {loadingText}
      </div>
    );
  }

  if (geoJsonError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center text-red-800">
        Error loading map data: {geoJsonError}
      </div>
    );
  }

  return (
    <div>
      <h2 className=" font-extrabold text-3xl text-indigo-700 px-10">Area Insights</h2>
    <div className="w-full min-h-screen p-6 bg-[#f8f9fb] flex flex-col xl:flex-row gap-6">
    
      {/* Left Side */}
      <div className="w-full xl:w-[68%] space-y-4">
        <FilterBar filter={filter} setFilter={setFilter} />
        {/* Pass geoData from context to HeatmapMap */}
        <HeatmapMap
          geoData={geoJsonData} 
          filter={filter}
          selectedArea={selectedArea}
          setSelectedArea={setSelectedArea}
        />
      </div>

      {/* Right Side */}
      <div className="w-full xl:w-[32%]">
        <InsightsPanel selectedArea={selectedArea} data={filteredData} />
      </div>
    </div>
    </div>
  );
};

export default AreaInsights;
