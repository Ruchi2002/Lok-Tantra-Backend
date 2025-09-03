import React, { useEffect, useRef, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { translateText } from "../../utils/translateText";
import { 
  useGetVisitsQuery,
  useUpdateVisitMutation,
  useGetVisitStatsQuery
} from "../../store/api/appApi";
import AddVisitModal from "./AddVisitModal";

const ITEMS_PER_PAGE = 6;

const fallbackLabels = {
  en: {
    heading: "Citizens to Meet",
    allVisits: "Upcoming",
    previousVisits: "Completed",
    rejectedVisits: "Rejected",
    print: "Print List",
    assistant: "Assistant",
    markDone: "Mark Complete",
    markReject: "Reject",
    done: "Completed",
    rejected: "Rejected",
    loading: "Loading visits...",
    error: "Failed to load visits. Please try again.",
    retry: "Retry",
    noData: "No scheduled meetings",
    noDataSubtext: "Add your first citizen visit to get started",
    translating: "Translating...",
    addVisit: "Add Visit",
    prev: "Previous",
    next: "Next",
    page: "Page",
    of: "of",
    scheduledFor: "Scheduled for",
    location: "Location",
    rejectConfirm: "Are you sure you want to reject this visit?",
    updateError: "Failed to update visit status. Please try again.",
    updateSuccess: "Visit status updated successfully!"
  },
  hi: {
    heading: "नागरिकों से मिलने की सूची",
    allVisits: "आगामी",
    previousVisits: "पूर्ण",
    rejectedVisits: "अस्वीकृत",
    print: "सूची प्रिंट करें",
    assistant: "सहायक",
    markDone: "पूरा हुआ चिह्नित करें",
    markReject: "अस्वीकार करें",
    done: "पूरा हुआ",
    rejected: "अस्वीकृत",
    loading: "यात्राएं लोड हो रही हैं...",
    error: "यात्राएं लोड करने में विफल। कृपया पुनः प्रयास करें।",
    retry: "पुनः प्रयास करें",
    noData: "कोई निर्धारित बैठक नहीं",
    noDataSubtext: "शुरुआत के लिए अपनी पहली नागरिक यात्रा जोड़ें",
    translating: "अनुवाद हो रहा है...",
    addVisit: "यात्रा जोड़ें",
    prev: "पिछला",
    next: "अगला",
    page: "पृष्ठ",
    of: "का",
    scheduledFor: "निर्धारित समय",
    location: "स्थान",
    rejectConfirm: "क्या आप वाकई इस यात्रा को अस्वीकार करना चाहते हैं?",
    updateError: "यात्रा स्थिति अपडेट करने में विफल। कृपया पुनः प्रयास करें।",
    updateSuccess: "यात्रा स्थिति सफलतापूर्वक अपडेट की गई!"
  }
};

const priorityConfig = {
  Urgent: { 
    bg: "bg-red-50", 
    text: "text-red-700", 
    border: "border-red-200", 
    dot: "bg-red-500",
    accent: "bg-red-100"
  },
  High: { 
    bg: "bg-amber-50", 
    text: "text-amber-700", 
    border: "border-amber-200", 
    dot: "bg-amber-500",
    accent: "bg-amber-100"
  },
  Medium: { 
    bg: "bg-blue-50", 
    text: "text-blue-700", 
    border: "border-blue-200", 
    dot: "bg-blue-500",
    accent: "bg-blue-100"
  },
  Low: { 
    bg: "bg-emerald-50", 
    text: "text-emerald-700", 
    border: "border-emerald-200", 
    dot: "bg-emerald-500",
    accent: "bg-emerald-100"
  },
  Default: { 
    bg: "bg-gray-50", 
    text: "text-gray-700", 
    border: "border-gray-200", 
    dot: "bg-gray-400",
    accent: "bg-gray-100"
  },
};

const CitizenIssue = () => {
  // RTK Query hooks
  const { data: visitsData, isLoading: loading, error: visitsError } = useGetVisitsQuery({ skip: 0, limit: 1000 });
  const { data: stats } = useGetVisitStatsQuery();
  const [updateVisit] = useUpdateVisitMutation();
  
  // ✅ UI state
  const [updating, setUpdating] = useState({}); // Track which visits are being updated
  const [error, setError] = useState(null); // For update errors
  const [labels, setLabels] = useState(fallbackLabels.en);
  const { currentLang } = useLanguage();
  const printRef = useRef();
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState("");

  // ✅ Load translations
  useEffect(() => {
    const loadLabels = async () => {
      if (currentLang === "en") {
        setLabels(fallbackLabels.en);
        return;
      }
      const textsToTranslate = Object.values(fallbackLabels.en);
      const originalKeysMap = Object.fromEntries(Object.entries(fallbackLabels.en).map(([key, value]) => [value, key]));

      const initialLabels = fallbackLabels[currentLang] || fallbackLabels.en;
      setLabels(initialLabels);

      if (typeof translateText === 'function' && textsToTranslate.length > 0) {
        try {
          const translatedBatch = await translateText(textsToTranslate, "en", currentLang);
          const newLabels = { ...initialLabels };
          if (translatedBatch) {
            for (const originalText in translatedBatch) {
              const translatedValue = translatedBatch[originalText];
              const key = originalKeysMap[originalText];
              if (key && translatedValue && translatedValue !== originalText) {
                  newLabels[key] = translatedValue;
              }
            }
          }
          setLabels(newLabels);
        } catch (error) {
          console.error("Batch translation failed for CitizenIssue:", error);
        }
      }
    };
    loadLabels();
  }, [currentLang]);

  // ✅ Transform visits data to match component format
  const visits = React.useMemo(() => {
    if (!visitsData) return [];
    
    return visitsData.map(visit => ({
      id: visit.id,
      properties: {
        id: visit.id,
        issue: visit.visit_reason || "Untitled Issue",
        location: visit.location || "",
        assistant: visit.assistant?.name || visit.assistant_id || "",
        visitDate: visit.visit_date,
        visitTime: visit.visit_time,
        priority: visit.priority || "Medium",
        status: visit.status || "Upcoming",
        notes: visit.notes || "",
        citizen_issue_id: visit.citizen_issue_id
      }
    }));
  }, [visitsData]);

  // ✅ Update visit status in backend
  const updateVisitStatus = async (visitId, newStatus) => {
    try {
      setUpdating(prev => ({ ...prev, [visitId]: true }));
      
      // Update in backend using RTK Query
      await updateVisit({ visitId, visitData: { status: newStatus } }).unwrap();
      
      // Show success message
      setSuccessMessage(labels.updateSuccess);
      setTimeout(() => setSuccessMessage(""), 3000);
      
      // Handle pagination when removing from current tab
      if (activeTab === "all" && paginatedVisits.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
      
    } catch (err) {
      console.error("Error updating visit status:", err);
      setError(labels.updateError);
      setTimeout(() => setError(null), 5000);
    } finally {
      setUpdating(prev => ({ ...prev, [visitId]: false }));
    }
  };

  // ✅ Handle mark as done
  const handleMarkDone = (visitId) => {
    updateVisitStatus(visitId, "Completed");
  };

  // ✅ Handle mark as rejected
  const handleMarkReject = (visitId) => {
    if (!window.confirm(labels.rejectConfirm)) {
      return;
    }
    updateVisitStatus(visitId, "Rejected");
  };

  // ✅ Handle print
  const handlePrint = () => {
    if (!printRef.current) {
      console.error("Print area reference is not available.");
      return;
    }

    const printContent = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>${labels.heading}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #374151; line-height: 1.5; }
            .visit-card {
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 16px;
              margin-bottom: 12px;
              background-color: #ffffff;
              box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            }
            .visit-card h3 { font-size: 1rem; font-weight: 600; margin-bottom: 8px; color: #111827; }
            .visit-card p { font-size: 0.875rem; color: #6b7280; margin-bottom: 4px; }
            .priority-badge {
              display: inline-flex;
              align-items: center;
              gap: 4px;
              padding: 4px 8px;
              border-radius: 9999px;
              font-size: 0.75rem;
              font-weight: 500;
              margin-top: 8px;
            }
            .priority-dot { width: 6px; height: 6px; border-radius: 50%; }
            @page { size: A4; margin: 20mm; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // ✅ Handle add visit
  const handleAddVisit = async (newVisit) => {
    // Reload visits to get the latest data including the new visit
    await loadVisits();
    await loadStats();
    setShowModal(false);
  };

  // ✅ Filter visits based on active tab
  const filteredVisits = visits.filter((visit) => {
    const status = visit.properties.status;
    
    switch (activeTab) {
      case "all":
        return status === "Upcoming";
      case "previous":
        return status === "Completed";
      case "rejected":
        return status === "Rejected";
      default:
        return true;
    }
  });

  // ✅ Pagination
  const totalPages = Math.ceil(filteredVisits.length / ITEMS_PER_PAGE);
  const paginatedVisits = filteredVisits.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ✅ Switch tab
  const switchTab = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // ✅ Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{labels.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Print Styles */}
      <style>
        {`
        @media screen {
          .hide-on-print { display: block; }
          .print-area {
            position: absolute; left: -9999px; top: -9999px;
            width: 1px; height: 1px; overflow: hidden; visibility: hidden;
          }
        }

        @media print {
          .hide-on-print { display: none; }
          .show-on-print { display: block; }
          .print-area {
            position: static; left: auto; top: auto;
            width: auto; height: auto; overflow: visible; visibility: visible;
          }
        }
        `}
      </style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ✅ Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4 rounded">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}
        
        {visitsError && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <div className="flex justify-between items-center">
              <p className="text-red-800">{visitsError.data?.detail || visitsError.message || labels.error}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => window.location.reload()}
                  className="text-red-800 hover:text-red-900 underline"
                >
                  {labels.retry}
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="text-red-800 hover:text-red-900 ml-2"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="hide-on-print mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {labels.heading}
              </h1>
              <p className="text-gray-600">
                Manage and track your citizen meetings efficiently
              </p>
              {/* ✅ Show stats if available */}
              {/* {stats && (
                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                  <span>Total: {stats.total_visits}</span>
                  <span>Upcoming: {stats.upcoming_visits}</span>
                  <span>Completed: {stats.completed_visits}</span>
                  <span>Rejected: {stats.rejected_visits}</span>
                </div>
              )} */}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                {labels.addVisit}
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                {labels.print}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Tab Navigation with Rejected Tab */}
        <div className="hide-on-print mb-6 w-[1/2]">
          <div className="bg-white rounded-lg p-1  shadow-sm border border-gray-200 inline-flex ">
            <button
              className={`px-6 py-2.5 rounded-md font-medium text-sm transition-all duration-200 ${
                activeTab === "all"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
              onClick={() => switchTab("all")}
            >
              {labels.allVisits} ({visits.filter(v => v.properties.status === "Upcoming").length})
            </button>
            <button
              className={`px-6 py-2.5 rounded-md font-medium text-sm transition-all duration-200 ${
                activeTab === "previous"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
              onClick={() => switchTab("previous")}
            >
              {labels.previousVisits} ({visits.filter(v => v.properties.status === "Completed").length})
            </button>
            <button
              className={`px-6 py-2.5 rounded-md font-medium text-sm transition-all duration-200 ${
                activeTab === "rejected"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
              onClick={() => switchTab("rejected")}
            >
              {labels.rejectedVisits} ({visits.filter(v => v.properties.status === "Rejected").length})
            </button>
          </div>
        </div>

        {/* Citizen List */}
        <div className="hide-on-print">
          {paginatedVisits.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1">
              {paginatedVisits.map((visit) => {
                const p = visit.properties;
                const isDone = p.status === "Completed";
                const isRejected = p.status === "Rejected";
                const isUpdating = updating[visit.id];
                const priority = p.priority || "Default";
                const config = priorityConfig[priority] || priorityConfig.Default;

                return (
                  <div
                    key={visit.id}
                    className={`bg-white rounded-lg shadow-sm border transition-all duration-200 hover:shadow-md ${
                      isDone || isRejected ? "opacity-60" : "border-gray-200 hover:border-gray-300"
                    } ${isUpdating ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    <div className="p-4">
                      {/* ✅ Loading indicator for updating visits */}
                      {isUpdating && (
                        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                        </div>
                      )}

                      {/* Header with issue and status */}
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-gray-900 text-lg leading-6 flex-1 mr-2">
                          {p.issue || "Untitled Issue"}
                        </h3>
                        {isDone && (
                          <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full text-xs font-medium">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {labels.done}
                          </span>
                        )}
                        {isRejected && (
                          <span className="flex items-center gap-1.5 text-red-700 bg-red-100 px-2.5 py-1 rounded-full text-xs font-medium">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            {labels.rejected}
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="space-y-1.5 mb-3">
                        {p.location && (
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate">{p.location}</span>
                          </div>
                        )}

                        {p.assistant && (
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="truncate">{p.assistant}</span>
                          </div>
                        )}

                        {(p.visitDate || p.visitTime) && (
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="truncate">
                              {p.visitDate} {p.visitTime && `at ${p.visitTime}`}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Enhanced Action Row with Priority and Reject Button */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {priority !== "Default" && (
                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></div>
                              {priority}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className=" flex item-center justify-end">
                        {!isDone && !isRejected && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleMarkDone(visit.id)}
                              disabled={isUpdating}
                              className="bg-emerald-600 text-white px-3 py-1.5 text-xs font-medium rounded-md hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {labels.markDone}
                            </button>
                            <button
                              onClick={() => handleMarkReject(visit.id)}
                              disabled={isUpdating}
                              className="bg-orange-600 text-white px-3 py-1.5 text-xs font-medium rounded-md hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {labels.markReject}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md mx-auto">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 2m8-2l2 2m-8 6h.01M16 13h.01M16 17h.01M8 17h.01" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {labels.noData}
                </h3>
                <p className="text-gray-600 mb-6 text-sm">
                  {labels.noDataSubtext}
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  {labels.addVisit}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8 hide-on-print">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === page
                      ? "bg-indigo-600 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Print Area */}
        <div ref={printRef} className="print-area">
          <h1 className="text-2xl font-bold mb-6">{labels.heading}</h1>
          {filteredVisits.length > 0 ? (
            filteredVisits.map((visit) => {
              const p = visit.properties;
              const priority = p.priority || "Default";
              const config = priorityConfig[priority] || priorityConfig.Default;

              return (
                <div key={visit.id} className="visit-card">
                  {p.issue && <h3>{p.issue}</h3>}
                  {p.location && <p><strong>{labels.location}:</strong> {p.location}</p>}
                  {p.assistant && <p><strong>{labels.assistant}:</strong> {p.assistant}</p>}
                  {(p.visitDate || p.visitTime) && (
                    <p><strong>{labels.scheduledFor}:</strong> {p.visitDate} {p.visitTime ? `at ${p.visitTime}` : ''}</p>
                  )}
                  {priority !== "Default" && (
                    <div className={`priority-badge ${config.bg} ${config.text} ${config.border}`}>
                      <div className={`priority-dot ${config.dot}`}></div>
                      {priority}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p>{labels.noData}</p>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <AddVisitModal
            onClose={() => setShowModal(false)}
            onAddVisit={handleAddVisit}
            // ✅ Remove usedIssues prop since backend handles this differently
          />
        )}
      </div>
    </div>
  );
};

export default CitizenIssue;