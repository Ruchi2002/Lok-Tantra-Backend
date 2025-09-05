import { Pencil, X, Save, Trash2 } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useDeleteCitizenIssueMutation, useUpdateCitizenIssueMutation } from "../../store/api/appApi";
import { fallbackTranslations } from "../../utils/fallbackTranslation";
import useSpeechToText from "../../hooks/useSpeechToText";
import { FaMicrophone, FaMicrophoneSlash, FaFile } from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";

// Transform function for issue data
const transformIssueData = {
  toAPI: (formData) => {
    return {
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      location: formData.location,
      assigned_to: formData.assigned_to,
      category_id: formData.category_id,
      area_id: formData.area_id,
      action_taken: formData.action_taken || null, // Ensure null instead of empty string
    };
  }
};

// 🎨 Color Mappings for status and priority badges
const statusColors = {
  Open: "bg-green-100 text-green-800",
  "In Progress": "bg-yellow-100 text-yellow-800",
  Committed: "bg-blue-100 text-blue-800",
  Urgent: "bg-red-100 text-red-800", // Added Urgent status color for consistency
};

const priorityColors = {
  Low: "bg-gray-100 text-gray-800",
  Medium: "bg-yellow-100 text-yellow-800",
  High: "bg-red-100 text-red-800",
  Urgent: "bg-orange-100 text-orange-800",
};

// ✏️ Options for dropdowns
const statusOptions = ["Open", "In Progress", "Pending", "Resolved"];
const priorityOptions = ["Low", "Medium", "High", "Urgent"];

