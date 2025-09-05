import { useState, useEffect, useCallback, useMemo } from "react";
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
  FaTimes,
  FaCheckCircle,
  FaInfoCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import useSpeechToText from "../../hooks/useSpeechToText";
import { useCreateCitizenIssueMutation } from "../../store/api/appApi";
import { 
  useGetIssueCategoriesQuery, 
  useGetAreasQuery, 
  useGetAvailableUsersQuery 
} from "../../store/api/appApi";
import { useAuth } from "../../hooks/useAuth";
import { useIssuePermissions } from "../../utils/permissions";

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
    action_taken: "", // Action taken field
    documents: [], // Array to store uploaded documents
  });

  // Get current language labels
  const currentLabels = labels[selectedLanguage] || labels["en-US"];

  // Speech-to-text hooks for different fields
  const titleVoice = useSpeechToText(selectedLanguage);
  const descriptionVoice = useSpeechToText(selectedLanguage);
  const locationVoice = useSpeechToText(selectedLanguage);

  // Authentication and RTK Query hooks
  const { isAuthenticated, user, hasRole, isSuperAdmin, isTenantAdmin, isFieldAgent } = useAuth();
  const [createCitizenIssue, { isLoading: isCreating }] = useCreateCitizenIssueMutation();

  // Use centralized permissions
  const {
    canCreateIssue,
    canAssignIssue,
    canSetIssuePriority,
    canSetIssueStatus,
  } = useIssuePermissions();

  // Filter priority options based on user permissions
  const availablePriorityOptions = useMemo(() => {
    if (canSetIssuePriority("High")) {
      return ["Low", "Medium", "High", "Urgent"];
    }
    return ["Low", "Medium"];
  }, [canSetIssuePriority]);

  // Filter status options based on user permissions
  const availableStatusOptions = useMemo(() => {
    if (canSetIssueStatus("In Progress")) {
      return ["Open", "In Progress", "Pending", "Resolved"];
    }
    return ["Open"];
  }, [canSetIssueStatus]);

  // Check if user can access this modal
  useEffect(() => {
    if (isOpen) {
      if (!isAuthenticated) {
        alert("Please log in to create issues");
        onClose();
        return;
      }
      if (!canCreateIssue()) {
        alert("You don't have permission to create issues");
        onClose();
        return;
      }
    }
  }, [isOpen, isAuthenticated, canCreateIssue, onClose]);

  // Fetch categories and users when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchUsers();
      getCurrentLocation(); // Get user's location
      
      // Auto-fill assigned_to for Field Agents
      if (isFieldAgent() && user?.id) {
        setFormData(prev => ({ ...prev, assigned_to: user.id }));
      }
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
      const response = await fetch('http://localhost:8000/citizen-issues/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        throw new Error('Failed to fetch categories');
      }
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

  // Fetch users for assistant assignment - Role-based filtering
  const fetchUsers = async () => {
    try {
      // Get auth token from localStorage or context
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      console.log("🔍 Fetching users for assistant assignment...");
      console.log("User role:", user?.role);
      console.log("Is Field Agent:", isFieldAgent());
      console.log("Is Admin:", isTenantAdmin());
      console.log("Token available:", !!token);
      
      if (!token) {
        console.warn("No auth token found, skipping user fetch");
        setAvailableUsers([]);
        return;
      }
      
      // Determine which endpoint to use based on user role
      let endpoint = 'http://localhost:8000/citizen-issues/users';
      
      // If user is Field Agent, they can only assign to themselves
      if (isFieldAgent()) {
        setAvailableUsers([user]); // Only show current user
        return;
      }
      
      // If user is Admin, fetch all Field Agents in their tenant
      if (isTenantAdmin()) {
        endpoint = `http://localhost:8000/citizen-issues/users?role=field_agent&tenant_id=${user?.tenant_id}`;
      }
      
      // If user is Super Admin, fetch all users
      if (isSuperAdmin()) {
        endpoint = 'http://localhost:8000/citizen-issues/users';
      }
      
      console.log("Using endpoint:", endpoint);
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Users fetched successfully:", data);
        
        // Filter users based on role if needed
        let filteredUsers = data;
        if (isTenantAdmin()) {
          // For tenant admins, only show Field Agents in their tenant
          filteredUsers = data.filter(user => 
            user.role && (
              user.role.toLowerCase().includes('field_agent') || 
              user.role.toLowerCase().includes('fieldagent') ||
              user.role.toLowerCase().includes('assistant')
            )
          );
        }
        
        setAvailableUsers(filteredUsers);
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch users. Status:", response.status, "Error:", errorText);
        throw new Error(`Failed to fetch users: ${response.status} - ${errorText}`);
      }
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
    
    if (name === 'assigned_to') {
      if (value === 'manual') {
        // Prompt user to enter assistant name manually
        const assistantName = prompt('Enter assistant name:');
        if (assistantName) {
          setFormData(prev => ({ 
            ...prev, 
            assigned_to: assistantName // Store as string for manual entry
          }));
        }
        return;
      } else if (value === 'self') {
        // Get current user info from localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        setFormData(prev => ({ 
          ...prev, 
          assigned_to: currentUser.id || 'self'
        }));
        return;
      }
    }
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: value // Keep as string, don't convert to integer
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
    
    // Authentication check before submission
    if (!isAuthenticated) {
      alert("Please log in to create issues");
      return;
    }
    
    // Permission check before submission
    if (!canCreateIssue()) {
      alert("You don't have permission to create issues");
      return;
    }

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
      assigned_to: formData.assigned_to, // User ID or null (already string)
      category_id: formData.category_id, // Keep as string for UUID
      latitude: formData.latitude,
      longitude: formData.longitude,
      action_taken: formData.action_taken.trim() || null, // Action taken field
      // created_by will be automatically set by the backend from the authenticated user
      // documents are not part of the CitizenIssueCreate schema, so exclude them
    };

    console.log("🔍 Sending payload to backend:", payload);
    console.log("🔍 Form data:", formData);
    console.log("🔍 Documents excluded:", !payload.hasOwnProperty('documents'));

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
        action_taken: "",
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
      
      // Handle different error types with better messages
      let errorMessage = "Failed to add issue";
      if (error.status === 422 || error.data?.status === 422) {
        errorMessage = "Please check all required fields";
      } else if (error.status === 403 || error.data?.status === 403) {
        errorMessage = "You don't have permission to add issues";
      } else if (error.status === 401 || error.data?.status === 401) {
        errorMessage = "Please log in to create issues";
        // Clear any invalid tokens
        localStorage.removeItem('accessToken');
        sessionStorage.removeItem('accessToken');
        // Optionally redirect to login or refresh auth state
        window.location.reload();
      } else if (error.data?.detail) {
        errorMessage = error.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
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
      action_taken: "",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Enhanced backdrop with blur and animation */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300" />
      
      {/* Modal container with enhanced styling */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-2xl lg:max-w-4xl max-h-[95vh] overflow-hidden border border-gray-100 transform transition-all duration-300 scale-100">
        {/* Enhanced header with gradient background */}
        <div className="relative bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 text-white p-4 sm:p-6 lg:p-8">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-white/10 rounded-full -translate-y-8 sm:-translate-y-16 translate-x-8 sm:translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-white/5 rounded-full translate-y-8 sm:translate-y-12 -translate-x-8 sm:-translate-x-12"></div>
          
          {/* Close button */}
          <button
            onClick={handleClose}
            disabled={loading}
            className="absolute top-3 sm:top-4 lg:top-6 right-3 sm:right-4 lg:right-6 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 text-white hover:scale-110"
          >
            <FaTimes size={18} className="sm:w-5 sm:h-5" />
          </button>

          {/* Header content */}
          <div className="text-center relative z-10">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full mb-4 sm:mb-6 backdrop-blur-sm">
              <FaPlusCircle className="text-white text-lg sm:text-2xl" />
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
              {currentLabels.heading}
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-teal-100">
              Report a new community issue or grievance
            </p>
          </div>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-teal-100 rounded-full mb-4">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-4 border-teal-600 border-t-transparent"></div>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Creating Issue...</h3>
              <p className="text-sm sm:text-base text-gray-600">Please wait while we process your request</p>
            </div>
          </div>
        )}

        {/* Authentication Status */}
        {!isAuthenticated && (
          <div className="px-4 sm:px-6 lg:px-8 py-4 bg-red-50 border-b border-red-200">
            <div className="flex items-center justify-between text-red-700">
              <div className="flex items-center">
                <FaExclamationTriangle className="mr-2" />
                <span className="text-sm font-medium">
                  Please log in to create issues
                </span>
              </div>
              <button
                onClick={() => {
                  // You can add a login redirect here
                  alert("Please log in first");
                }}
                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
              >
                Login
              </button>
            </div>
          </div>
        )}

        {/* Form content */}
        <div className="p-4 sm:p-6 lg:p-8 max-h-[calc(95vh-200px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className={`space-y-6 sm:space-y-8 ${!isAuthenticated ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Language Selection - Enhanced */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100">
              <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FaLanguage size={16} className="text-teal-600" />
                {currentLabels.languageLabel}
              </label>
              <select
                value={selectedLanguage}
                onChange={handleLanguageChange}
                className="w-full px-3 sm:px-4 py-3 border border-gray-200 rounded-lg sm:rounded-xl bg-white text-gray-700 focus:ring-2 focus:ring-teal-300 focus:border-teal-300 transition-all duration-200 hover:border-teal-200"
              >
                {Object.entries(languages).map(([code, lang]) => (
                  <option key={code} value={code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Main Form Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Issue Title */}
                <div className="group">
                  <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FaTasks size={16} className="text-teal-600" />
                    Issue Title
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      name="title"
                      type="text"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter a clear, descriptive title"
                      required
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 pr-16 sm:pr-20 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-teal-300 focus:border-teal-300 bg-white placeholder-gray-400 transition-all duration-200 group-hover:border-teal-200"
                    />
                    <div className="absolute top-3 sm:top-4 right-12 sm:right-12 text-gray-400">
                      <FaTasks size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </div>
                    {titleVoice.isSupported && (
                      <button
                        type="button"
                        onClick={() => handleVoiceToggle('title')}
                        className={`absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 sm:p-2 rounded-full transition-all duration-200 ${
                          titleVoice.isListening 
                            ? 'text-red-500 bg-red-100 shadow-lg scale-110' 
                            : 'text-gray-400 hover:text-teal-600 hover:bg-teal-50'
                        }`}
                      >
                        {titleVoice.isListening ? <FaMicrophoneSlash size={14} className="sm:w-4 sm:h-4" /> : <FaMicrophone size={14} className="sm:w-4 sm:h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Issue Description */}
                <div className="group">
                  <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FaFile size={16} className="text-teal-600" />
                    Description
                  </label>
                  <div className="relative">
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Provide detailed information about the issue..."
                      rows={3}
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 pr-16 sm:pr-20 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-teal-300 focus:border-teal-300 bg-white placeholder-gray-400 resize-none transition-all duration-200 group-hover:border-teal-200"
                    />
                    <div className="absolute top-3 sm:top-4 right-12 sm:right-12 text-gray-400">
                      <FaFile size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </div>
                    {descriptionVoice.isSupported && (
                      <button
                        type="button"
                        onClick={() => handleVoiceToggle('description')}
                        className={`absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 sm:p-2 rounded-full transition-all duration-200 ${
                          descriptionVoice.isListening 
                            ? 'text-red-500 bg-red-100 shadow-lg scale-110' 
                            : 'text-gray-400 hover:text-teal-600 hover:bg-teal-50'
                        }`}
                      >
                        {descriptionVoice.isListening ? <FaMicrophoneSlash size={14} className="sm:w-4 sm:h-4" /> : <FaMicrophone size={14} className="sm:w-4 sm:h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Action Taken Field */}
                <div className="group">
                  <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FaTasks size={16} className="text-teal-600" />
                    Action Taken (Optional)
                  </label>
                  <div className="relative">
                    <textarea
                      name="action_taken"
                      value={formData.action_taken}
                      onChange={handleChange}
                      placeholder="Describe any actions already taken to address this issue..."
                      rows={2}
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-teal-300 focus:border-teal-300 bg-white placeholder-gray-400 resize-none transition-all duration-200 group-hover:border-teal-200"
                    />
                  </div>
                </div>

                {/* Category Selection */}
                <div className="group">
                  <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FaTags size={16} className="text-teal-600" />
                    {currentLabels.categoryLabel}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      required
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl bg-white text-gray-700 focus:ring-2 focus:ring-teal-300 focus:border-teal-300 transition-all duration-200 group-hover:border-teal-200"
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
                        className="w-full px-3 sm:px-4 py-3 border-2 border-dashed border-teal-300 text-teal-600 rounded-lg sm:rounded-xl hover:bg-teal-50 transition-all duration-200 flex items-center justify-center gap-2 group-hover:border-teal-400 group-hover:bg-teal-50"
                      >
                        <FaPlus size={14} className="sm:w-4 sm:h-4" />
                        {currentLabels.addNewCategory}
                      </button>
                    )}
                    
                    {/* Add New Category Form */}
                    {showAddCategory && (
                      <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-teal-200">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                          <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder={currentLabels.newCategoryPlaceholder}
                            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-300 focus:border-teal-300 bg-white"
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
                            className="px-4 sm:px-6 py-2 sm:py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200 hover:scale-105"
                          >
                            {addingCategory ? (
                              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                            ) : (
                              <FaCheckCircle size={14} className="sm:w-4 sm:h-4" />
                            )}
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddCategory(false);
                              setNewCategoryName("");
                            }}
                            className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all duration-200"
                          >
                            <FaTimes size={14} className="sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Location */}
                <div className="group">
                  <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FaMapMarkerAlt size={16} className="text-teal-600" />
                    Location
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Enter the issue location"
                      required
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 pr-16 sm:pr-20 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-teal-300 focus:border-teal-300 bg-white placeholder-gray-400 transition-all duration-200 group-hover:border-teal-200"
                    />
                    <div className="absolute top-3 sm:top-4 right-12 sm:right-12 text-gray-400">
                      <FaMapMarkerAlt size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </div>
                    {locationVoice.isSupported && (
                      <button
                        type="button"
                        onClick={() => handleVoiceToggle('location')}
                        className={`absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 sm:p-2 rounded-full transition-all duration-200 ${
                          locationVoice.isListening 
                            ? 'text-red-500 bg-red-100 shadow-lg scale-110' 
                            : 'text-gray-400 hover:text-teal-600 hover:bg-teal-50'
                        }`}
                      >
                        {locationVoice.isListening ? <FaMicrophoneSlash size={14} className="sm:w-4 sm:h-4" /> : <FaMicrophone size={14} className="sm:w-4 sm:h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Status and Priority Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Status */}
                  <div className="group">
                    <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <FaTasks size={16} className="text-teal-600" />
                      {currentLabels.statusLabel}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl bg-white text-gray-700 focus:ring-2 focus:ring-teal-300 focus:border-teal-300 transition-all duration-200 group-hover:border-teal-200"
                    >
                      {availableStatusOptions.map((status) => (
                        <option key={status} value={status}>
                          {currentLabels.statusOptions[status.toLowerCase().replace(/\s+/g, '')] || status}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority */}
                  <div className="group">
                    <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <FaFlag size={16} className="text-teal-600" />
                      {currentLabels.priorityLabel}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      required
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl bg-white text-gray-700 focus:ring-2 focus:ring-teal-300 focus:border-teal-300 transition-all duration-200 group-hover:border-teal-200"
                    >
                      {availablePriorityOptions.map((priority) => (
                        <option key={priority} value={priority}>
                          {currentLabels.priorityOptions[priority.toLowerCase()] || priority}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Assistant Assignment - Role-based */}
                <div className="group">
                  <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FaUser size={16} className="text-teal-600" />
                    {isFieldAgent() ? "Assigned To (You)" : "Assign To Field Agent"}
                  </label>
                  
                  {isFieldAgent() ? (
                    // Field Agent sees their own name (read-only)
                    <div className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl bg-gray-50 text-gray-700">
                      {user?.name || user?.email || "Your Name"}
                      <span className="ml-2 text-xs text-gray-500">(Auto-assigned)</span>
                    </div>
                  ) : (
                    // Admin/Super Admin sees dropdown of available Field Agents
                    <select
                      name="assigned_to"
                      value={formData.assigned_to || ""}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl bg-white text-gray-700 focus:ring-2 focus:ring-teal-300 focus:border-teal-300 transition-all duration-200 group-hover:border-teal-200"
                    >
                      <option value="">Select Field Agent</option>
                      {availableUsers.length > 0 ? (
                        availableUsers.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name || user.email} {user.role ? `(${user.role})` : ''}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="manual">Enter manually</option>
                          <option value="self">Assign to self</option>
                        </>
                      )}
                    </select>
                  )}
                  
                  {/* Debug info - Enhanced styling */}
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-blue-700 text-sm">
                      <FaInfoCircle size={14} />
                      <span className="font-medium">System Info:</span>
                    </div>
                    <div className="mt-2 text-xs text-blue-600 space-y-1">
                      <div>User Role: {user?.role || 'Unknown'}</div>
                      <div>Is Field Agent: {isFieldAgent() ? 'Yes' : 'No'}</div>
                      <div>Is Admin: {isTenantAdmin() ? 'Yes' : 'No'}</div>
                      <div>Available users: {availableUsers.length}</div>
                      <div>Selected: {formData.assigned_to || 'None'}</div>
                      <div>Token: {localStorage.getItem('accessToken') ? 'Present' : 'Missing'}</div>
                    </div>
                    {availableUsers.length === 0 && !isFieldAgent() && (
                      <div className="mt-2 text-xs text-yellow-600 flex items-center gap-1">
                        <FaExclamationTriangle size={12} />
                        No Field Agents found. Check console for errors.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Document Upload Section */}
            <div className="bg-gradient-to-r from-gray-50 to-purple-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100">
              <label className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <FaFileUpload size={18} className="text-purple-600" />
                Upload Supporting Documents
              </label>
              <div className="space-y-4">
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
                    className="w-full px-4 sm:px-6 py-4 sm:py-6 border-2 border-dashed border-purple-300 text-purple-600 rounded-lg sm:rounded-xl hover:bg-purple-50 transition-all duration-200 flex flex-col items-center justify-center gap-2 sm:gap-3 cursor-pointer group hover:border-purple-400"
                  >
                    <FaFileUpload size={20} className="sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-medium text-sm sm:text-base">Choose files or drag and drop</span>
                    <span className="text-xs sm:text-sm text-purple-500">PDF, DOC, Images, Text files supported</span>
                  </label>
                </div>

                {/* Uploaded Documents List */}
                {formData.documents.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">Uploaded Documents:</p>
                    <div className="grid gap-3">
                      {formData.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <FaFile size={14} className="sm:w-4 sm:h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">{doc.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDocumentRemove(doc.id)}
                            className="text-red-500 hover:text-red-700 p-1.5 sm:p-2 rounded-full hover:bg-red-50 transition-all duration-200"
                          >
                            <FaTrash size={12} className="sm:w-3.5 sm:h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Voice Input Status Indicator - Enhanced */}
            {activeVoiceField && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <div className="flex items-center gap-3 text-blue-700">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <FaMicrophone className="animate-pulse text-base sm:text-lg" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold">
                      {currentLabels.listeningFor} {getFieldPlaceholderText(activeVoiceField)}
                    </span>
                    <p className="text-xs text-blue-600 mt-1">
                      {currentLabels.speakNow}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Permission Info Display */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <FaInfoCircle className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Your Permissions:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Create Issues: {canCreateIssue() ? "✅ Allowed" : "❌ Not Allowed"}</li>
                    <li>• Assign to Users: {canAssignIssue({ tenant_id: user?.tenant_id }) ? "✅ Allowed" : "❌ Limited"}</li>
                    <li>• Set Priority: {canSetIssuePriority("High") ? "✅ All Levels" : "❌ Limited (Low/Medium)"}</li>
                    <li>• Set Status: {canSetIssueStatus("In Progress") ? "✅ All Statuses" : "❌ Limited (Open Only)"}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Form Actions - Enhanced */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-300 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {currentLabels.cancel}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg sm:rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                    <span>Creating Issue...</span>
                  </>
                ) : (
                  <>
                    <FaPlusCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
                    {currentLabels.addIssue}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddNewIssueModal;