import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiFileText,
  FiCalendar,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiEye,
  FiChevronLeft,
  FiUsers,
  FiMail,
  FiClock,
  FiCalendar as FiCalendarAlt,
  FiBookOpen,
  FiMapPin,
  FiFolder,
  FiShare2,
} from "react-icons/fi";
import { LogoutButton } from "../../../components/LogoutButton";
import { useLanguage } from "../../../context/LanguageContext";
import { fallbackTranslations } from "../../../utils/fallbackTranslation";
import { useAuth } from "../../../hooks/useAuth";

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { currentLang } = useLanguage();
  const { isFieldAgent } = useAuth();

  // Create labels object with getText method
  const labels = {
    getText: (key) => {
      const translation =
        fallbackTranslations?.dashboard?.[key]?.[currentLang] ||
        fallbackTranslations?.dashboard?.[key]?.en ||
        key;
      return translation;
    },
  };

  const links = [
    { to: "/dashboard", label: "dashboard", icon: <FiHome size={20} /> },
    {
      to: "/dashboard/lok-sabha",
      label: "Lok Sabha Session",
      icon: <FiBookOpen size={20} />,
      restrictedForFieldAgent: true,
    },
    {
      to: "/dashboard/received-letters",
      label: "Received Letters",
      icon: <FiMail size={20} />,
    },
    {
      to: "/dashboard/sent-letters",
      label: "Sent Letters Public Interest",
      icon: <FiMail size={20} />,
    },
    {
      to: "/dashboard/sent-grievance-letters",
      label: "Sent Letters Public Grievance",
      icon: <FiMail size={20} />,
    },
    {
      to: "/dashboard/issues",
      label: "Grievance Dashboard",
      icon: <FiFileText size={20} />,
    },
    {
      to: "/dashboard/social-media",
      label: "Social Media",
      icon: <FiShare2 size={20} />,
      restrictedForFieldAgent: true,
    },
    {
      to: "/dashboard/research-repository",
      label: "Research Repository",
      icon: <FiFolder size={20} />,
      restrictedForFieldAgent: true,
    },
    {
      to: "/dashboard/mplads",
      label: "MPLADS Projects",
      icon: <FiMapPin size={20} />,
      restrictedForFieldAgent: true,
    },   
  {
      to: "/dashboard/meeting-programs",
      label: "Meeting Programs",
      icon: <FiCalendarAlt size={20} />,
    },
    // {
    //   to: "/dashboard/reports",
    //   label: "Reports",
    //   icon: <FiBarChart2 size={20} />,
    // },
    // {
    //   to: "/dashboard/settings",
    //   label: "Settings",
    //   icon: <FiSettings size={20} />,
    // },
    {
      to: "/dashboard/addAssistants",
      label: "Add Assistants",
      icon: <FiUsers size={20} />,
    },
  ];

  const isActive = (path) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`fixed lg:relative h-screen bg-white border-r border-slate-700 shadow-2xl transition-all duration-300 z-50 flex flex-col ${
          isOpen 
            ? "w-64 translate-x-0" 
            : "w-20 -translate-x-full lg:translate-x-0"
        }`}
      >
      {/* Header */}
      <div className="flex items-center justify-center p-4 lg:p-6 border-b border-slate-700/50 relative">
        <div className={`flex items-center transition-all duration-300`}>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-red-700 font-bold text-xl lg:text-2xl">सं</span>
            </div>
            {isOpen && (
              <div className="hidden sm:block">
                <div className="text-sm lg:text-lg font-bold text-gray-800">
                  SAMPARC INDIA
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onToggle}
          className={`p-2 hidden  rounded-full bg-emerald-500 cursor-pointer text-white absolute bottom-4 -right-4 transition-all duration-200 hover:bg-emerald-600 lg:block ${
            !isOpen ? "rotate-180" : ""
          }`}
        >
          <FiChevronLeft size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-3 lg:p-4 space-y-2 flex-1 overflow-y-auto">
        <div
          className={`text-xs uppercase font-semibold text-black mb-4 transition-all duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          Navigation
        </div>
        <div className="flex flex-col gap-2">
          {links.map((link) => {
            const active = isActive(link.to);
            const isRestricted = isFieldAgent() && link.restrictedForFieldAgent;
            
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`group flex items-center gap-3 rounded-xl transition-all duration-200 relative p-2 lg:p-3 ${
                  isRestricted
                    ? "cursor-not-allowed opacity-50"
                    : active
                    ? "bg-blue-100 text-blue-800"
                    : "text-black hover:bg-gray-100"
                }`}
                title={isRestricted ? "Access Restricted for Field Agents" : labels.getText(link.label)}
                onClick={() => {
                  // Close sidebar on mobile after navigation
                  if (window.innerWidth < 1024) {
                    onToggle();
                  }
                }}
              >
                <div
                  className={`transition-all duration-200 ${
                    isRestricted
                      ? "text-gray-400"
                      : active
                      ? "text-blue-800"
                      : "text-black"
                  }`}
                >
                  {link.icon}
                </div>

                {isOpen && (
                  <span
                    className={`font-medium text-sm transition-all duration-300 ${
                      isRestricted
                        ? "text-gray-400"
                        : active 
                        ? "text-blue-800" 
                        : "text-black"
                    }`}
                  >
                    {labels.getText(link.label)}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout Section */}
      <div className="p-3 lg:p-4 border-t border-slate-700/50">
        <LogoutButton
          className={`w-full flex items-center gap-3 rounded-xl transition-all duration-200 text-black hover:text-white hover:bg-red-400 p-2 lg:p-3 ${
            isOpen ? "justify-start" : "justify-center"
          }`}
        >
          <div className="text-black ">
            <FiLogOut size={20} />
          </div>
          {isOpen && (
            <span className="font-medium text-sm text-black">
              {labels.getText("logout") || "Logout"}
            </span>
          )}
        </LogoutButton>
      </div>
    </div>
    </>
  );
};

export default Sidebar; 