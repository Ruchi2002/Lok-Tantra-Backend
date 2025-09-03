import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle, Activity, Clock } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { translateText } from "../../utils/translateText";

const fallbackTexts = {
  en: {
    heading: "📊 Area Insights",
    totalIssues: "Total Filtered Issues",
    priority: "Priority",
    status: "Status",
    visitPlanner: "Go to Visit Planner →",
    High: "High",
    Medium: "Medium",
    Low: "Low",
    Urgent: "Urgent",
    Committed: "Committed",
    Resolved: "Resolved",
    "In Progress": "In Progress",
    Open: "Open"
  },
  hi: {
    heading: "📊 क्षेत्र अंतर्दृष्टि",
    totalIssues: "कुल फ़िल्टर की गई समस्याएं",
    priority: "प्राथमिकता",
    status: "स्थिति",
    visitPlanner: "विजिट प्लानर पर जाएं →",
    High: "उच्च",
    Medium: "मध्यम",
    Low: "निम्न",
    Urgent: "अत्यावश्यक",
    Committed: "प्रतिबद्ध",
    Resolved: "सुलझा",
    "In Progress": "चालू",
    Open: "खुला"
  },
  ta: {
    heading: "📊 பகுதி பார்வைகள்",
    totalIssues: "மொத்த வடிகட்டிய பிரச்சனைகள்",
    priority: "முன்னுரிமை",
    status: "நிலைமை",
    visitPlanner: "வழிநடத்தல் திட்டத்திற்கு செல்லவும் →",
    High: "உயர்",
    Medium: "நடுத்தர",
    Low: "தாழ்ந்த",
    Urgent: "அவசரம்",
    Committed: "அர்ப்பணிக்கப்பட்ட",
    Resolved: "தீர்க்கப்பட்டது",
    "In Progress": "செயல்பாட்டில்",
    Open: "திறந்த"
  },
  mr: {
    heading: "📊 क्षेत्र अंतर्दृष्टी",
    totalIssues: "एकूण फिल्टर केलेल्या समस्या",
    priority: "प्राधान्य",
    status: "स्थिती",
    visitPlanner: "भेट नियोजकाकडे जा →",
    High: "उच्च",
    Medium: "मध्यम",
    Low: "निम्न",
    Urgent: "तातडीचे",
    Committed: "वचनबद्ध",
    Resolved: "सोडवले",
    "In Progress": "प्रगतीत आहे",
    Open: "उघडे"
  },
  bn: {
    heading: "📊 এলাকা বিশ্লেষণ",
    totalIssues: "মোট ফিল্টার করা সমস্যা",
    priority: "অগ্রাধিকার",
    status: "অবস্থা",
    visitPlanner: "ভিজিট প্ল্যানারে যান →",
    High: "উচ্চ",
    Medium: "মাঝারি",
    Low: "নিম্ন",
    Urgent: "জরুরি",
    Committed: "প্রতিশ্রুতিবদ্ধ",
    Resolved: "সমাধান",
    "In Progress": "প্রক্রিয়াধীন",
    Open: "খোলা"
  }
};

const InsightsPanel = ({ data }) => {
  const [filteredData, setFilteredData] = useState([]);
  const [labels, setLabels] = useState(fallbackTexts.en);
  const navigate = useNavigate();
  const { currentLang } = useLanguage();

  useEffect(() => {
    setFilteredData(data || []);
  }, [data]);

  useEffect(() => {
    const loadTranslations = async () => {
      if (currentLang === "en" || fallbackTexts[currentLang]) {
        setLabels(fallbackTexts[currentLang] || fallbackTexts.en);
      } else {
        const keys = Object.keys(fallbackTexts.en);
        const translated = await Promise.all(
          keys.map((key) => translateText(fallbackTexts.en[key], currentLang))
        );
        const obj = {};
        keys.forEach((key, idx) => {
          obj[key] = translated[idx];
        });
        setLabels(obj);
      }
    };

    loadTranslations();
  }, [currentLang]);

  const priorityCounts = {
    Urgent: 0,
    High: 0,
    Medium: 0,
    Low: 0,
  };

  const statusCounts = {
    Open: 0,
    "In Progress": 0,
    Committed: 0,
    Resolved: 0,
  };

  filteredData.forEach((feature) => {
    const props = feature?.properties;
    if (!props) return;

    const { priority, status } = props;
    if (priority in priorityCounts) priorityCounts[priority]++;
    if (status in statusCounts) statusCounts[status]++;
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-4 w-full h-fit flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">{labels.heading}</h2>

        <div className="mb-6">
          <p className="text-sm text-gray-500">{labels.totalIssues}</p>
          <p className="text-3xl font-bold text-indigo-600">{filteredData.length}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Priority Cards */}
          {Object.entries(priorityCounts).map(([key, value]) => {
            const colorMap = {
              Urgent: "from-rose-800 to-rose-400",
              High: "from-orange-700 to-orange-400",
              Medium: "from-yellow-600 to-yellow-400",
              Low: "from-green-700 to-green-400",
            };
            const Icon = AlertTriangle;
            return (
              <div
                key={key}
                className={`rounded-xl p-4 text-white font-bold bg-gradient-to-br ${colorMap[key]} shadow-md`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm">{labels.priority}: {labels[key] || key}</p>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-xl font-bold mt-1">{value}</p>
              </div>
            );
          })}

          {/* Status Cards */}
          {Object.entries(statusCounts).map(([key, value]) => {
            const colorMap = {
              Open: "from-blue-800 to-blue-300",
              "In Progress": "from-stone-700 to-stone-300",
              Committed: "from-purple-700 to-purple-300",
              Resolved: "from-emerald-700 to-emerald-300",
            };
            const iconMap = {
              Open: Clock,
              "In Progress": Activity,
              Committed: AlertTriangle,
              Resolved: CheckCircle,
            };
            const Icon = iconMap[key];
            return (
              <div
                key={key}
                className={`rounded-xl p-4 text-white font-bold bg-gradient-to-br ${colorMap[key]} shadow-md`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm">{labels.status}: {labels[key] || key}</p>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-xl font-bold mt-1">{value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Button */}
      <button
        onClick={() => navigate("/dashboard/visits")}
        className="mt-6 w-full bg-sky-500 hover:bg-sky-700 text-white py-4 px-6 rounded-lg font-semibold transition-all duration-500"
      >
        {labels.visitPlanner}
      </button>
    </div>
  );
};

export default InsightsPanel;
