// src/pages/SuperAdminDashboard/dashboardPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Building2, 
  UserCheck, 
  Activity, 
  TrendingUp, 
  AlertCircle,
  Eye,
  EyeOff,
  Plus,
  Copy,
  Check
} from "lucide-react";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTenants: 0,
    totalAdmins: 0,
    totalUsers: 0,
    activeTenants: 0,
    recentActivity: []
  });
  const [tenants, setTenants] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState({});
  const [copiedItems, setCopiedItems] = useState({});

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch tenants with passwords
      const tenantsResponse = await fetch('http://localhost:8000/super-admin/all-tenants-with-passwords', {
        credentials: 'include'
      });
      const tenantsData = tenantsResponse.ok ? await tenantsResponse.json() : [];
      
      // Fetch admins with passwords
      const adminsResponse = await fetch('http://localhost:8000/super-admin/all-admins-with-passwords', {
        credentials: 'include'
      });
      const adminsData = adminsResponse.ok ? await adminsResponse.json() : [];
      
      // Fetch all users
      const usersResponse = await fetch('http://localhost:8000/users/', {
        credentials: 'include'
      });
      const usersData = usersResponse.ok ? await usersResponse.json() : [];
      
      setTenants(tenantsData);
      setAdmins(adminsData);
      
      // Calculate stats
      const activeTenants = tenantsData.filter(t => t.status === 'active').length;
      
      setStats({
        totalTenants: tenantsData.length,
        totalAdmins: adminsData.length,
        totalUsers: usersData.length,
        activeTenants: activeTenants,
        recentActivity: [
          { type: 'tenant_created', message: 'New tenant created', time: '2 hours ago' },
          { type: 'admin_created', message: 'New admin added', time: '4 hours ago' },
          { type: 'user_activity', message: 'User activity spike', time: '6 hours ago' },
        ]
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Password visibility toggle
  const togglePasswordVisibility = (type, id) => {
    setShowPasswords(prev => ({
      ...prev,
      [`${type}_${id}`]: !prev[`${type}_${id}`]
    }));
  };

  // Copy password to clipboard
  const copyPassword = async (password, type, id) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopiedItems(prev => ({
        ...prev,
        [`${type}_${id}`]: true
      }));
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedItems(prev => ({
          ...prev,
          [`${type}_${id}`]: false
        }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy password:', error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, onClick, color }) => (
    <div 
      className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );

  // Password display component
  const PasswordDisplay = ({ password, type, id }) => {
    const isVisible = showPasswords[`${type}_${id}`];
    const isCopied = copiedItems[`${type}_${id}`];
    
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
          {isVisible ? password : '••••••••'}
        </span>
        <button
          onClick={() => togglePasswordVisibility(type, id)}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          title={isVisible ? "Hide password" : "Show password"}
        >
          {isVisible ? (
            <EyeOff className="w-4 h-4 text-gray-600" />
          ) : (
            <Eye className="w-4 h-4 text-gray-600" />
          )}
        </button>
        <button
          onClick={() => copyPassword(password, type, id)}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          title="Copy password"
        >
          {isCopied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="text-gray-600">Overview of your system and quick actions</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tenants"
          value={stats.totalTenants}
          icon={Building2}
          color="bg-blue-500"
          subtitle={`${stats.activeTenants} active`}
        />
        <StatCard
          title="Total Admins"
          value={stats.totalAdmins}
          icon={UserCheck}
          color="bg-green-500"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="bg-purple-500"
        />
        <StatCard
          title="System Health"
          value="Good"
          icon={Activity}
          color="bg-emerald-500"
          subtitle="All systems operational"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard
            title="Create Tenant"
            description="Add a new organization"
            icon={Plus}
            color="bg-blue-500"
            onClick={() => navigate('/superadmin/tenantPage')}
          />
          <QuickActionCard
            title="Create Admin"
            description="Add a new admin user"
            icon={UserCheck}
            color="bg-green-500"
            onClick={() => navigate('/superadmin/adminPage')}
          />
          <QuickActionCard
            title="View All Tenants"
            description="Manage tenant organizations"
            icon={Building2}
            color="bg-purple-500"
            onClick={() => navigate('/superadmin/tenantPage')}
          />
        </div>
      </div>

      {/* Recent Activity & System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tenants */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Tenants</h2>
          <div className="space-y-3">
            {tenants.slice(0, 5).map((tenant) => (
              <div key={tenant.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{tenant.name}</p>
                    <p className="text-sm text-gray-600">{tenant.email}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    tenant.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {tenant.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Password:</span>
                  <PasswordDisplay 
                    password={tenant.plain_password} 
                    type="tenant" 
                    id={tenant.id} 
                  />
                </div>
              </div>
            ))}
            {tenants.length === 0 && (
              <p className="text-gray-500 text-center py-4">No tenants found</p>
            )}
          </div>
        </div>

        {/* Recent Admins */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Admins</h2>
          <div className="space-y-3">
            {admins.slice(0, 5).map((admin) => (
              <div key={admin.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{admin.name}</p>
                    <p className="text-sm text-gray-600">{admin.email}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    admin.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {admin.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Password:</span>
                  <PasswordDisplay 
                    password={admin.plain_password} 
                    type="admin" 
                    id={admin.id} 
                  />
                </div>
              </div>
            ))}
            {admins.length === 0 && (
              <p className="text-gray-500 text-center py-4">No admins found</p>
            )}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center p-4 bg-green-50 rounded-lg">
            <div className="p-2 bg-green-500 rounded-full">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="ml-3">
              <p className="font-medium text-green-900">Database</p>
              <p className="text-sm text-green-700">Connected</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-green-50 rounded-lg">
            <div className="p-2 bg-green-500 rounded-full">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="ml-3">
              <p className="font-medium text-green-900">API Services</p>
              <p className="text-sm text-green-700">Running</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-green-50 rounded-lg">
            <div className="p-2 bg-green-500 rounded-full">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div className="ml-3">
              <p className="font-medium text-green-900">Monitoring</p>
              <p className="text-sm text-green-700">Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
