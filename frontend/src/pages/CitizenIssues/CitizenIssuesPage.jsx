import { useState, useEffect, useMemo, useCallback } from "react";
import IssueTable from "./IssueTable";
import ExportCSVButton from "./ExportCSVButton";
import AddNewIssueModal from "./AddNewIssueModal";
import StatusToggle from "./StatusToggle";
import { useLanguage } from "../../context/LanguageContext";
import Toast from "../../components/Toast";
import { useAuth } from "../../hooks/useAuth";
import { useGetCitizenIssuesQuery, useDeleteCitizenIssueMutation } from "../../store/api/appApi";

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

const fallbackTranslations = {
  pageTitle: { hi: "नागरिक समस्याएँ", ta: "பொதுமக்களின் பிரச்சனைகள்", bn: "নাগরিক সমস্যাসমূহ", mr: "नागरिक समस्या" },
  subtitle: { hi: "समुदाय की समस्याओं का प्रबंधन और ट्रैक करें", ta: "சமுதாய சிக்கல்களை நிர்வகித்து கண்காணிக்கவும்", bn: "সম্প্রদায় সমস্যা পরিচালনা করুন", mr: "समुदायातील समस्यांचे व्यवस्थापन करा" },
  total: { hi: "कुल समस्याएँ", ta: "மொத்த பிரச்சனைகள்", bn: "মোট সমস্যা", mr: "एकूण समस्या" },
  open: { hi: "खुला", ta: "திறந்த", bn: "খোলা", mr: "उघडे" },
  urgent: { hi: "अत्यावश्यक", ta: "அவசரம்", bn: "জরুরি", mr: "तातडीचे" },
  showing: { hi: "दिखा रहा है", ta: "காண்பித்தல்", bn: "দেখানো হচ্ছে", mr: "दाখवत आहे" },
  of: { hi: "में से", ta: "இல்", bn: "এর", mr: "पैकी" },
  noIssuesFound: { hi: "कोई समस्या नहीं मिली", ta: "எந்த பிரச்சனையும் இல்லை", bn: "কোনো সমস্যা পাওয়া যায়নি", mr: "कोणतीही समस्या आढळली नाही" },
  tryAdjusting: { hi: "फ़िल्टर समायोजित करें", ta: "வடிகட்டிகளைச் சரிசெய்யவும்", bn: "ফিল্টার সামঞ্জস্য করুন", mr: "फिल्टर समायोजित करणे" },
  getStarted: { hi: "अपनी पहली समस्या जोड़ें", ta: "முதல் பிரச்சனையைச் சேர்க்கவும்", bn: "প্রথম সমস্যা যোগ করুন", mr: "तुमची पहली समस्या जोडा" },
  clearFilters: { hi: "सभी फ़िल्टर साफ़ करें", ta: "அனைத்து வடிகட்டிகளை நீக்கவும்", bn: "সব ফিল্টার সাফ করুন", mr: "सर्व ফिल্টर हटवा" },
  addFirstIssue: { hi: "नई समस्या जोड़ें", ta: "புதிய பிரச்சனையைச் சேர்க்கவும்", bn: "নতুন সমস্যা যোগ করুন", mr: "नवीन समस्या जोडा" },
  lastUpdated: { hi: "अंतिम अद्यतन", ta: "கடைசியாக புதுப்பிக்கப்பட்டது", bn: "সর্বশেষ আপডেট", mr: "शेवटचे अद्यतन" },
  totalRecords: { hi: "कुल रिकॉर्ड", ta: "மொத்த பதிவுகள்", bn: "মোট রেকর্ড", mr: "एकूण नोंदी" },
  loading: { hi: "लोड हो रहा है...", ta: "ஏற்றுகிறது...", bn: "লোড হচ্ছে...", mr: "लोड होत आहे..." },
  errorLoading: { hi: "डेटा लोड करने में त्रुटि", ta: "தரவு ஏற்றுவதில் பிழை", bn: "ডেটা লোড করতে ত্রুটি", mr: "डेटा लोड करताना त्रुटी" },
  retry: { hi: "पुनः प्रयास करें", ta: "மீண்டும் முயற்சிக்கவும்", bn: "আবার চেষ্টা করুন", mr: "पुन्हा प्रयत्न करा" }
};

