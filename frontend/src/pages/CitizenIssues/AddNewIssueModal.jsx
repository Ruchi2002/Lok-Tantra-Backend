import { useState, useEffect } from "react";
import {
  FaPlusCircle,
  FaMapMarkerAlt,
  FaUser,
  FaCalendarAlt,
  FaFlag,
  FaTasks,
  FaMicrophone,
  FaMicrophoneSlash,
  FaLanguage,
  FaPlus,
  FaTags,
  FaFileUpload,
  FaFile,
  FaTrash,
} from "react-icons/fa";
import useSpeechToText from "../../hooks/useSpeechToText";
import { useCreateCitizenIssueMutation } from "../../store/api/appApi";

// Transform function moved here since the old API file was deleted
const transformIssueData = (rawIssues) => {
  return rawIssues.map(issue => ({
    id: issue.id,
    title: issue.title || issue.subject || 'No Title',
    description: issue.description || issue.content || 'No Description',
    status: issue.status || 'Open',
    priority: issue.priority || 'Medium',
    category: issue.category || issue.issue_category || 'General',
    location: issue.location || issue.area || 'Unknown',
    reportedBy: issue.reported_by || issue.citizen_name || 'Anonymous',
    reportedDate: issue.reported_date || issue.created_at || new Date().toISOString(),
    assignedTo: issue.assigned_to || issue.assigned_user || 'Unassigned',
    lastUpdated: issue.last_updated || issue.updated_at || issue.created_at,
    coordinates: issue.coordinates || null,
    images: issue.images || [],
    contactInfo: issue.contact_info || {},
    tags: issue.tags || [],
    notes: issue.notes || [],
    followUpDate: issue.follow_up_date || null,
    resolution: issue.resolution || null,
    resolutionDate: issue.resolution_date || null,
    rating: issue.rating || null,
    feedback: issue.feedback || null
  }));
};

// Language configurations
const languages = {
  "en-US": { name: "English", flag: "🇺🇸" },
  "hi-IN": { name: "Hindi", flag: "🇮🇳" },
  "mr-IN": { name: "Marathi", flag: "🇮🇳" },
  "ta-IN": { name: "Tamil", flag: "🇮🇳" },
  "bn-IN": { name: "Bengali", flag: "🇮🇳" },
};

// Multi-language labels
const labels = {
  "en-US": {
    heading: "Add New Issue",
    issuePlaceholder: "Issue description",
    locationPlaceholder: "Location",
    assistantPlaceholder: "Assistant name",
    categoryPlaceholder: "Select category",
    newCategoryPlaceholder: "Enter new category name",
    cancel: "Cancel",
    addIssue: "Add Issue",
    statusLabel: "Status",
    priorityLabel: "Priority",
    categoryLabel: "Category",
    languageLabel: "Language",
    addNewCategory: "Add New Category",
    speakingIndicator: "Speaking...",
    listeningFor: "Listening for",
    speakNow: "Speak now - text will appear in real-time as you talk",
    statusOptions: {
      open: "Open",
      inProgress: "In Progress",
      pending: "Pending",
      resolved: "Resolved",
    },
    priorityOptions: {
      low: "Low",
      medium: "Medium",
      high: "High",
      urgent: "Urgent",
    },
    validationMessages: {
      fillRequired: "Please fill in all required fields",
      speechNotSupported: "Speech recognition is not supported in this browser",
      categoryRequired: "Please select or add a category",
    }
  },
  "hi-IN": {
    heading: "नया मुद्दा जोड़ें",
    issuePlaceholder: "समस्या का विवरण",
    locationPlaceholder: "स्थान",
    assistantPlaceholder: "सहायक का नाम",
    categoryPlaceholder: "श्रेणी चुनें",
    newCategoryPlaceholder: "नई श्रेणी का नाम दर्ज करें",
    cancel: "रद्द करें",
    addIssue: "समस्या जोड़ें",
    statusLabel: "स्थिति",
    priorityLabel: "प्राथमिकता",
    categoryLabel: "श्रेणी",
    languageLabel: "भाषा",
    addNewCategory: "नई श्रेणी जोड़ें",
    speakingIndicator: "बोल रहे हैं...",
    listeningFor: "सुन रहे हैं",
    speakNow: "अब बोलें - जैसे ही आप बोलेंगे टेक्स्ट दिखेगा",
    statusOptions: {
      open: "खुला",
      inProgress: "प्रगति में",
      pending: "लंबित",
      resolved: "समाधान",
    },
    priorityOptions: {
      low: "कम",
      medium: "मध्यम",
      high: "उच्च",
      urgent: "अत्यावश्यक",
    },
    validationMessages: {
      fillRequired: "कृपया सभी आवश्यक फील्ड भरें",
      speechNotSupported: "इस ब्राउज़र में वाक् पहचान समर्थित नहीं है",
      categoryRequired: "कृपया एक श्रेणी चुनें या जोड़ें",
    }
  },
  // ... other languages remain the same
};

const AddNewIssueModal = ({ isOpen, onClose, onAddIssue }) => {
  const [loading, setLoading] = useState(false);
  const [activeVoiceField, setActiveVoiceField] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [categories, setCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]); // For assistant dropdown
  const [formData, setFormData] = useState({
    title: "", // Changed from 'issue' to 'title' to match API schema
    description: "", // Added description field
    status: "Open", // Default status
    priority: "Medium", // Default priority  
    location: "",
    assigned_to: null, // Will store user ID, not name
    category_id: "",
    latitude: null, // For geolocation
    longitude: null, // For geolocation
    documents: [], // Array to store uploaded documents
  });

  // Get current language labels
  const currentLabels = labels[selectedLanguage] || labels["en-US"];

  // Speech-to-text hooks for different fields
  const titleVoice = useSpeechToText(selectedLanguage);
  const descriptionVoice = useSpeechToText(selectedLanguage);
  const locationVoice = useSpeechToText(selectedLanguage);

  // RTK Query hooks for creating issues
  const [createCitizenIssue, { isLoading: isCreating }] = useCreateCitizenIssueMutation();

  // Fetch categories and users when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchUsers();
      getCurrentLocation(); // Get user's location
    }
  }, [isOpen]);

  // Update language for all voice instances when language changes
  useEffect(() => {
    titleVoice.changeLanguage(selectedLanguage);
    descriptionVoice.changeLanguage(selectedLanguage);
    locationVoice.changeLanguage(selectedLanguage);
  }, [selectedLanguage]);

  // Update form data when speech transcripts change - Real-time updates using clean transcript
  useEffect(() => {
    if (activeVoiceField === 'title') {
      setFormData(prev => ({ ...prev, title: titleVoice.transcript }));
    }
  }, [titleVoice.transcript, activeVoiceField]);

  useEffect(() => {
    if (activeVoiceField === 'description') {
      setFormData(prev => ({ ...prev, description: descriptionVoice.transcript }));
    }
  }, [descriptionVoice.transcript, activeVoiceField]);

  useEffect(() => {
    if (activeVoiceField === 'location') {
      setFormData(prev => ({ ...prev, location: locationVoice.transcript }));
    }
  }, [locationVoice.transcript, activeVoiceField]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllVoiceInputs();
    };
  }, []);

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
        },
        (error) => {
          console.warn("Could not get location:", error);
        }
      );
    }
  };

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      // This part of the code was removed as per the edit hint.
      // The original code had a call to citizenIssuesAPI.getCategories().
      // Since the API file was deleted, this function is now effectively a placeholder.
      // For now, we'll set default categories if no API call is made.
      setCategories([
        { id: "1", name: "Infrastructure" },
        { id: "2", name: "Public Safety" },
        { id: "3", name: "Environment" },
        { id: "4", name: "Transportation" },
        { id: "5", name: "Utilities" },
      ]);
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Set default categories if API fails
      setCategories([
        { id: "1", name: "Infrastructure" },
        { id: "2", name: "Public Safety" },
        { id: "3", name: "Environment" },
        { id: "4", name: "Transportation" },
        { id: "5", name: "Utilities" },
      ]);
    }
  };

  // Fetch users for assistant assignment
  const fetchUsers = async () => {
    try {
      // This part of the code was removed as per the edit hint.
      // The original code had a call to citizenIssuesAPI.getUsers().
      // Since the API file was deleted, this function is now effectively a placeholder.
      // For now, we'll set default users if no API call is made.
      setAvailableUsers([
        { id: 1, name: "John Doe", email: "john.doe@example.com" },
        { id: 2, name: "Jane Smith", email: "jane.smith@example.com" },
      ]);
    } catch (error) {
      console.error("Error fetching users:", error);
      setAvailableUsers([]);
    }
  };

  // Add new category
  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) return;

    setAddingCategory(true);
    try {
      // For now, we'll add it locally since we don't have a direct category creation endpoint
      // In a full implementation, you'd call the issue-categories API
      const newCategory = {
        id: Date.now().toString(),
        name: newCategoryName.trim(),
        description: ""
      };
      
      // Add the new category to the list
      setCategories(prev => [...prev, newCategory]);
      
      // Select the newly created category
      setFormData(prev => ({ ...prev, category_id: newCategory.id }));
      
      // Reset and hide the add category form
      setNewCategoryName("");
      setShowAddCategory(false);
      
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category");
    } finally {
      setAddingCategory(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'assigned_to' ? (value ? parseInt(value) : null) : value 
    }));
  };

  // Handle document upload
  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    const newDocuments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      uploadedAt: new Date().toISOString()
    }));
    
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...newDocuments]
    }));
  };

  // Handle document removal
  const handleDocumentRemove = (documentId) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== documentId)
    }));
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    // Stop all voice inputs when changing language
    stopAllVoiceInputs();
  };

  const handleVoiceToggle = (field) => {
    // Check if speech recognition is supported
    const voiceInstance = field === 'title' ? titleVoice : 
                         field === 'description' ? descriptionVoice :
                         field === 'location' ? locationVoice : null;
    
    if (!voiceInstance || !voiceInstance.isSupported) {
      alert(currentLabels.validationMessages.speechNotSupported);
      return;
    }

    // Stop all other voice inputs first
    if (activeVoiceField && activeVoiceField !== field) {
      stopAllVoiceInputs();
    }

    switch (field) {
      case 'title':
        if (titleVoice.isListening) {
          titleVoice.stopListening();
          setActiveVoiceField(null);
        } else {
          titleVoice.resetTranscript();
          titleVoice.startListening();
          setActiveVoiceField('title');
        }
        break;
      case 'description':
        if (descriptionVoice.isListening) {
          descriptionVoice.stopListening();
          setActiveVoiceField(null);
        } else {
          descriptionVoice.resetTranscript();
          descriptionVoice.startListening();
          setActiveVoiceField('description');
        }
        break;
      case 'location':
        if (locationVoice.isListening) {
          locationVoice.stopListening();
          setActiveVoiceField(null);
        } else {
          locationVoice.resetTranscript();
          locationVoice.startListening();
          setActiveVoiceField('location');
        }
        break;
    }
  };

  const stopAllVoiceInputs = () => {
    titleVoice.stopListening();
    descriptionVoice.stopListening();
    locationVoice.stopListening();
    setActiveVoiceField(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.location || !formData.status || !formData.priority || !formData.category_id) {
      alert(currentLabels.validationMessages.fillRequired);
      return;
    }

    setLoading(true);
    stopAllVoiceInputs();

    // Prepare payload for backend according to CitizenIssueCreate schema
    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || "", // Optional
      status: formData.status,
      priority: formData.priority,
      location: formData.location.trim(),
      assigned_to: formData.assigned_to, // User ID or null
      category_id: formData.category_id, // Keep as string for UUID
      latitude: formData.latitude,
      longitude: formData.longitude,
      // created_by will be automatically set by the backend from the authenticated user
    };

    try {
      // Use the citizen issues API
      const createdIssue = await createCitizenIssue(payload).unwrap();
      
      // Show success message
      alert("Issue added successfully!");
      
      // Call parent callback with the created issue
      if (onAddIssue) {
        onAddIssue(createdIssue);
      }
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        status: "Open",
        priority: "Medium",
        location: "",
        assigned_to: null,
        category_id: "",
        latitude: null,
        longitude: null,
        documents: [],
      });
      
      // Reset voice transcripts
      titleVoice.resetTranscript();
      descriptionVoice.resetTranscript();
      locationVoice.resetTranscript();
      
      setLoading(false);
      onClose();
      
    } catch (error) {
      console.error("Add Issue Error:", error);
      
      // Handle different error types
      let errorMessage = "Failed to add issue";
      if (error.response?.status === 422) {
        errorMessage = "Please check all required fields";
      } else if (error.response?.status === 403) {
        errorMessage = "You don't have permission to add issues";
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      alert(errorMessage);
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return; // Prevent closing while loading
    
    stopAllVoiceInputs();
    
    // Reset form when closing
    setFormData({
      title: "",
      description: "",
      status: "Open",
      priority: "Medium",
      location: "",
      assigned_to: null,
      category_id: "",
      latitude: null,
      longitude: null,
      documents: [],
    });
    
    // Reset category-related state
    setShowAddCategory(false);
    setNewCategoryName("");
    
    // Reset all voice transcripts
    titleVoice.resetTranscript();
    descriptionVoice.resetTranscript();
    locationVoice.resetTranscript();
    
    onClose();
  };

  const getFieldPlaceholderText = (field) => {
    const fieldNames = {
      title: "issue title",
      description: "issue description",
      location: "location"
    };
    return fieldNames[field] || field;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-lg bg-opacity-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 border border-gray-100 relative max-h-[90vh] overflow-y-auto">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20 rounded-2xl">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-2"></div>
              <span className="text-sm text-gray-600">Adding issue...</span>
            </div>
          </div>
        )}

        <div className="relative">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-100 rounded-full mb-4">
              <FaPlusCircle className="text-teal-600 text-lg" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">
              {currentLabels.heading}
            </h2>
          </div>

          {/* Language Selection */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FaLanguage size={14} className="text-gray-500" />
              {currentLabels.languageLabel}
            </label>
            <select
              value={selectedLanguage}
              onChange={handleLanguageChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 focus:ring-2 focus:ring-teal-300 focus:border-teal-300"
            >
              {Object.entries(languages).map(([code, lang]) => (
                <option key={code} value={code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Issue Title with Voice Input */}
              <div className="relative">
                <input
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder={currentLabels.issuePlaceholder}
                  required
                  className="w-full px-4 py-3 pr-20 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-300 focus:border-teal-300 bg-gray-50 placeholder-gray-500"
                />
                <div className="absolute top-3 right-12 text-gray-400">
                  <FaTasks size={16} />
                </div>
                {titleVoice.isSupported && (
                  <button
                    type="button"
                    onClick={() => handleVoiceToggle('title')}
                    className={`absolute top-3 right-3 p-1 rounded-full transition-colors ${
                      titleVoice.isListening 
                        ? 'text-red-500 bg-red-100 animate-pulse' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {titleVoice.isListening ? <FaMicrophoneSlash size={16} /> : <FaMicrophone size={16} />}
                  </button>
                )}
              </div>

              {/* Issue Description with Voice Input */}
              <div className="relative">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Detailed description (optional)"
                  rows={3}
                  className="w-full px-4 py-3 pr-20 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-300 focus:border-teal-300 bg-gray-50 placeholder-gray-500 resize-none"
                />
                <div className="absolute top-3 right-12 text-gray-400">
                  <FaTasks size={16} />
                </div>
                {descriptionVoice.isSupported && (
                  <button
                    type="button"
                    onClick={() => handleVoiceToggle('description')}
                    className={`absolute top-3 right-3 p-1 rounded-full transition-colors ${
                      descriptionVoice.isListening 
                        ? 'text-red-500 bg-red-100 animate-pulse' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {descriptionVoice.isListening ? <FaMicrophoneSlash size={16} /> : <FaMicrophone size={16} />}
                  </button>
                )}
              </div>

              {/* Category Selection */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FaTags size={14} className="text-gray-500" />
                  {currentLabels.categoryLabel}
                </label>
                <div className="space-y-3">
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 focus:ring-2 focus:ring-teal-300 focus:border-teal-300"
                  >
                    <option value="" disabled>{currentLabels.categoryPlaceholder}</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  
                  {/* Add New Category Button */}
                  {!showAddCategory && (
                    <button
                      type="button"
                      onClick={() => setShowAddCategory(true)}
                      className="w-full px-4 py-3 border-2 border-dashed border-teal-300 text-teal-600 rounded-xl hover:bg-teal-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaPlus size={14} />
                      {currentLabels.addNewCategory}
                    </button>
                  )}
                  
                  {/* Add New Category Form */}
                  {showAddCategory && (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder={currentLabels.newCategoryPlaceholder}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-300 focus:border-teal-300"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddNewCategory();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddNewCategory}
                          disabled={!newCategoryName.trim() || addingCategory}
                          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          {addingCategory ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <span>+</span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddCategory(false);
                            setNewCategoryName("");
                          }}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Location with Voice Input */}
              <div className="relative">
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder={currentLabels.locationPlaceholder}
                  required
                  className="w-full px-4 py-3 pr-20 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-300 focus:border-teal-300 bg-gray-50 placeholder-gray-500"
                />
                <div className="absolute top-3 right-12 text-gray-400">
                  <FaMapMarkerAlt size={16} />
                </div>
                {locationVoice.isSupported && (
                  <button
                    type="button"
                    onClick={() => handleVoiceToggle('location')}
                    className={`absolute top-3 right-3 p-1 rounded-full transition-colors ${
                      locationVoice.isListening 
                        ? 'text-red-500 bg-red-100 animate-pulse' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {locationVoice.isListening ? <FaMicrophoneSlash size={16} /> : <FaMicrophone size={16} />}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaTasks size={14} className="text-gray-500" />
                    {currentLabels.statusLabel}
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 focus:ring-2 focus:ring-teal-300 focus:border-teal-300"
                  >
                    <option value="Open">{currentLabels.statusOptions.open}</option>
                    <option value="In Progress">{currentLabels.statusOptions.inProgress}</option>
                    <option value="Pending">{currentLabels.statusOptions.pending}</option>
                    <option value="Resolved">{currentLabels.statusOptions.resolved}</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaFlag size={14} className="text-gray-500" />
                    {currentLabels.priorityLabel}
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 focus:ring-2 focus:ring-teal-300 focus:border-teal-300"
                  >
                    <option value="Low">{currentLabels.priorityOptions.low}</option>
                    <option value="Medium">{currentLabels.priorityOptions.medium}</option>
                    <option value="High">{currentLabels.priorityOptions.high}</option>
                    <option value="Urgent">{currentLabels.priorityOptions.urgent}</option>
                  </select>
                </div>
              </div>

              {/* Assistant Assignment */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FaUser size={14} className="text-gray-500" />
                  {currentLabels.assistantPlaceholder}
                </label>
                <select
                  name="assigned_to"
                  value={formData.assigned_to || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 focus:ring-2 focus:ring-teal-300 focus:border-teal-300"
                >
                  <option value="">Unassigned</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Document Upload */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FaFileUpload size={14} className="text-gray-500" />
                  Upload Documents
                </label>
                <div className="space-y-3">
                  {/* File Upload Input */}
                  <div className="relative">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                      onChange={handleDocumentUpload}
                      className="hidden"
                      id="document-upload"
                    />
                    <label
                      htmlFor="document-upload"
                      className="w-full px-4 py-3 border-2 border-dashed border-teal-300 text-teal-600 rounded-xl hover:bg-teal-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FaFileUpload size={16} />
                      <span>Choose files or drag and drop</span>
                    </label>
                  </div>

                  {/* Uploaded Documents List */}
                  {formData.documents.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Uploaded Documents:</p>
                      {formData.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center gap-3">
                            <FaFile size={16} className="text-blue-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">{doc.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDocumentRemove(doc.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Voice Input Status Indicator */}
              {activeVoiceField && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-blue-700">
                    <FaMicrophone className="animate-pulse" />
                    <span className="text-sm font-medium">
                      {currentLabels.listeningFor} {getFieldPlaceholderText(activeVoiceField)}
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    {currentLabels.speakNow}
                  </p>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentLabels.cancel}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <FaPlusCircle size={16} />
                      {currentLabels.addIssue}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddNewIssueModal;