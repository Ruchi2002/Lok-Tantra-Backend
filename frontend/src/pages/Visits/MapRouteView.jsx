import React, { useEffect, useRef, useState, useMemo } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { translateText } from "../../utils/translateText";
import Select from "react-select";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAppData } from '../../context/AppDataContext'; // Import the new hook

const fallbackLabels = {
  en: {
    placeholder: "Filter by Assistant",
    route: "'s Route",
    loadingMap: "Loading map data...",
    errorLoadingMap: "Error loading map data:"
  },
  hi: {
    placeholder: "सहायक द्वारा फ़िल्टर करें",
    route: " का मार्ग",
    loadingMap: "मानचित्र डेटा लोड हो रहा है...",
    errorLoadingMap: "मानचित्र डेटा लोड करने में त्रुटि:"
  },
  ta: {
    placeholder: "உதவியாளர் மூலம் வடிகட்டுக",
    route: " இன் பாதை",
    loadingMap: "வரைபடத் தரவு ஏற்றப்படுகிறது...",
    errorLoadingMap: "வரைபடத் தரவை ஏற்றுவதில் பிழை:"
  },
  mr: {
    placeholder: "सहाय्यकानुसार फिल्टर करा",
    route: " यांचा मार्ग",
    loadingMap: "नकाशा डेटा लोड होत आहे...",
    errorLoadingMap: "नकाशा डेटा लोड करताना त्रुटी:"
  },
  bn: {
    placeholder: "সহকারী দ্বারা ফিল্টার করুন",
    route: " এর রুট",
    loadingMap: "মানচিত্র ডেটা লোড হচ্ছে...",
    errorLoadingMap: "মানচিত্র ডেটা লোড করতে ত্রুটি:"
  }
};

const getMarkerColor = (priority) => {
  switch (priority.toLowerCase()) {
    case "urgent": return "red";
    case "high": return "orange";
    case "medium": return "blue";
    case "low": return "green";
    default: return "gray";
  }
};

const createMarkerIcon = (color) => {
  const iconColor = color || "blue";
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${iconColor}.png`,
    shadowUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

const MapRouteView = () => {
  // Consume geoJsonData, loading, and error from context
  const { geoJsonData, geoJsonLoading, geoJsonError } = useAppData(); 

  const [selectedAssistants, setSelectedAssistants] = useState([]);
  const { currentLang } = useLanguage();
  const [labels, setLabels] = useState(fallbackLabels.en);

  // Removed the useEffect that was fetching /CitizenIssues.geojson.json directly
  // useEffect(() => { ... fetch("/CitizenIssues.geojson.json") ... }, []); 

  // Initialize selectedAssistants once geoJsonData is loaded
  useEffect(() => {
    if (geoJsonData && geoJsonData.features && selectedAssistants.length === 0) {
      const uniqueAssistants = [...new Set(geoJsonData.features.map((f) => f.properties.assistant))];
      setSelectedAssistants(uniqueAssistants.map((name) => ({ label: name, value: name })));
    }
  }, [geoJsonData, selectedAssistants.length]); // Depend on geoJsonData and selectedAssistants.length

  const assistants = useMemo(() => {
    if (!geoJsonData || !geoJsonData.features) return [];
    const unique = [...new Set(geoJsonData.features.map((f) => f.properties.assistant))];
    return unique.map((name) => ({ label: name, value: name }));
  }, [geoJsonData]);

  // Translation logic (already efficient)
  useEffect(() => {
    const loadLabels = async () => {
      if (currentLang === "en" || fallbackLabels[currentLang]) {
        setLabels(fallbackLabels[currentLang] || fallbackLabels.en);
      } else {
        const keys = Object.keys(fallbackLabels.en);
        const translated = await Promise.all(keys.map((key) => translateText(fallbackLabels.en[key], currentLang)));
        const obj = {};
        keys.forEach((key, i) => (obj[key] = translated[i]));
        setLabels(obj);
      }
    };

    loadLabels();
  }, [currentLang]);

  // Map rendering logic
  useEffect(() => {
    if (!geoJsonData || geoJsonLoading || geoJsonError) return; // Wait for data to be loaded without error
    if (selectedAssistants.length === 0) return; // Wait for initial assistants to be set

    const mapId = "map";
    const container = L.DomUtil.get(mapId);
    if (container && container._leaflet_id) {
      container._leaflet_id = null; // Clear existing map instance if any
    }

    const map = L.map(mapId).setView([22.9734, 78.6569], 5); // Default center and zoom

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    const selected = selectedAssistants.map((a) => a.value);
    const filteredFeatures = geoJsonData.features.filter((f) => selected.includes(f.properties.assistant));

    const grouped = {};
    const bounds = [];

    filteredFeatures.forEach((feature) => {
      const { geometry, properties } = feature;
      const [lng, lat] = geometry.coordinates;
      const { location, assistant, priority, issue } = properties;

      if (!grouped[assistant]) grouped[assistant] = [];
      grouped[assistant].push(feature);

      const color = getMarkerColor(priority);
      const icon = createMarkerIcon(color);

      const marker = L.marker([lat, lng], { icon }).addTo(map);
      marker.bindPopup(
        `<strong>${issue}</strong><br>${location}<br><span style="color:${color}">${priority}</span>`
      );

      bounds.push([lat, lng]);
    });

    const routeColors = [
      "#1abc9c",
      "#3498db",
      "#e74c3c",
      "#9b59b6",
      "#e67e22",
      "#2ecc71"
    ];

    Object.entries(grouped).forEach(([assistant, features], i) => {
      features.sort((a, b) => new Date(a.properties.visitDate) - new Date(b.properties.visitDate));
      const sortedCoords = features.map((f) => [f.geometry.coordinates[1], f.geometry.coordinates[0]]);

      L.polyline(sortedCoords, {
        color: routeColors[i % routeColors.length],
        weight: 3,
        opacity: 0.8,
        dashArray: "5, 10",
        smoothFactor: 1
      })
        .bindTooltip(`${assistant}${labels.route}`, { sticky: true })
        .addTo(map);
    });

    // Only fit bounds if there are features to show
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      // If no features, set a default view or center the map
      map.setView([22.9734, 78.6569], 5);
    }

    return () => map.remove();
  }, [geoJsonData, geoJsonLoading, geoJsonError, selectedAssistants, labels]); // Added context states to dependencies

  // Handle loading and error states from context
  if (geoJsonLoading) {
    return (
      <div className="rounded-xl overflow-hidden shadow-md bg-white p-4 text-center text-gray-500" style={{ height: "500px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {labels.loadingMap}
      </div>
    );
  }

  if (geoJsonError) {
    return (
      <div className="rounded-xl overflow-hidden shadow-md bg-red-50 border border-red-200 p-4 text-center text-red-800" style={{ height: "500px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {labels.errorLoadingMap} {geoJsonError}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="mb-4 w-full max-w-md z-50 relative">
        <Select
          isMulti
          options={assistants}
          value={selectedAssistants}
          onChange={setSelectedAssistants}
          placeholder={labels.placeholder}
          className="z-50"
          classNamePrefix="react-select"
          menuPortalTarget={document.body}
          styles={{
            menuPortal: base => ({ ...base, zIndex: 9998 }),
            menu: base => ({ ...base, zIndex: 9998 })
          }}
        />
      </div>
      <div
        id="map"
        style={{
          height: "500px",
          width: "100%",
          borderRadius: "12px",
          marginTop: "1rem",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          zIndex: 10
        }}
        className="relative"
      ></div>
    </div>
  );
};

export default MapRouteView;