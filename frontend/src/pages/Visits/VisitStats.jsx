import React, { useEffect, useRef, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { translateText } from "../../utils/translateText";
import { FaTimes, FaMapMarkerAlt } from "react-icons/fa";
import { useGetVisitStatsQuery } from "../../store/api/appApi";

// fallbackLabels, colors, badgeColors (unchanged)
const fallbackLabels = {
  en: {
    total: "Total Issues",
    resolved: "Resolved",
    pending: "Pending",
    urgent: "Urgent",
    progress: "In Progress",
    close: "Close",
  },
  hi: {
    total: "कुल समस्याएं",
    resolved: "समाधान",
    pending: "लंबित",
    urgent: "अत्यावश्यक",
    progress: "प्रगति पर",
    close: "बंद करें",
  },
};

const colors = {
  total: "bg-gray-100 border-gray-300 text-gray-800",
  resolved: "bg-green-100 border-green-300 text-green-700",
  pending: "bg-yellow-100 border-yellow-300 text-yellow-700",
  urgent: "bg-red-100 border-red-300 text-red-700",
  progress: "bg-indigo-100 border-indigo-300 text-indigo-700",
};

const badgeColors = {
  resolved: "bg-green-200 text-green-800",
  pending: "bg-yellow-200 text-yellow-800",
  urgent: "bg-red-200 text-red-800",
  open: "bg-blue-200 text-blue-800",
  progress: "bg-indigo-200 text-indigo-800",
};

// UI Components
const StatBox = ({ label, count, styleKey, onClick }) => (
  <div
    onClick={onClick}
    className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center shadow transition hover:scale-[1.03] hover:shadow-md ${colors[styleKey]}`}
  >
    <p className="text-3xl font-bold">{count}</p>
    <p className="text-sm font-medium mt-1">{label}</p>
  </div>
);

const StatDetailsModal = ({ title, list, onClose }) => {
  const modalRef = useRef();

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [onClose]);

  return (
    <div className="fixed inset-0 backdrop-blur-2xl bg-black/30 z-[100001] flex justify-center items-center px-4 pointer-events-none">
      <div
        ref={modalRef}
        className="bg-white w-full max-w-2xl rounded-xl shadow-xl relative max-h-[80vh] pointer-events-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition z-10"
        >
          <FaTimes size={20} />
        </button>

        <div className="pt-16 px-6 pb-6 overflow-y-auto max-h-[80vh]">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">{title}</h2>

          {list.length === 0 ? (
            <p className="text-gray-500 italic">No issues in this category.</p>
          ) : (
            <ul className="space-y-4">
              {list.map((issue, index) => (
                <li
                  key={index}
                  className="bg-gray-50 border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">
                    {issue.issue || issue.title || issue.description || 'No title'}
                  </h3>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="flex items-center gap-1 text-gray-600">
                      <FaMapMarkerAlt className="text-green-500" />
                      {issue.location || 'Unknown location'}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-md font-medium ${
                        badgeColors[issue.status?.toLowerCase()] ||
                        "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {issue.status || 'Unknown'}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-md font-medium ${
                        badgeColors[issue.priority?.toLowerCase()] ||
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {issue.priority || 'Normal'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

// 🧠 Updated Component with Location Filter
const VisitStats = ({ selectedLocation = "All" }) => { // ✅ Accept selectedLocation prop
  const { currentLang } = useLanguage();
  const [labels, setLabels] = useState(fallbackLabels.en);
  const [selectedStatKey, setSelectedStatKey] = useState(null);

  // RTK Query hook
  const { data: issueStats, isLoading: loading } = useGetVisitStatsQuery(selectedLocation);

  // Load translations
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



  if (loading) return <p className="text-center text-gray-500">Loading stats...</p>;

  if (!issueStats)
    return <p className="text-center text-red-500">Failed to load issue stats.</p>;

  const counts = {
    total: issueStats.total_issues || 0,
    resolved: issueStats.resolved_issues || 0,
    pending: issueStats.pending_issues || 0,
    urgent: issueStats.Urgent_issues || 0,
  };

  const filtered = {
    total: issueStats.all_issues || [],
    resolved: issueStats.resolved_list || [],
    pending: issueStats.pending_list || [],
    urgent: issueStats.urgent_list || [],
  };

  return (
    <div className="relative w-full">
      {/* ✅ Show current filter info */}
      {selectedLocation && selectedLocation !== "All" && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <FaMapMarkerAlt className="inline mr-1" />
            Showing stats for: <strong>{selectedLocation}</strong>
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4">
        {["total", "resolved", "pending", "urgent"].map((key) => (
          <StatBox
            key={key}
            label={labels[key]}
            count={counts[key]}
            styleKey={key}
            onClick={() => setSelectedStatKey(key)}
          />
        ))}
      </div>

      {selectedStatKey && (
        <StatDetailsModal
          title={`${labels[selectedStatKey]} ${selectedLocation !== "All" ? `- ${selectedLocation}` : ""}`}
          list={filtered[selectedStatKey]}
          onClose={() => setSelectedStatKey(null)}
        />
      )}
    </div>
  );
};

export default VisitStats;