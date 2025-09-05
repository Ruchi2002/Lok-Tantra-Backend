// src/pages/TenantPage.jsx
import React, { useState } from "react";
import { Plus, Edit2, Trash2, Power, Eye, EyeOff, Copy, Check } from "lucide-react";
import { 
  useGetTenantsQuery, 
  useCreateTenantMutation, 
  useUpdateTenantMutation, 
  useDeleteTenantMutation 
} from "../../store/api/appApi";

const TenantPage = () => {
  const [assistants, setAssistants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});
  const [copiedItems, setCopiedItems] = useState({});

  const [open, setOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    status: "active",
  });

  // RTK Query hooks - using regular query for now, will fetch with passwords separately
  const { data: tenants = [], isLoading, error } = useGetTenantsQuery();
  const [createTenant, { isLoading: isCreating }] = useCreateTenantMutation();
  const [updateTenant, { isLoading: isUpdating }] = useUpdateTenantMutation();
  const [deleteTenant, { isLoading: isDeleting }] = useDeleteTenantMutation();

  // State for tenants with passwords
  const [tenantsWithPasswords, setTenantsWithPasswords] = useState([]);

  // Fetch tenants with passwords
  const fetchTenantsWithPasswords = async () => {
    try {
      const response = await fetch('http://localhost:8000/super-admin/all-tenants-with-passwords', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setTenantsWithPasswords(data);
      }
    } catch (error) {
      console.error('Error fetching tenants with passwords:', error);
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

  // Fetch tenants with passwords on component mount
  React.useEffect(() => {
    fetchTenantsWithPasswords();
  }, []);

  // Fetch assistants for a tenant (this might need a separate API endpoint)
  const fetchAssistants = async (tenantId) => {
    try {
      // This would need to be added to the appApi if it doesn't exist
      const response = await fetch(`http://localhost:8000/users/tenant/${tenantId}/assistants`, {
        credentials: 'include'
      });
      const data = await response.json();
      setAssistants(data);
      setSelectedTenant(tenantId);
    } catch (err) {
      console.error("Error fetching assistants:", err);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Create or update tenant
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTenant) {
        await updateTenant({ tenantId: editingTenant.id, tenantData: formData }).unwrap();
      } else {
        await createTenant(formData).unwrap();
      }
      setFormData({ name: "", email: "", phone: "", password: "", status: "active" });
      setEditingTenant(null);
      setOpen(false);
    } catch (err) {
      console.error(err.data?.detail || err.message);
    }
  };

  const handleEdit = (tenant) => {
    setEditingTenant(tenant);
    setFormData({
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone || "",
      password: "",
      status: tenant.status,
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteTenant(id).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (tenant) => {
    try {
      const newStatus = tenant.status === "active" ? "inactive" : "active";
      await updateTenant({ 
        tenantId: tenant.id, 
        tenantData: { ...tenant, status: newStatus } 
      }).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Tenant Management</h1>
        <button
          onClick={() => {
            setEditingTenant(null);
            setFormData({ name: "", email: "", phone: "", password: "", status: "active" });
            setOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Add Tenant
        </button>
      </div>

      {/* Tenant Table */}
      <table className="w-full border mb-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Phone</th>
            <th className="border p-2">Password</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
            <th className="border p-2">Assistants</th>
          </tr>
        </thead>
        <tbody>
          {tenantsWithPasswords.length > 0 ? tenantsWithPasswords.map((tenant) => (
            <tr key={tenant.id}>
              <td className="border p-2">{tenant.name}</td>
              <td className="border p-2">{tenant.email}</td>
              <td className="border p-2">{tenant.phone}</td>
              <td className="border p-2">
                <PasswordDisplay password={tenant.plain_password} id={tenant.id} />
              </td>
              <td className="border p-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  tenant.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {tenant.status}
                </span>
              </td>
              <td className="border p-2 flex gap-2">
                <button onClick={() => handleEdit(tenant)} className="p-1 text-blue-600 hover:bg-gray-100 rounded">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(tenant.id)} className="p-1 text-red-600 hover:bg-gray-100 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleToggleStatus(tenant)} className="p-1 text-green-600 hover:bg-gray-100 rounded">
                  <Power className="w-4 h-4" />
                </button>
              </td>
              <td className="border p-2">
                <button
                  onClick={() => fetchAssistants(tenant.id)}
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  View Assistants
                </button>
              </td>
            </tr>
          )) : tenants.map((tenant) => (
            <tr key={tenant.id}>
              <td className="border p-2">{tenant.name}</td>
              <td className="border p-2">{tenant.email}</td>
              <td className="border p-2">{tenant.phone}</td>
              <td className="border p-2 text-gray-400">Loading...</td>
              <td className="border p-2">{tenant.status}</td>
              <td className="border p-2 flex gap-2">
                <button onClick={() => handleEdit(tenant)} className="p-1 text-blue-600 hover:bg-gray-100 rounded">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(tenant.id)} className="p-1 text-red-600 hover:bg-gray-100 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleToggleStatus(tenant)} className="p-1 text-green-600 hover:bg-gray-100 rounded">
                  <Power className="w-4 h-4" />
                </button>
              </td>
              <td className="border p-2">
                <button
                  onClick={() => fetchAssistants(tenant.id)}
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  View Assistants
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Assistants List */}
      {selectedTenant && (
        <div className="bg-gray-50 p-4 rounded border">
          <h2 className="text-lg font-semibold mb-3">
            Assistants for Tenant #{selectedTenant}
          </h2>
          {assistants.length > 0 ? (
            <ul className="list-disc pl-5">
              {assistants.map((assistant) => (
                <li key={assistant.id}>
                  <span className="font-medium">{assistant.name}</span> ({assistant.email})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No assistants found for this tenant.</p>
          )}
        </div>
      )}

      {/* Modal Form (same as before)... */}
      
      {/* Modal Form */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-semibold mb-4">
              {editingTenant ? "Update Tenant" : "Create Tenant"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="name"
                placeholder="Tenant Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Tenant Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required={!editingTenant}
              />
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingTenant ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantPage;
