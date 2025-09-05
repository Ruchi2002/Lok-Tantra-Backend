// src/components/SuperAdminSidebar.jsx
import React from "react";
import { User2Icon, Settings } from "lucide-react"; // lucide-react icons
import { FaUsers } from "react-icons/fa"; // react-icons example
import { NavLink } from "react-router-dom";
import { LogoutButton } from "../../components/LogoutButton";

const menuItems = [
  {
    name: "Tenants",
    icon: <User2Icon className="w-5 h-5" />,
    path: "/superadmin/tenantPage",
  },
  {
    name: "Admins",
    icon: <FaUsers className="w-5 h-5" />,
    path: "/superadmin/adminPage",
  },
  {
    name: "Dashboard",
    icon: <Settings className="w-5 h-5" />,
    path: "/superadmin/dashboard",
  },
];

const SuperAdminSidebar = () => {
  return (
    <div className="h-screen w-64 bg-gray-900 text-gray-100 flex flex-col shadow-lg">
      {/* Logo / Header */}
      <div className="px-6 py-4 text-xl font-bold border-b border-gray-700">
        Super Admin
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-2 py-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                isActive ? "bg-gray-800 text-blue-400 font-semibold" : "hover:bg-gray-800"
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Section */}
      <div className="p-4 border-t border-gray-700">
        <LogoutButton 
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </LogoutButton>
      </div>
    </div>
  );
};

export default SuperAdminSidebar;
