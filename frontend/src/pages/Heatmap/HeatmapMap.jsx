import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import dayjs from "dayjs";
import { useLanguage } from "../../context/LanguageContext";
import { translateText } from "../../utils/translateText";
import { useAppData } from '../../context/AppDataContext'; // Import the new hook

const fallbackLabels = {
  en: {
    priority: "Priority",
    status: "Status",
    loadingMap: "Loading map data...", // Added for consistency
    errorLoadingMap: "Error loading map data:", // Added for consistency
  },
  hi: {
    priority: "प्राथमिकता",
    status: "स्थिति",
    loadingMap: "मानचित्र डेटा लोड हो रहा है...",
    errorLoadingMap: "मानचित्र डेटा लोड करने में त्रुटि:",
  },
  ta: {
    priority: "முன்னுரிமை",
    status: "நிலைமை",
    loadingMap: "வரைபடத் தரவு ஏற்றப்படுகிறது...",
    errorLoadingMap: "வரைபடத் தரவை ஏற்றுவதில் பிழை:",
  },
  mr: {
    priority: "प्राधान्य",
    status: "स्थिती",
    loadingMap: "नकाशा डेटा लोड होत आहे...",
    errorLoadingMap: "नकाशा डेटा लोड करताना त्रुटी:",
  },
  bn: {
    priority: "অগ্রাধিকার",
    status: "অবস্থা",
    loadingMap: "মানচিত্র ডেটা লোড হচ্ছে...",
    errorLoadingMap: "মানচিত্র ডেটা লোড করতে ত্রুটি:",
  },
};

// HeatmapMap now receives filter as a prop, and will consume geo data from context
const HeatmapMap = ({ filter }) => {
  // Consume geoJsonData, loading, and error from context
  const { geoJsonData, geoJsonLoading, geoJsonError } = useAppData(); 
  
  const { currentLang } = useLanguage();
  const [labels, setLabels] = useState(fallbackLabels.en);

  // Translation logic for labels
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

  // Determines the color of the circle marker based on priority
  const getColorByPriority = (priority) => {
    switch (priority) {
      case "Urgent":
        return "#ef4444"; // Red
      case "High":
        return "#f97316"; // Orange
      case "Medium":
        return "#facc15"; // Yellow
      case "Low":
        return "#22c55e"; // Green
      default:
        return "#3b82f6"; // Blue fallback
    }
  };

  // Checks if a given date falls within the selected time range filter
  const isWithinTimeRange = (dateString) => {
    if (!filter.timeRange || filter.timeRange === "All") return true;

    const today = dayjs();
    const date = dayjs(dateString);

    switch (filter.timeRange) {
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

  // Filters the geographical features based on current filter settings
  const getFilteredFeatures = () => {
    // Use geoJsonData from context
    if (!geoJsonData || !geoJsonData.features) return [];

    return geoJsonData.features.filter((feature) => {
      const { priority, status, category, date } = feature.properties;

      const matchPriority =
        filter.priority === "All" || filter.priority === priority;
      const matchStatus =
        filter.status === "All" || filter.status === status;
      const matchCategory =
        filter.category === "All" || filter.category === category;
      const matchDate = isWithinTimeRange(date);

      return matchPriority && matchStatus && matchCategory && matchDate;
    });
  };

  const filteredFeatures = getFilteredFeatures();

  // Loading state UI
  if (geoJsonLoading) {
    return (
      <div className="rounded-xl overflow-hidden shadow-md bg-white p-4 text-center text-gray-500 h-[400px] md:h-[600px] flex items-center justify-center">
        {labels.loadingMap}
      </div>
    );
  }

  // Error state UI
  if (geoJsonError) {
    return (
      <div className="rounded-xl overflow-hidden shadow-md bg-red-50 border border-red-200 p-4 text-center text-red-800 h-[400px] md:h-[600px] flex items-center justify-center">
        {labels.errorLoadingMap} {geoJsonError}
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden shadow-md bg-white p-2 w-full"> {/* Added w-full and responsive padding */}
      <MapContainer
        center={[23.2599, 77.4126]} // Center of India
        zoom={5}
        // Responsive height for the map container
        className="rounded-lg z-0 h-[400px] md:h-[600px] w-full" // Set z-index to 0 or a low value
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {filteredFeatures.map((feature, index) => {
          const coords = feature.geometry.coordinates;
          const { location, issue, priority, status } = feature.properties;

          return (
            <CircleMarker
              key={index}
              center={[coords[1], coords[0]]}
              radius={10}
              pathOptions={{
                color: getColorByPriority(priority),
                fillColor: getColorByPriority(priority),
                fillOpacity: 0.8,
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} sticky>
                <div className="text-sm">
                  <strong>{location}</strong>
                  <br />
                  {issue}
                  <br />
                  <span className="text-blue-600">{labels.priority}:</span> {priority}
                  <br />
                  <span className="text-green-600">{labels.status}:</span> {status}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default HeatmapMap;
