import React, { useEffect, useState } from "react";
import VisitStats from "./VisitStats";
import AreaSelector from "./AreaSelector";
import CitizenList from "./CitizenList";
import MapRouteView from "./MapRouteView";
import ActionButton from "./ActionButton";
import AddVisitModal from "./AddVisitModal";

import { useLanguage } from "../../context/LanguageContext";
import { translateText } from "../../utils/translateText";
import { useGetVisitsQuery, useCreateVisitMutation } from "../../store/api/appApi";

const fallbackTexts = {
  en: {
    heading: "📅 Visit Planner",
    addVisit: "➕ Add New Visit",
    previousVisits: "Previous Visits",
    loadingVisits: "Loading visit data...",
    errorLoadingVisits: "Error loading visit data:"
  },
  hi: {
    heading: "📅 यात्रा योजनाकर्ता",
    addVisit: "➕ नई यात्रा जोड़ें",
    previousVisits: "पिछली यात्राएं",
    loadingVisits: "यात्रा डेटा लोड हो रहा है...",
    errorLoadingVisits: "यात्रा डेटा लोड करने में त्रुटि:"
  },
  ta: {
    heading: "📅 விஜிட் திட்டமிடுதல்",
    addVisit: "➕ புதிய விஜிட் சேர்க்கவும்",
    previousVisits: "முந்தைய விஜிட்கள்",
    loadingVisits: "சந்திப்புத் தரவு ஏற்றப்படுகிறது...",
    errorLoadingVisits: "சந்திப்புத் தரவை ஏற்றுவதில் பிழை:"
  },
  mr: {
    heading: "📅 भेट नियोजन",
    addVisit: "➕ नवीन भेट जोडा",
    previousVisits: "मागील भेटी",
    loadingVisits: "भेट डेटा लोड होत आहे...",
    errorLoadingVisits: "भेट डेटा लोड करताना त्रुटी:"
  },
  bn: {
    heading: "📅 ভিজিট পরিকল্পক",
    addVisit: "➕ নতুন ভিজিট যোগ করুন",
    previousVisits: "পূর্ববর্তী ভিজিটসমূহ",
    loadingVisits: "ভিজিট ডেটা লোড হচ্ছে...",
    errorLoadingVisits: "ভিজিট ডেটা লোড করতে ত্রুটি:"
  },
};

const VisitPlanner = () => {
  const [selectedWard, setSelectedWard] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [labels, setLabels] = useState(fallbackTexts.en);
  const { currentLang } = useLanguage();

  const TENANT_ID = 1; // 🔁 Replace this with dynamic tenant ID when available

  // RTK Query hooks
  const { data: visitsData, isLoading: loading, error: visitsError } = useGetVisitsQuery({ skip: 0, limit: 100 });
  const [createVisit] = useCreateVisitMutation();

  const visitList = visitsData?.map(v => ({
    ...v,
    lat: v.lat || 0,
    lng: v.lng || 0,
  })) || [];

  // Multilingual Labels
  useEffect(() => {
    const loadLabels = async () => {
      if (currentLang === "en") {
        setLabels(fallbackTexts.en);
        return;
      }

      const initialLabels = fallbackTexts[currentLang] || fallbackTexts.en;
      setLabels(initialLabels);

      if (typeof translateText === 'function' && !fallbackTexts[currentLang]) {
        try {
          const keys = Object.keys(fallbackTexts.en);
          const textsToTranslate = keys.map(key => fallbackTexts.en[key]);

          const translatedTexts = await Promise.all(
            textsToTranslate.map(text => translateText(text, "en", currentLang))
          );

          const translatedLabels = {};
          keys.forEach((key, i) => {
            translatedLabels[key] = translatedTexts[i] || fallbackTexts.en[key];
          });

          setLabels(translatedLabels);
        } catch (error) {
          console.error("🌐 Translation error in VisitPlanner:", error);
        }
      }
    };

    loadLabels();
  }, [currentLang]);

  const handleAddVisit = async (newVisit) => {
  try {
    console.log("➕ Sending new visit to backend:", newVisit);

    // Send to backend using RTK Query
    await createVisit(newVisit).unwrap();

    setShowModal(false);
  } catch (err) {
    console.error("❌ Failed to add visit:", err);
    alert(err.message || "Failed to add visit. Please try again.");
  }
};

  const filteredVisits = selectedWard === "All"
    ? visitList
    : visitList.filter((v) => {
        const hasLocation = v.location && typeof v.location === 'string';
        return hasLocation && v.location.includes(selectedWard);
      });

  const uniqueWards = [
    "All",
    ...new Set(
      visitList
        .filter(v => v.location && typeof v.location === 'string')
        .map(v => v.location.split(",")[0].trim())
        .filter(Boolean)
    ),
  ];

  // Show loading UI
  if (loading) {
    return (
      <div className="px-6 space-y-6 relative flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="ml-4 text-gray-700">{labels.loadingVisits}</p>
      </div>
    );
  }

  // Show error UI
  if (visitsError) {
    return (
      <div className="px-6 space-y-6 relative text-center p-8 min-h-screen flex flex-col items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Visits</h3>
          <p className="text-red-600 mb-4">{visitsError.data?.detail || visitsError.message || 'Failed to load visits'}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Retry
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 space-y-4 relative">
      <h1 className="text-2xl font-bold text-indigo-400">{labels.heading}</h1>

      {/* Stats + Ward Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        <VisitStats visits={filteredVisits} />
        <AreaSelector
          selectedWard={selectedWard}
          setSelectedWard={setSelectedWard}
          wards={uniqueWards}
        />
      </div>

      {/* Citizen List + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CitizenList citizens={filteredVisits} />
        <MapRouteView />
      </div>
      


      {/* Floating Buttons / Actions */}
      <ActionButton onAddVisitClick={() => setShowModal(true)} />

      {/* Add Visit Modal */}
      {showModal && (
        <AddVisitModal
          onClose={() => setShowModal(false)}
          onAddVisit={handleAddVisit}
          usedIssues={visitList.map(v => v.issue).filter(Boolean)}
        />
      )}
    </div>
  );
};

export default VisitPlanner;
