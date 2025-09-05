import { useState, useMemo } from "react";
import IssueTable from "./IssueTable";
import ExportCSVButton from "./ExportCSVButton";
import AddNewIssueModal from "./AddNewIssueModal";
import StatusToggle from "./StatusToggle";
import DateRangeFilter from "./DateRangeFilter";
import SearchFilter from "./SearchFilter";
import Toast from "../../components/Toast";
import { useAuth } from "../../hooks/useAuth";
import { useIssuePermissions } from "../../utils/permissions";
import { 
  useGetCitizenIssuesQuery, 
  useGetFieldAgentIssuesQuery, 
  useGetFilteredCitizenIssuesQuery, 
  useDeleteCitizenIssueMutation 
} from "../../store/api/appApi";

const CitizenIssuesPage = () => {
  const { isAuthenticated, user, hasRole, isSuperAdmin, isTenantAdmin, isFieldAgent } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateRange, setDateRange] = useState({ fromDate: "", toDate: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState(null);

  // Determine which API endpoint to use based on user role
  const isAgent = isFieldAgent() || hasRole("FieldAgent") || hasRole("field_agent");
  
  // RTK Query hooks - use appropriate endpoint based on role
  const { 
    data: allIssues = [], 
    isLoading: allIssuesLoading, 
    error: allIssuesError,
    refetch: refetchAllIssues 
  } = useGetCitizenIssuesQuery(undefined, { skip: isAgent });
  
  const { 
    data: fieldAgentIssues = [], 
    isLoading: fieldAgentLoading, 
    error: fieldAgentError,
    refetch: refetchFieldAgentIssues 
  } = useGetFieldAgentIssuesQuery(undefined, { skip: !isAgent });
  
  // Combine loading and error states
  const isLoading = isAgent ? fieldAgentLoading : allIssuesLoading;
  const error = isAgent ? fieldAgentError : allIssuesError;
  
  // Get the appropriate issues data
  const issues = isAgent ? fieldAgentIssues : allIssues;
  
  // Refetch function
  const refetch = isAgent ? refetchFieldAgentIssues : refetchAllIssues;
  
  // Debug logging
  console.log('CitizenIssuesPage - User Role Info:', {
    user: user?.email,
    isAgent,
    isFieldAgent: isFieldAgent(),
    hasRoleFieldAgent: hasRole("FieldAgent"),
    hasRoleFieldAgentLower: hasRole("field_agent"),
    totalIssues: issues.length,
    isFieldAgentEndpoint: isAgent
  });

  const [deleteIssue] = useDeleteCitizenIssueMutation();

  // Use centralized permissions
  const {
    canCreateIssue,
    canDeleteIssue,
    canExportIssues,
  } = useIssuePermissions();

  // Filter issues based on status, date range, and search term
  const filteredIssues = useMemo(() => {
    if (!user) return [];
    
    let filtered = issues;
    
    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter(issue => issue.status === statusFilter);
    }
    
    // Apply date range filter
    if (dateRange.fromDate && dateRange.toDate) {
      filtered = filtered.filter(issue => {
        if (!issue.date) return false;
        
        const issueDate = new Date(issue.date);
        const fromDate = new Date(dateRange.fromDate);
        const toDate = new Date(dateRange.toDate);
        
        // Set time to start/end of day for proper comparison
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);
        
        return issueDate >= fromDate && issueDate <= toDate;
      });
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(issue => {
        const title = (issue.title || issue.issue || "").toLowerCase();
        const description = (issue.description || "").toLowerCase();
        const location = (issue.location || "").toLowerCase();
        const category = (issue.category || "").toLowerCase();
        const actionTaken = (issue.action_taken || "").toLowerCase();
        const assignedTo = (issue.assigned_to || "").toLowerCase();
        
        return title.includes(searchLower) ||
               description.includes(searchLower) ||
               location.includes(searchLower) ||
               category.includes(searchLower) ||
               actionTaken.includes(searchLower) ||
               assignedTo.includes(searchLower);
      });
    }
    
    return filtered;
  }, [issues, statusFilter, dateRange, searchTerm, user]);

  // Calculate statistics based on filtered issues
  const stats = useMemo(() => {
    const total = filteredIssues.length;
    const open = filteredIssues.filter(i => i.status === "Open").length;
    const urgent = filteredIssues.filter(i => i.priority === "Urgent").length;
    const inProgress = filteredIssues.filter(i => i.status === "In Progress").length;
    const pending = filteredIssues.filter(i => i.status === "Pending").length;
    const resolved = filteredIssues.filter(i => i.status === "Resolved").length;
    
    return { total, open, urgent, inProgress, pending, resolved };
  }, [filteredIssues]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setStatusFilter(newFilters);
  };

  // Handle date range changes
  const handleDateRangeChange = (fromDate, toDate) => {
    setDateRange({ fromDate, toDate });
  };

  // Handle search term changes
  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  // Handle issue creation
  const handleIssueCreated = async () => {
    setToast({ type: "success", message: "Issue created successfully!" });
    setShowAddModal(false);
    refetch();
  };

  // Handle issue deletion
  const handleIssueDeleted = async (issueId) => {
    try {
      await deleteIssue(issueId);
      setToast({ type: "success", message: "Issue deleted successfully!" });
      refetch();
    } catch (error) {
      console.error("Error deleting issue:", error);
      setToast({ type: "error", message: "Failed to delete issue" });
    }
  };

  // Handle issue updates
  const handleIssueUpdated = async (issueId, updatedIssue) => {
    setToast({ type: "success", message: "Issue updated successfully!" });
    refetch();
  };

  // Handle toast close
  const handleToastClose = () => {
    setToast(null);
  };

  // Authentication required
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="text-blue-600 text-2xl">🔐</div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Authentication Required
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Please log in to access the Citizen Issues management system.
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Login to Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Citizen Issues Management
              </h1>
              <p className="text-gray-600">
                Manage and track community issues and grievances
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {canCreateIssue && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                  <span className="mr-2 text-lg">+</span>
                  Add New Issue
                </button>
              )}
              
              {canExportIssues() && (
                <ExportCSVButton 
                  data={filteredIssues} 
                  filename="citizen-issues"
                  disabled={filteredIssues.length === 0}
                />
              )}
            </div>
          </div>
        </div>

        {/* Combined Filters and Statistics Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          {/* Top Row: Search Filter, Date Range Filter, Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
            
            {/* Search Filter */}
            <div className="lg:col-span-3">
              <SearchFilter 
                onSearchChange={handleSearchChange}
                initialSearchTerm={searchTerm}
                searchResultsCount={filteredIssues.length}
              />
            </div>

            {/* Date Range Filter */}
            <div className="lg:col-span-3">
              <DateRangeFilter 
                onDateRangeChange={handleDateRangeChange}
                initialFromDate={dateRange.fromDate}
                initialToDate={dateRange.toDate}
              />
            </div>

            {/* Statistics Cards - Compact Version */}
            <div className="lg:col-span-6">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-3 text-center hover:shadow-sm transition-shadow">
                  <div className="text-xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-xs text-blue-700">Total</div>
                </div>
                <div className="bg-green-50 rounded-lg border border-green-200 p-3 text-center hover:shadow-sm transition-shadow">
                  <div className="text-xl font-bold text-green-600">{stats.open}</div>
                  <div className="text-xs text-green-700">Open</div>
                </div>
                <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-3 text-center hover:shadow-sm transition-shadow">
                  <div className="text-xl font-bold text-yellow-600">{stats.inProgress}</div>
                  <div className="text-xs text-yellow-700">Progress</div>
                </div>
                <div className="bg-orange-50 rounded-lg border border-orange-200 p-3 text-center hover:shadow-sm transition-shadow">
                  <div className="text-xl font-bold text-orange-600">{stats.pending}</div>
                  <div className="text-xs text-orange-700">Pending</div>
                </div>
                <div className="bg-red-50 rounded-lg border border-red-200 p-3 text-center hover:shadow-sm transition-shadow">
                  <div className="text-xl font-bold text-red-600">{stats.urgent}</div>
                  <div className="text-xs text-red-700">Urgent</div>
                </div>
                <div className="bg-purple-50 rounded-lg border border-purple-200 p-3 text-center hover:shadow-sm transition-shadow">
                  <div className="text-xl font-bold text-purple-600">{stats.resolved}</div>
                  <div className="text-xs text-purple-700">Resolved</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Status Filter and User Info */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-4 border-t border-gray-100">
            <div className="flex-1">
              <StatusToggle 
                currentStatus={statusFilter}
                onStatusChange={handleFilterChange}
              />
            </div>
            
            {/* User Role Info */}
            <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 flex-shrink-0">
              <div className="text-sm text-gray-700">
                <span className="font-semibold">Role:</span> {user?.role || 'User'}
                {user?.tenant_id && (
                  <span className="ml-3 text-gray-500">
                    <span className="font-semibold">Tenant:</span> {user.tenant_id}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Issues Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <IssueTable
            issues={filteredIssues}
            onIssueUpdated={handleIssueUpdated}
            onIssueDeleted={handleIssueDeleted}
            showActions={true}
          />
        </div>

        {/* Modals and Notifications */}
        {showAddModal && (
          <AddNewIssueModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onIssueCreated={handleIssueCreated}
          />
        )}

        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={handleToastClose}
          />
        )}
        
      </div>
    </div>
  );
};

export default CitizenIssuesPage;