// src/pages/SuperAdminDashboard/adminPage.jsx
import React, { useState } from "react";
import { Plus, Edit2, Trash2, Power, Users, Eye, EyeOff, Copy, Check } from "lucide-react";
import { 
  useGetTenantsQuery
} from "../../store/api/appApi";

const AdminPage = () => {
  const [admins, setAdmins] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [open, setOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});
  const [copiedItems, setCopiedItems] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    tenant_id: "",
  });

  // RTK Query hooks
  const { data: tenants = [], isLoading: tenantsLoading } = useGetTenantsQuery();

  // Fetch admins from API
  const fetchAdmins = async () => {
    try {
      const response = await fetch('http://localhost:8000/super-admin/all-admins-with-passwords', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setAdmins(data);
      }
    } catch (err) {
      console.error("Error fetching admins:", err);
    }
  };

  // Password visibility toggle
  const togglePasswordVisibility = (id) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Copy password to clipboard
  const copyPassword = async (password, id) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopiedItems(prev => ({
        ...prev,
        [id]: true
      }));
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedItems(prev => ({
          ...prev,
          [id]: false
        }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy password:', error);
    }
  };

  // Password display component
  const PasswordDisplay = ({ password, id }) => {
    const isVisible = showPasswords[id];
    const isCopied = copiedItems[id];
    
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
          {isVisible ? password : '••••••••'}
        </span>
        <button
          onClick={() => togglePasswordVisibility(id)}
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
          onClick={() => copyPassword(password, id)}
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

  // Fetch admins on component mount
  React.useEffect(() => {
    fetchAdmins();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Create admin
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/super-admin/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setFormData({ name: "", email: "", phone: "", password: "", tenant_id: "" });
        setOpen(false);
        fetchAdmins(); // Refresh the list
      } else {
        const error = await response.json();
        console.error(error.detail || "Failed to create admin");
      }
    } catch (err) {
      console.error("Error creating admin:", err);
    }
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      phone: admin.phone || "",
      password: "",
      tenant_id: admin.tenant_id || "",
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/users/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        fetchAdmins(); // Refresh the list
      }
    } catch (err) {
      console.error("Error deleting admin:", err);
    }
  };

  const handleToggleStatus = async (admin) => {
    try {
      const newStatus = admin.status === "active" ? "inactive" : "active";
      const response = await fetch(`http://localhost:8000/users/${admin.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ ...admin, status: newStatus })
      });
      
      if (response.ok) {
        fetchAdmins(); // Refresh the list
      }
    } catch (err) {
      console.error("Error updating admin status:", err);
    }
  };

  // Get tenant name by ID
  const getTenantName = (tenantId) => {
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant ? tenant.name : "No Tenant";
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Admin Management</h1>
        <button
          onClick={() => {
            setEditingAdmin(null);
            setFormData({ name: "", email: "", phone: "", password: "", tenant_id: "" });
            setOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Add Admin
        </button>
      </div>

      {/* Admin Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Password</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {admin.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {admin.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {admin.phone || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <PasswordDisplay password={admin.plain_password} id={admin.id} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getTenantName(admin.tenant_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    admin.status === "active" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {admin.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEdit(admin)} 
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(admin.id)} 
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(admin)} 
                      className={`p-1 rounded ${
                        admin.status === "active" 
                          ? "text-orange-600 hover:text-orange-900 hover:bg-orange-50" 
                          : "text-green-600 hover:text-green-900 hover:bg-green-50"
                      }`}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {admins.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No admins found. Create your first admin to get started.</p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {editingAdmin ? "Update Admin" : "Create Admin"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Admin Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Admin Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={!editingAdmin}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tenant</label>
                <select
                  name="tenant_id"
                  value={formData.tenant_id}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Tenant (Optional)</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingAdmin ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