// ✨ Edit Modal Component
const EditModal = ({ issue, isOpen, onClose, onSave, onDelete, canEdit, canDelete }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "",
    priority: "",
    location: "",
    assigned_to: "",
    category_id: "",
    area_id: "",
    action_taken: "",
  });

  const { currentLang: defaultLang } = useLanguage();
  const [selectedLang, setSelectedLang] = useState(defaultLang);

  // Initialize Speech-to-Text hooks for title, description, and action taken fields
  const titleSTT = useSpeechToText(selectedLang);
  const descriptionSTT = useSpeechToText(selectedLang);
  const actionTakenSTT = useSpeechToText(selectedLang);

  // RTK Query hooks for mutations
  const [updateIssue] = useUpdateCitizenIssueMutation();
  const [deleteIssue] = useDeleteCitizenIssueMutation();

  // Populate form data when the issue prop changes
  useEffect(() => {
    if (issue) {
      setFormData({
        title: issue.title || issue.issue || "",
        description: issue.description || "",
        status: issue.status || "",
        priority: issue.priority || "",
        location: issue.location || "",
        assigned_to: issue.assigned_to || "",
        category_id: issue.category_id || "",
        area_id: issue.area_id || "",
        action_taken: issue.action_taken || "",
      });
    }
  }, [issue]);

  // Update title from speech-to-text transcript
  useEffect(() => {
    if (titleSTT.transcript) {
      setFormData((prev) => ({ ...prev, title: titleSTT.transcript }));
    }
  }, [titleSTT.transcript]);

  // Update description from speech-to-text transcript
  useEffect(() => {
    if (descriptionSTT.transcript) {
      setFormData((prev) => ({ ...prev, description: descriptionSTT.transcript }));
    }
  }, [descriptionSTT.transcript]);

  // Update action taken from speech-to-text transcript
  useEffect(() => {
    if (actionTakenSTT.transcript) {
      setFormData((prev) => ({ ...prev, action_taken: actionTakenSTT.transcript }));
    }
  }, [actionTakenSTT.transcript]);

  // Handle language change for speech-to-text
  const handleLangChange = (e) => {
    const newLang = e.target.value;
    setSelectedLang(newLang);
    titleSTT.changeLanguage(newLang);
    descriptionSTT.changeLanguage(newLang);
    actionTakenSTT.changeLanguage(newLang);
  };

  // Generic handler for form input changes
  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    try {
      // Transform form data to API format
      const apiData = transformIssueData.toAPI(formData);
      
      // Update the issue via API
      // Update the issue using the RTK Query mutation
      const updatedIssue = await updateIssue({ 
        issueId: issue.id, 
        issueData: apiData 
      }).unwrap();
      
      // Call the onSave callback with the updated issue
      onSave(updatedIssue);
      onClose();
    } catch (error) {
      console.error('Error updating issue:', error);
      let errorMessage = 'Failed to update issue';
      
      if (error.data?.detail) {
        errorMessage = error.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  }, [issue, formData, onSave, onClose, updateIssue]);

  // Handle delete with permission check
  const handleDelete = async () => {
    if (!canDelete) {
      alert("You don't have permission to delete this issue");
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this issue?")) {
      try {
        await deleteIssue(issue.id);
        onDelete(issue.id);
        onClose();
      } catch (error) {
        console.error("Delete error:", error);
        alert("Failed to delete issue");
      }
    }
  };

  // Render nothing if modal is not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-lg bg-gray-900 bg-opacity-40 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden relative transform transition-all sm:my-8 sm:align-middle">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-purple-800">✏️ Edit Citizen Issue</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition-colors p-1 rounded-full"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Language Selection for STT */}
        <div className="px-4 pt-3 sm:px-6 sm:pt-4">
          <label htmlFor="stt-lang-select" className="block text-sm font-medium text-teal-700 mb-1">Language for Voice Input</label>
          <select
            id="stt-lang-select"
            value={selectedLang}
            onChange={handleLangChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
          >
            <option value="en-US">English (US)</option>
            <option value="hi-IN">Hindi (India)</option>
            <option value="gu-IN">Gujarati (India)</option>
            <option value="mr-IN">Marathi (India)</option>
            <option value="bn-IN">Bengali (India)</option>
            <option value="ta-IN">Tamil (India)</option>
          </select>
        </div>

        {/* Modal Body - Form Fields */}
        <div className="p-4 space-y-4 sm:p-6 sm:space-y-5 max-h-[calc(100vh-180px)] overflow-y-auto">
          {/* Issue Title Field */}
          <div className="relative">
            <label htmlFor="issue-title" className="block text-sm font-medium text-teal-700 mb-1">Grievance Title</label>
            <input
              id="issue-title"
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Enter issue title..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
            <button
              type="button"
              onClick={titleSTT.isListening ? titleSTT.stopListening : titleSTT.startListening}
              className="absolute top-2 right-3 text-gray-500 hover:text-blue-600 p-1 rounded-full"
              title={titleSTT.isListening ? "Stop Listening" : "Start Voice Input"}
              aria-label={titleSTT.isListening ? "Stop voice input for issue title" : "Start voice input for issue title"}
            >
              {titleSTT.isListening ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
            </button>
            {titleSTT.displayTranscript && (
              <p className="text-xs text-gray-500 mt-1 italic">{titleSTT.displayTranscript}</p>
            )}
          </div>

          {/* Issue Description Field */}
          <div className="relative">
            <label htmlFor="issue-description" className="block text-sm font-medium text-teal-700 mb-1">Grievance Description</label>
            <textarea
              id="issue-description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows="3"
              placeholder="Describe the issue clearly..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
            <button
              type="button"
              onClick={descriptionSTT.isListening ? descriptionSTT.stopListening : descriptionSTT.startListening}
              className="absolute top-8 right-3 text-gray-500 hover:text-blue-600 p-1 rounded-full"
              title={descriptionSTT.isListening ? "Stop Listening" : "Start Voice Input"}
              aria-label={descriptionSTT.isListening ? "Stop voice input for issue description" : "Start voice input for issue description"}
            >
              {descriptionSTT.isListening ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
            </button>
            {descriptionSTT.displayTranscript && (
              <p className="text-xs text-gray-500 mt-1 italic">{descriptionSTT.displayTranscript}</p>
            )}
          </div>

          {/* Action Taken Field */}
          <div className="relative">
            <label htmlFor="issue-action-taken" className="block text-sm font-medium text-teal-700 mb-1">Action Taken</label>
            <textarea
              id="issue-action-taken"
              value={formData.action_taken}
              onChange={(e) => handleChange("action_taken", e.target.value)}
              rows="3"
              placeholder="Describe the action taken to resolve this issue..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
            <button
              type="button"
              onClick={actionTakenSTT.isListening ? actionTakenSTT.stopListening : actionTakenSTT.startListening}
              className="absolute top-8 right-3 text-gray-500 hover:text-blue-600 p-1 rounded-full"
              title={actionTakenSTT.isListening ? "Stop Listening" : "Start Voice Input"}
              aria-label={actionTakenSTT.isListening ? "Stop voice input for action taken" : "Start voice input for action taken"}
            >
              {actionTakenSTT.isListening ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
            </button>
            {actionTakenSTT.displayTranscript && (
              <p className="text-xs text-gray-500 mt-1 italic">{actionTakenSTT.displayTranscript}</p>
            )}
          </div>

          {/* Status & Priority Fields - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="issue-status" className="block text-sm font-medium text-teal-700 mb-1">Status</label>
              <select
                id="issue-status"
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              >
                <option value="">Select Status</option>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="issue-priority" className="block text-sm font-medium text-teal-700 mb-1">Priority</label>
              <select
                id="issue-priority"
                value={formData.priority}
                onChange={(e) => handleChange("priority", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              >
                <option value="">Select Priority</option>
                {priorityOptions.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location Field */}
          <div>
            <label htmlFor="issue-location" className="block text-sm font-medium text-teal-700 mb-1">Location</label>
            <input
              id="issue-location"
              type="text"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="e.g., Maninagar, Ahmedabad"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>

          {/* Assigned To Field */}
          <div>
            <label htmlFor="issue-assigned-to" className="block text-sm font-medium text-teal-700 mb-1">Assigned To</label>
            <input
              id="issue-assigned-to"
              type="text"
              value={formData.assigned_to}
              onChange={(e) => handleChange("assigned_to", e.target.value)}
              placeholder="Enter user ID or leave empty for unassigned"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Modal Footer - Buttons */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          
          {canEdit && (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Save Changes
            </button>
          )}
          
          {canDelete && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              Delete Issue
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// 📋 IssueTable Component
const IssueTable = ({ 
  issues = [], 
  onIssueUpdated, 
  onIssueDeleted,
  showActions = true 
}) => {
  const [editingIssue, setEditingIssue] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentLang } = useLanguage();
  const { user, hasRole, isSuperAdmin, isTenantAdmin } = useAuth();

  // Basic permission checking functions - Updated to allow everyone to edit and delete
  const canEditIssue = useCallback((issue) => {
    if (!user) return false;
    
    // Everyone can edit any issue (as long as they are authenticated)
    return true;
  }, [user]);

  const canDeleteIssue = useCallback((issue) => {
    if (!user) return false;
    
    // Everyone can delete any issue (as long as they are authenticated)
    return true;
  }, [user]);

  const canCreateIssue = useCallback(() => {
    if (!user) return false;
    
    // All authenticated users can create issues
    return true;
  }, [user]);
  
  // RTK Query hooks - only what's needed in the main component
  const [deleteIssue] = useDeleteCitizenIssueMutation();

  // Define table headers
  const headers = [
    "Grievance",
    "Status",
    "Priority",
    "Location",
    "Assistant",
    "Category",
    "Date",
    "Action Taken",
    "Documents",
    "Actions",
  ];

  // Function to get translated header text
  const getTranslatedHeader = useCallback((header) =>
    fallbackTranslations.tableHeaders?.[header]?.[currentLang] || header,
    [currentLang]
  );

  // Handle edit button click, opens modal
  const handleEditClick = useCallback((item) => {
    setEditingIssue(item);
    setIsModalOpen(true);
  }, []);

  // Handle saving an edited issue
  const handleSave = useCallback((updatedIssue) => {
    if (onIssueUpdated) onIssueUpdated(updatedIssue.id, updatedIssue);
    setEditingIssue(null);
    setIsModalOpen(false);
  }, [onIssueUpdated]);

  // Handle deleting an issue
  const handleDelete = useCallback((issueId) => {
    if (onIssueDeleted) onIssueDeleted(issueId);
  }, [onIssueDeleted]);

  // Handle closing the modal
  const handleCloseModal = useCallback(() => {
    setEditingIssue(null);
    setIsModalOpen(false);
  }, []);



  // Issues are now filtered by the parent component based on permissions
  const filteredIssues = issues;

  return (
    <>
      {/* Desktop Table View (visible on 'sm' breakpoint and up) */}
      <div className="hidden sm:block overflow-x-auto rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {getTranslatedHeader(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredIssues.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center text-gray-400 py-8 text-sm">
                  No issues found.
                </td>
              </tr>
            ) : (
              filteredIssues.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-4 py-4 text-sm text-gray-900 max-w-[150px] truncate">{item.title || item.issue}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[item.status] || "bg-gray-100 text-gray-800"}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[item.priority] || "bg-gray-100 text-gray-800"}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700 max-w-[120px] truncate">{item.location}</td>
                  <td className="px-4 py-4 text-sm text-gray-700 max-w-[120px] truncate">
                    {item.assistant}
                    {/* Show ownership indicator for all users */}
                    <div className="mt-1">
                      {item.created_by === user?.id && (
                        <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                          Created by you
                        </span>
                      )}
                      {item.assigned_to === user?.id && item.created_by !== user?.id && (
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                          Assigned to you
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700 max-w-[100px] truncate">{item.category || "—"}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{item.date}</td>
                  <td className="px-4 py-4 text-sm text-gray-700 max-w-[150px] truncate">
                    {item.action_taken || "—"}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {item.documents && item.documents.length > 0 ? (
                      <div className="flex items-center gap-1">
                        <FaFile size={14} className="text-blue-500" />
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {item.documents.length} file{item.documents.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {showActions && canEditIssue(item) && (
                      <button
                        onClick={() => handleEditClick(item)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors duration-150"
                        title="Edit Issue"
                        aria-label={`Edit issue: ${item.title || item.issue}`}
                      >
                        <Pencil size={16} />
                      </button>
                    )}
                    
                    {showActions && canDeleteIssue(item) && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors duration-150 ml-2"
                        title="Delete Issue"
                        aria-label={`Delete issue: ${item.title || item.issue}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (visible only on screens smaller than 'sm') */}
      <div className="block sm:hidden space-y-4">
        {filteredIssues.length === 0 ? (
          <div className="text-center text-gray-400 py-8 px-4 text-sm">
            No issues found.
          </div>
        ) : (
          filteredIssues.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              {/* Issue Description - Prominent */}
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-600 mb-1">Issue:</h3>
                <p className="text-gray-900 font-medium text-base leading-tight">{item.title || item.issue}</p>
              </div>

              {/* Status & Priority - Flex row */}
              <div className="flex items-center gap-4 mb-3">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Status:</h4>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusColors[item.status] || "bg-gray-100 text-gray-800"}`}>
                    {item.status}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Priority:</h4>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${priorityColors[item.priority] || "bg-gray-100 text-gray-800"}`}>
                    {item.priority}
                  </span>
                </div>
              </div>

              {/* Other Details - Grid for better alignment */}
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm mb-4">
                <div>
                  <p className="text-gray-600 font-medium">Date:</p>
                  <p className="text-gray-700">{item.date}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Location:</p>
                  <p className="text-gray-700">{item.location}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Assistant:</p>
                  <p className="text-gray-700">{item.assistant}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Category:</p>
                  <p className="text-gray-700">{item.category || "—"}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Action Taken:</p>
                  <p className="text-gray-700">{item.action_taken || "—"}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Documents:</p>
                  <p className="text-gray-700">
                    {item.documents && item.documents.length > 0 ? (
                      <div className="flex items-center gap-1">
                        <FaFile size={12} className="text-blue-500" />
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {item.documents.length} file{item.documents.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    ) : (
                      "—"
                    )}
                  </p>
                </div>
              </div>

              {/* Actions Button - Aligned to the right */}
              <div className="text-right border-t pt-3 border-gray-100">
                {showActions && canEditIssue(item) && (
                  <button
                    onClick={() => handleEditClick(item)}
                    className="inline-flex items-center px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium text-sm transition-colors duration-150 mr-2"
                    title="Edit Issue"
                    aria-label={`Edit issue: ${item.title || item.issue}`}
                  >
                    <Pencil size={14} className="mr-1" /> Edit
                  </button>
                )}
                
                {showActions && canDeleteIssue(item) && (
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="inline-flex items-center px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium text-sm transition-colors duration-150"
                    title="Delete Issue"
                    aria-label={`Delete issue: ${item.title || item.issue}`}
                  >
                    <Trash2 size={14} className="mr-1" /> Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* The Edit Modal is rendered outside the table structure but within the component's render */}
      <EditModal
        issue={editingIssue}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        onDelete={handleDelete}
        canEdit={editingIssue ? canEditIssue(editingIssue) : false}
        canDelete={editingIssue ? canDeleteIssue(editingIssue) : false}
      />
    </>
  );
};

export default IssueTable;
