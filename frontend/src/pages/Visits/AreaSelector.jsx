import React, { useEffect, useState, useRef } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { translateText } from "../../utils/translateText";
import { FaMapMarkerAlt } from "react-icons/fa";
import { useGetLocationsQuery } from "../../store/api/appApi";

const fallbackLabels = {
  en: {
    all: "All",
    placeholder: "Search or select area",
    label: "Select Area",
    noMatches: "No matches found",
    note: "⚠️ Note: Before Planning a Visit, Definitely Check the Summary of that Location.",
  },
  hi: {
    all: "सभी",
    placeholder: "क्षेत्र खोजें या चुनें",
    label: "क्षेत्र चुनें",
    noMatches: "कोई मेल नहीं मिला",
    note: "⚠️ नोट: यात्रा की योजना से पहले स्थान का सारांश जांचें।",
  },
  ta: {
    all: "அனைத்தும்",
    placeholder: "பகுதியைத் தேடவும் அல்லது தேர்ந்தெடுக்கவும்",
    label: "பகுதியை தேர்ந்தெடுக்கவும்",
    noMatches: "பொருத்தங்கள் இல்லை",
    note: "⚠️ குறிப்பு: பார்வைக்கு முன் சுருக்கத்தை சரிபார்க்கவும்.",
  },
  mr: {
    all: "सर्व",
    placeholder: "क्षेत्र शोधा किंवा निवडा",
    label: "भाग निवडा",
    noMatches: "कोणताही मेळ नाही",
    note: "⚠️ टीप: भेटीपूर्वी स्थानाचा सारांश तपासा.",
  },
  bn: {
    all: "সব",
    placeholder: "এলাকা অনুসন্ধান বা নির্বাচন করুন",
    label: "এলাকা নির্বাচন করুন",
    noMatches: "কোন মিল পাওয়া যায়নি",
    note: "⚠️ নোট: ভিজিটের আগে এলাকার সারাংশ চেক করুন।",
  },
};

const AreaSelector = ({ selectedWard, setSelectedWard }) => {
  const { currentLang } = useLanguage();
  const [labels, setLabels] = useState(fallbackLabels.en);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const selectorRef = useRef();

  // RTK Query hook
  const { data: wardsData, isLoading: loading, error } = useGetLocationsQuery();
  const wards = Array.isArray(wardsData) ? wardsData : [];

  // Load translations for labels
  useEffect(() => {
    const loadLabels = async () => {
      if (currentLang === "en" || fallbackLabels[currentLang]) {
        setLabels(fallbackLabels[currentLang] || fallbackLabels.en);
      } else {
        try {
          const keys = Object.keys(fallbackLabels.en);
          const translated = await Promise.all(
            keys.map((key) => translateText(fallbackLabels.en[key], currentLang))
          );
          const obj = {};
          keys.forEach((key, i) => (obj[key] = translated[i]));
          setLabels(obj);
        } catch (err) {
          console.error("Translation error:", err);
          setLabels(fallbackLabels.en);
        }
      }
    };
    loadLabels();
  }, [currentLang]);



  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Fixed: Filter wards based on search input, excluding "All" from the original list
  const filteredWards = wards
    .filter((ward) => ward && ward.toLowerCase() !== "all") 
    .filter((ward) => ward.toLowerCase().includes(search.toLowerCase()));

  // ✅ Fixed: Update search field when selectedWard changes externally
  useEffect(() => {
    if (selectedWard && selectedWard !== "All") {
      setSearch(selectedWard);
    } else if (selectedWard === "All") {
      setSearch("");
    }
  }, [selectedWard]);

  return (
    <div className="w-full flex z-[100] flex-col space-y-2 relative p-4 sm:p-6 lg:p-8" ref={selectorRef}> 
      <label htmlFor="area-selector-input" className="text-sm font-semibold text-gray-600 flex items-center gap-2">
        <FaMapMarkerAlt className="text-green-500" />
        {labels.label}
      </label>

      <div className="relative">
        <input
          id="area-selector-input"
          type="text"
          placeholder={loading ? "Loading locations..." : labels.placeholder}
          value={search}
          disabled={loading}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-700 bg-white text-sm font-medium transition duration-200 ease-in-out hover:border-green-400 focus:shadow-md disabled:bg-gray-100 disabled:cursor-not-allowed"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls="area-selector-list"
        />
        <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 pointer-events-none" />

        {isOpen && (
          <div 
            id="area-selector-list"
            className="absolute w-full max-h-60 mt-1 overflow-y-auto bg-white shadow-lg border border-gray-200 rounded-xl z-50"
            role="listbox"
          >
            {/* Always show "All" option at the top */}
            <div
              onClick={() => {
                setSelectedWard("All");
                setSearch("");
                setIsOpen(false);
              }}
              className={`px-4 py-2 hover:bg-green-100 cursor-pointer text-sm font-medium border-b border-gray-100 ${
                selectedWard === "All" ? "bg-green-50 text-green-700" : "text-gray-800"
              }`}
              role="option"
              aria-selected={selectedWard === "All"}
            >
              {labels.all}
            </div>

            {loading ? (
              <div className="px-4 py-2 text-gray-500 italic text-sm">
                Loading locations...
              </div>
            ) : error ? (
              <div className="px-4 py-2 text-red-500 italic text-sm">
                {error}
              </div>
            ) : filteredWards.length === 0 && search !== "" ? (
              <div className="px-4 py-2 text-gray-500 italic text-sm">
                {labels.noMatches}
              </div>
            ) : (
              filteredWards.map((ward, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedWard(ward);
                    setSearch(ward);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2 hover:bg-green-100 cursor-pointer text-sm ${
                    selectedWard === ward ? "bg-green-50 text-green-700" : "text-gray-800"
                  }`}
                  role="option"
                  aria-selected={selectedWard === ward}
                >
                  {ward}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ✅ Fixed: Only show note if not in loading/error state */}
      {!loading && !error && (
        <div className="bg-violet-100 border-l-4 border-violet-500 text-violet-800 p-4 rounded-xl shadow-sm my-6">
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold">
            {labels.note}
          </h3>
        </div>
      )}
    </div>
  );
};

export default AreaSelector;