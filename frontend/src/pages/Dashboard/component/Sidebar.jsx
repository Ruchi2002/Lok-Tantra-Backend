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

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { currentLang } = useLanguage();

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
    },
    {
      to: "/dashboard/mplads",
      label: "MPLADS Projects",
      icon: <FiMapPin size={20} />,
    },
    {
      to: "/dashboard/research-repository",
      label: "Research Repository",
      icon: <FiFolder size={20} />,
    },
    {
      to: "/dashboard/social-media",
      label: "Social Media",
      icon: <FiShare2 size={20} />,
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
      to: "/dashboard/meeting-programs",
      label: "Meeting Programs",
      icon: <FiCalendarAlt size={20} />,
    },
    {
      to: "/dashboard/reports",
      label: "Reports",
      icon: <FiBarChart2 size={20} />,
    },
    {
      to: "/dashboard/settings",
      label: "Settings",
      icon: <FiSettings size={20} />,
    },
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
    <div
      className={`h-full bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 shadow-2xl transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      } flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center justify-center p-6 border-b border-slate-700/50 relative">
        <div className={`flex items-center transition-all duration-300`}>
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
            <span className="text-white font-bold text-sm">SP</span>
          </div>
          {isOpen && (
            <div>
              <span className="text-xl font-bold text-white">
                <a href="/">SmartPolitician</a>
              </span>
              <div className="text-xs text-emerald-400 font-medium">
                Dashboard
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onToggle}
          className={`p-2 rounded-full bg-emerald-500 cursor-pointer text-white absolute bottom-4 -right-4 transition-all duration-200 hover:bg-emerald-600 ${
            !isOpen ? "rotate-180" : ""
          }`}
        >
          <FiChevronLeft size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 flex-1 ">
        <div
          className={`text-xs uppercase font-semibold text-slate-500 mb-4 transition-all duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          Navigation
        </div>
        <div className="flex flex-col gap-2">
          {links.map((link) => {
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`group flex items-center gap-3 rounded-xl transition-all duration-200 relative p-3 hover:bg-slate-700/50 ${
                  active
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <div
                  className={`transition-all duration-200 ${
                    active
                      ? "text-emerald-400"
                      : "text-slate-400 group-hover:text-white"
                  }`}
                >
                  {link.icon}
                </div>

                {isOpen && (
                  <span
                    className={`font-medium text-sm transition-all duration-300 ${
                      active ? "text-emerald-300" : "text-slate-300"
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
      <div className="p-4 border-t border-slate-700/50">
        <LogoutButton
          className={`w-full flex items-center gap-3 rounded-xl transition-all duration-200 text-slate-400 hover:text-white hover:bg-slate-700/50 p-3 ${
            isOpen ? "justify-start" : "justify-center"
          }`}
        >
          <div className="text-slate-400 group-hover:text-white">
            <FiLogOut size={20} />
          </div>
          {isOpen && (
            <span className="font-medium text-sm text-slate-300">
              {labels.getText("logout") || "Logout"}
            </span>
          )}
        </LogoutButton>
      </div>
    </div>
  );
};

export default Sidebar;