const defaultLabels = {
  pageTitle: "Citizen Issues",
  subtitle: "Manage and track community issues effectively",
  total: "Total Issues",
  open: "Open",
  urgent: "Urgent",
  showing: "Showing",
  of: "of",
  noIssuesFound: "No issues found",
  tryAdjusting: "Try adjusting your filters to see more results",
  getStarted: "Get started by adding your first issue",
  clearFilters: "Clear all filters",
  addFirstIssue: "Add First Issue",
  lastUpdated: "Last updated",
  totalRecords: "Total records",
  loading: "Loading...",
  errorLoading: "Error loading data",
  retry: "Retry"
};

const applyFilter = (data, filters) => {
  if (!Array.isArray(data)) return [];
  
  return data.filter((item) => {
    const statusMatch = filters.status === "All" || item.status === filters.status;
    const priorityMatch = filters.priority === "All" || item.priority === filters.priority;
    const searchMatch = !filters.search || 
      item.issue.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.location.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.assistant.toLowerCase().includes(filters.search.toLowerCase());
    return statusMatch && priorityMatch && searchMatch;
  });
};

const CitizenIssuesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [labels, setLabels] = useState(defaultLabels);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    location: '',
    assignedTo: '',
    search: ''
  });
  const [sortBy, setSortBy] = useState('reportedDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [toast, setToast] = useState(null);

  // RTK Query hooks
  const { 
    data: rawIssues = [], 
    isLoading: issuesLoading, 
    error: issuesError,
    refetch: refetchIssues 
  } = useGetCitizenIssuesQuery();

  const [deleteIssue, { isLoading: isDeleting }] = useDeleteCitizenIssueMutation();

  // Transform issues data
  const issuesData = useMemo(() => {
    if (!rawIssues || !Array.isArray(rawIssues)) return [];
    
    return transformIssueData(rawIssues);
  }, [rawIssues]);

  const { currentLang } = useLanguage();

  // Translation loading
  useEffect(() => {
    const loadTranslations = async () => {
      if (currentLang === "en") {
        setLabels(defaultLabels);
        return;
      }

      if (fallbackTranslations[Object.keys(fallbackTranslations)[0]][currentLang]) {
        const translatedLabels = {};
        Object.keys(defaultLabels).forEach((key) => {
          translatedLabels[key] = fallbackTranslations[key]?.[currentLang] || defaultLabels[key];
        });
        setLabels(translatedLabels);
        return;
      }

      setLabels(defaultLabels);
    };

    loadTranslations();
  }, [currentLang]);

  // Handle delete issue
  const handleDeleteIssue = async (issueId) => {
    try {
      await deleteIssue(issueId).unwrap();
      setToast({ 
        type: "success", 
        message: "Issue deleted successfully" 
      });
    } catch (error) {
      console.error('Error deleting issue:', error);
      setToast({ 
        type: "error", 
        message: `Failed to delete issue: ${error.message}` 
      });
    }
  };

  // Filter issues based on selected status
  const filteredIssues = useMemo(() => {
    if (!Array.isArray(issuesData)) return [];
    
    if (filters.status === "All") {
      return issuesData;
    }
    
    return issuesData.filter(issue => issue.status === filters.status);
  }, [issuesData, filters.status]);

  // Use filtered issues data
  const allIssues = useMemo(() => {
    return filteredIssues || [];
  }, [filteredIssues]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = (issuesData || []).length;
    const open = (issuesData || []).filter((i) => i.status === "Open").length;
    const urgent = (issuesData || []).filter((i) => i.priority === "Urgent").length;
    const inProgress = (issuesData || []).filter((i) => i.status === "In Progress").length;
    const pending = (issuesData || []).filter((i) => i.status === "Pending").length;
    const resolved = (issuesData || []).filter((i) => i.status === "Resolved").length;
    return { total, open, urgent, inProgress, pending, resolved };
  }, [issuesData]);

  // Handle issue creation
  const handleIssueCreated = useCallback(async (newIssueData) => {
    try {
      console.log('Creating new issue:', newIssueData);
      
      // Transform frontend data to API format
      // const apiData = transformIssueData.toAPI(newIssueData); // This line is no longer needed
      
      // Create the issue via API
      // const createdIssue = await citizenIssuesAPI.create(apiData); // This line is no longer needed
      
      console.log('Created issue response:', newIssueData); // Placeholder for actual API call
      
      // Show success message
      setToast({ type: "success", message: "Issue created successfully!" });
      
      // Close modal
      setShowAddModal(false);
      
      // Refresh the issues list
      await refetchIssues();
      
    } catch (error) {
      console.error('Error creating issue:', error);
      setToast({ 
        type: "error", 
        message: `Failed to create issue: ${error.message}` 
      });
    }
  }, [refetchIssues]);

  // Handle issue update
  const handleIssueUpdated = useCallback(async (issueId, updateData) => {
    try {
      console.log('Updating issue:', issueId, updateData);
      
      // Transform frontend data to API format
      // const apiData = transformIssueData.toAPI(updateData); // This line is no longer needed
      
      // Update the issue via API
      // const updatedIssue = await citizenIssuesAPI.update(issueId, apiData); // This line is no longer needed
      
      console.log('Updated issue response:', updateData); // Placeholder for actual API call
      
      // Show success message
      setToast({ type: "success", message: "Issue updated successfully!" });
      
      // Refresh the issues list
      await refetchIssues();
      
    } catch (error) {
      console.error('Error updating issue:', error);
      setToast({ 
        type: "error", 
        message: `Failed to update issue: ${error.message}` 
      });
    }
  }, [refetchIssues]);

  // Handle issue deletion
  const handleIssueDeleted = useCallback(async (issueId) => {
    try {
      console.log('Deleting issue:', issueId);
      
      // Delete the issue via API
      // await citizenIssuesAPI.delete(issueId); // This line is no longer needed
      
      // Show success message
      setToast({ type: "success", message: "Issue deleted successfully!" });
      
      // Refresh the issues list
      await refetchIssues();
      
    } catch (error) {
      console.error('Error deleting issue:', error);
      setToast({ 
        type: "error", 
        message: `Failed to delete issue: ${error.message}` 
      });
    }
  }, [refetchIssues]);



  // Loading state
  if (issuesLoading) {
    return (
      <div className="p-6 bg-white min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (issuesError) {
    return (
      <div className="p-6 bg-white min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="text-sm">{labels.errorLoading}: {issuesError}</p>
          <button 
            onClick={refetchIssues}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            {labels.retry}
          </button>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-white min-h-screen">
        <div className="text-center py-12">
          <div className="text-gray-500 text-6xl mb-6">🔐</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            To access the Citizen Issues management system with full filtering capabilities, 
            user assignments, and issue management features, please log in to your account.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
            >
              Login to Access Full Features
            </button>
            <div className="text-sm text-gray-500">
              <p>Or continue with limited access to view public issues only</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {labels.pageTitle}
            </h1>
            <p className="text-sm text-gray-600 mb-6">{labels.subtitle}</p>
          </div>
          {/* Stats in Header */}
          <div className="flex gap-4 sm:gap-6 flex-wrap">
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{stats.total}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{stats.open}</div>
              <div className="text-xs text-gray-500">Open</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-yellow-600">{stats.inProgress}</div>
              <div className="text-xs text-gray-500">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">{stats.pending}</div>
              <div className="text-xs text-gray-500">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{stats.resolved}</div>
              <div className="text-xs text-gray-500">Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-red-600">{stats.urgent}</div>
              <div className="text-xs text-gray-500">Urgent</div>
            </div>
          </div>
        </div>
      </div>

                           {/* Status Toggle Section */}
        <StatusToggle 
          selectedStatus={filters.status}
          onStatusChange={setFilters}
        />

        {/* Action Section */}
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm"
            >
              + Add First Issue
            </button>
            <ExportCSVButton data={allIssues} />
          </div>

          {/* Summary */}
          <div className="mt-4 text-right text-sm text-gray-600">
            Total records: {allIssues.length} {filters.status !== "All" && `(${filters.status} only)`}
          </div>
        </div>

             {/* Table */}
       {allIssues.length === 0 ? (
         <div className="bg-white p-12 text-center border border-gray-200 rounded-lg">
           <div className="text-gray-400 text-4xl mb-4">📋</div>
           <h3 className="text-lg font-medium text-gray-900 mb-2">
             {filters.status === "All" ? labels.getStarted : `No ${filters.status} issues found`}
           </h3>
           <p className="text-gray-500 mb-6">
             {filters.status === "All" 
               ? "Start by creating your first citizen issue"
               : `No issues with status "${filters.status}" found. Try selecting a different status or create a new issue.`
             }
           </p>
           {filters.status === "All" && (
             <button
               onClick={() => setShowAddModal(true)}
               className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition-colors"
             >
               {labels.addFirstIssue}
             </button>
           )}
         </div>
       ) : (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <IssueTable 
              issues={allIssues}
              onIssueUpdated={handleIssueUpdated}
              onIssueDeleted={handleIssueDeleted}
            />
          </div>
       )}

      {/* Add Issue Modal */}
      <AddNewIssueModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onIssueCreated={handleIssueCreated}
      />

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default CitizenIssuesPage;