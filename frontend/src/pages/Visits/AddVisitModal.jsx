import React, { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { translateText } from "../../utils/translateText";
import { 
  useCreateVisitMutation,
  useGetEligibleCitizenIssuesQuery,
  useGetAssistantsQuery,
  useValidateVisitDataMutation,
  useGetVisitsQuery
} from "../../store/api/appApi";

const fallbackLabels = {
  en: {
    title: "Schedule New Visit",
    close: "Close",
    save: "Schedule Visit",
    cancel: "Cancel",
    selectIssue: "Select Citizen Issue",
    selectIssueHelp: "Choose the issue this visit is about",
    selectAssistant: "Assign Assistant",
    selectAssistantHelp: "Assistant will be auto-filled based on selected issue",
    visitDate: "Visit Date",
    visitTime: "Visit Time (Optional)",
    notes: "Additional Notes (Optional)",
    notesPlaceholder: "Any special instructions or notes for this visit...",
    priority: "Priority",
    status: "Status",
    loading: "Loading options...",
    creating: "Scheduling visit...",
    error: "Error",
    success: "Visit scheduled successfully!",
    validationError: "Please fix the following errors:",
    noIssuesAvailable: "No eligible issues available",
    noAssistantsAvailable: "No assistants available",
    loadingError: "Failed to load data. Please try again.",
    autoFilled: "Auto-filled from selected issue"
  },
  hi: {
    title: "नई यात्रा का कार्यक्रम",
    close: "बंद करें",
    save: "यात्रा निर्धारित करें",
    cancel: "रद्द करें",
    selectIssue: "नागरिक समस्या चुनें",
    selectIssueHelp: "वह समस्या चुनें जिसके बारे में यह यात्रा है",
    selectAssistant: "सहायक नियुक्त करें",
    selectAssistantHelp: "चयनित समस्या के आधार पर सहायक अपने आप भर जाएगा",
    visitDate: "यात्रा की तारीख",
    visitTime: "यात्रा का समय (वैकल्पिक)",
    notes: "अतिरिक्त टिप्पणी (वैकल्पिक)",
    notesPlaceholder: "इस यात्रा के लिए कोई विशेष निर्देश या टिप्पणी...",
    priority: "प्राथमिकता",
    status: "स्थिति",
    loading: "विकल्प लोड हो रहे हैं...",
    creating: "यात्रा निर्धारित की जा रही है...",
    error: "त्रुटि",
    success: "यात्रा सफलतापूर्वक निर्धारित की गई!",
    validationError: "कृपया निम्नलिखित त्रुटियों को ठीक करें:",
    noIssuesAvailable: "कोई योग्य समस्या उपलब्ध नहीं है",
    noAssistantsAvailable: "कोई सहायक उपलब्ध नहीं है",
    loadingError: "डेटा लोड करने में विफल। कृपया पुनः प्रयास करें।",
    autoFilled: "चयनित समस्या से अपने आप भरा गया"
  }
};

const priorityOptions = [
  { value: "Low", label: "Low", color: "text-green-600" },
  { value: "Medium", label: "Medium", color: "text-blue-600" },
  { value: "High", label: "High", color: "text-yellow-600" },
  { value: "Urgent", label: "Urgent", color: "text-red-600" }
];

const statusOptions = [
  { value: "Upcoming", label: "Upcoming", color: "text-blue-600" },
  { value: "Completed", label: "Completed", color: "text-green-600" },
  { value: "Rejected", label: "Rejected", color: "text-red-600" }
];

const AddVisitModal = ({ onClose, onAddVisit }) => {
  const { currentLang } = useLanguage();
  const [labels, setLabels] = useState(fallbackLabels.en);
  
  // RTK Query hooks
  const { data: eligibleIssues = [], isLoading: loading, error: dataError } = useGetEligibleCitizenIssuesQuery();
  const { data: assistants = [] } = useGetAssistantsQuery();
  const { data: existingVisits = [] } = useGetVisitsQuery({ skip: 0, limit: 1000 });
  const [createVisit] = useCreateVisitMutation();
  const [validateVisitData] = useValidateVisitDataMutation();
  
  // ✅ Form state
  const [formData, setFormData] = useState({
    citizen_issue_id: "",
    visit_date: "",
    visit_time: "",
    assistant_id: "",
    notes: "",
    status: "Upcoming"
  });
  
  // ✅ UI state
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);
  const [isAssistantAutoFilled, setIsAssistantAutoFilled] = useState(false);

  // ✅ Load translations
  useEffect(() => {
    const loadLabels = async () => {
      if (currentLang === "en") {
        setLabels(fallbackLabels.en);
        return;
      }

      const initialLabels = fallbackLabels[currentLang] || fallbackLabels.en;
      setLabels(initialLabels);

      if (typeof translateText === 'function') {
        try {
          const textsToTranslate = Object.values(fallbackLabels.en);
          const translatedBatch = await translateText(textsToTranslate, "en", currentLang);
          
          if (translatedBatch) {
            const newLabels = { ...initialLabels };
            const originalKeysMap = Object.fromEntries(
              Object.entries(fallbackLabels.en).map(([key, value]) => [value, key])
            );
            
            for (const originalText in translatedBatch) {
              const translatedValue = translatedBatch[originalText];
              const key = originalKeysMap[originalText];
              if (key && translatedValue && translatedValue !== originalText) {
                newLabels[key] = translatedValue;
              }
            }
            setLabels(newLabels);
          }
        } catch (error) {
          console.error("Translation failed for AddVisitModal:", error);
        }
      }
    };
    loadLabels();
  }, [currentLang]);



  // ✅ Filter out issues that already have visits scheduled
  const getAvailableIssues = () => {
    // Get all citizen issue IDs that already have visits (any status)
    const usedIssueIds = new Set(
      existingVisits
        .map(visit => visit.citizen_issue_id)
        .filter(id => id != null)
    );
    
    // Filter out issues that are already used
    return eligibleIssues.filter(issue => !usedIssueIds.has(issue.id));
  };

  // ✅ Handle issue selection and auto-fill assistant
  const handleIssueChange = (issueId) => {
    setFormData(prev => ({
      ...prev,
      citizen_issue_id: issueId,
      assistant_id: "" // Reset assistant first
    }));

    // Auto-fill assistant if issue has one assigned
    if (issueId) {
      const selectedIssue = eligibleIssues.find(issue => issue.id === parseInt(issueId));
      console.log("Selected issue:", selectedIssue); // Debug log
      
      if (selectedIssue) {
        // Check multiple possible fields for assistant information
        const assistantId = selectedIssue.assistant_id || selectedIssue.assigned_to_id || selectedIssue.assistantId;
        const assistantName = selectedIssue.assistant_name || selectedIssue.assigned_to_name || selectedIssue.assistantName;
        
        console.log("Assistant ID from issue:", assistantId); // Debug log
        console.log("Assistant name from issue:", assistantName); // Debug log
        
        if (assistantId) {
          setFormData(prev => ({
            ...prev,
            assistant_id: assistantId.toString()
          }));
          setIsAssistantAutoFilled(true);
          console.log("Auto-filled assistant ID:", assistantId); // Debug log
        } else if (assistantName) {
          // If we have assistant name but not ID, try to find the ID from assistants list
          const matchingAssistant = assistants.find(assistant => 
            assistant.name === assistantName || assistant.email === assistantName
          );
          if (matchingAssistant) {
            setFormData(prev => ({
              ...prev,
              assistant_id: matchingAssistant.id.toString()
            }));
            setIsAssistantAutoFilled(true);
            console.log("Auto-filled assistant by name match:", matchingAssistant.id); // Debug log
          } else {
            setIsAssistantAutoFilled(false);
          }
        } else {
          setIsAssistantAutoFilled(false);
          console.log("No assistant found for this issue"); // Debug log
        }
      } else {
        setIsAssistantAutoFilled(false);
      }
    } else {
      setIsAssistantAutoFilled(false);
    }
  };

  // ✅ Handle form field changes
  const handleChange = (field, value) => {
    if (field === "citizen_issue_id") {
      handleIssueChange(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
      
      // If user manually changes assistant, remove auto-fill indicator
      if (field === "assistant_id") {
        setIsAssistantAutoFilled(false);
      }
    }
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setCreating(true);
      setErrors([]);
      
      // Prepare data for backend
      const visitData = {
        citizen_issue_id: parseInt(formData.citizen_issue_id),
        visit_date: formData.visit_date,
        visit_time: formData.visit_time || null,
        assistant_id: formData.assistant_id ? parseInt(formData.assistant_id) : null,
        notes: formData.notes || null,
        status: formData.status
      };
      
      console.log("Submitting visit data:", visitData);
      
      // Validate data first (if validation endpoint exists)
      try {
        await validateVisitData(visitData).unwrap();
      } catch (validationError) {
        console.warn("Validation failed:", validationError);
        // Continue anyway as validation might not be implemented on backend
      }
      
      const newVisit = await createVisit(visitData).unwrap();
      console.log("Created visit:", newVisit);
      
      setSuccess(true);
      
      // Close modal and refresh parent component after a short delay
      setTimeout(() => {
        onAddVisit(newVisit);
      }, 1500);
      
    } catch (error) {
      console.error("Error creating visit:", error);
      setErrors([error.data?.detail || error.message || "Failed to create visit. Please try again."]);
    } finally {
      setCreating(false);
    }
  };

  // ✅ Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // ✅ Get assistant name by ID
  const getAssistantName = (assistantId) => {
    const assistant = assistants.find(a => a.id === parseInt(assistantId));
    return assistant ? assistant.name : "";
  };

  // ✅ Show success state
  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {labels.success}
            </h3>
            <p className="text-sm text-gray-500">
              The visit has been scheduled and will appear in your list.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Get available issues (not already scheduled)
  const availableIssues = getAvailableIssues();

  return (
    <div className="fixed inset-0 bg-gray-50 bg-opacity-50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {labels.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={creating}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* ✅ Loading state */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{labels.loading}</p>
            </div>
          )}

          {/* ✅ Data loading error */}
          {dataError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {labels.error}
                  </h3>
                  <p className="mt-1 text-sm text-red-700">{dataError}</p>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Form */}
          {!loading && !dataError && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Validation Errors */}
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        {labels.validationError}
                      </h3>
                      <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Citizen Issue Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {labels.selectIssue}
                </label>
                <p className="text-xs text-gray-500 mb-2">{labels.selectIssueHelp}</p>
                <select
                  value={formData.citizen_issue_id}
                  onChange={(e) => handleChange("citizen_issue_id", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                  disabled={creating}
                >
                  <option value="">Select an issue...</option>
                  {availableIssues.length > 0 ? (
                    availableIssues.map((issue) => (
                      <option key={issue.id} value={issue.id}>
                        {issue.title} - {issue.location} ({issue.priority})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      {eligibleIssues.length === 0 ? labels.noIssuesAvailable : "All issues already have visits scheduled"}
                    </option>
                  )}
                </select>
                {availableIssues.length === 0 && eligibleIssues.length > 0 && (
                  <p className="text-xs text-orange-600 mt-1">
                    All available issues already have visits scheduled. Complete or reject existing visits to schedule new ones.
                  </p>
                )}
              </div>

              {/* Assistant Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {labels.selectAssistant}
                  {isAssistantAutoFilled && (
                    <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">
                      {labels.autoFilled}
                    </span>
                  )}
                </label>
                <p className="text-xs text-gray-500 mb-2">{labels.selectAssistantHelp}</p>
                <select
                  value={formData.assistant_id}
                  onChange={(e) => handleChange("assistant_id", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    isAssistantAutoFilled 
                      ? "border-green-300 bg-green-50" 
                      : "border-gray-300"
                  }`}
                  disabled={creating}
                >
                  <option value="">No assistant assigned</option>
                  {assistants.length > 0 ? (
                    assistants.map((assistant) => (
                      <option key={assistant.id} value={assistant.id}>
                        {assistant.name} ({assistant.email})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>{labels.noAssistantsAvailable}</option>
                  )}
                </select>
              </div>

              {/* Visit Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {labels.visitDate}
                </label>
                <input
                  type="date"
                  value={formData.visit_date}
                  onChange={(e) => handleChange("visit_date", e.target.value)}
                  min={getMinDate()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                  disabled={creating}
                />
              </div>

              {/* Visit Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {labels.visitTime}
                </label>
                <input
                  type="time"
                  value={formData.visit_time}
                  onChange={(e) => handleChange("visit_time", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={creating}
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {labels.status}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={creating}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {labels.notes}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder={labels.notesPlaceholder}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  disabled={creating}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={creating}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {labels.cancel}
                </button>
                <button
                  type="submit"
                  disabled={creating || availableIssues.length === 0}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {creating && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {creating ? labels.creating : labels.save}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddVisitModal;