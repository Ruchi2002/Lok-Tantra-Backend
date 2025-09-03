import React, { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useLanguage } from "../../../context/LanguageContext";
import { translateText } from "../../../utils/translateText";

// Static fallback translations
const FALLBACK_TRANSLATIONS = {
  hi: {
    heading: "सहायक कार्यभार",
    issues: "समस्याएँ",
    assistant: "सहायक",
    noData: "सहायकों के लिए कोई डेटा उपलब्ध नहीं है",
  },
  bn: {
    heading: "সহকারীর কাজের চাপ",
    issues: "সমস্যা",
    assistant: "সহকারী",
    noData: "সহকারীদের জন্য কোনো ডেটা নেই",
  },
  ta: {
    heading: "உதவியாளர் பணிச்சுமை",
    issues: "சிக்கல்கள்",
    assistant: "உதவியாளர்",
    noData: "உதவியாளர்களுக்கான தரவுகள் இல்லை",
  },
  mr: {
    heading: "सहाय्यक कार्यभार",
    issues: "समस्या",
    assistant: "सहाय्यक",
    noData: "सहाय्यकांसाठी डेटा उपलब्ध नाही",
  },
};

// Group assistant data
const getWorkloadData = (data) => {
  const counts = {};
  data.forEach((item) => {
    const assistant = item?.properties?.assistant;
    if (assistant) {
      counts[assistant] = (counts[assistant] || 0) + 1;
    }
  });

  return Object.entries(counts).map(([name, count]) => ({
    assistant: name,
    issues: count,
  }));
};

const WorkloadChart = ({ data }) => {
  const { currentLang } = useLanguage(); // ✅ Use currentLang, not language
  const rawData = useMemo(() => getWorkloadData(data || []), [data]);

  const [translatedLabels, setTranslatedLabels] = useState({
    heading: "Assistant Workload",
    issues: "Issues",
    assistant: "Assistant",
    noData: "No data available for assistants.",
  });

  const [translatedChartData, setTranslatedChartData] = useState([]);

  useEffect(() => {
    const translateEverything = async () => {
      // 1. Labels
      if (currentLang === "en") {
        setTranslatedLabels({
          heading: "Assistant Workload",
          issues: "Issues",
          assistant: "Assistant",
          noData: "No data available for assistants.",
        });
        setTranslatedChartData(rawData);
        return;
      }

      const fallback = FALLBACK_TRANSLATIONS[currentLang];
      if (fallback) {
        setTranslatedLabels(fallback);
      } else {
        try {
          const [heading, issues, assistant, noData] = await Promise.all([
            translateText("Assistant Workload", currentLang),
            translateText("Issues", currentLang),
            translateText("Assistant", currentLang),
            translateText("No data available for assistants.", currentLang),
          ]);
          setTranslatedLabels({ heading, issues, assistant, noData });
        } catch (err) {
          console.error("❌ Label translation failed:", err);
        }
      }

      // 2. Assistant Names
      if (rawData.length === 0) {
        setTranslatedChartData([]);
        return;
      }

      try {
        const translatedNames = await Promise.all(
          rawData.map((item) =>
            translateText(item.assistant, currentLang)
          )
        );
        const updatedData = rawData.map((item, idx) => ({
          ...item,
          assistant: translatedNames[idx],
        }));
        setTranslatedChartData(updatedData);
      } catch (err) {
        console.error("❌ Assistant name translation failed:", err);
        setTranslatedChartData(rawData); // fallback
      }
    };

    translateEverything();
  }, [currentLang, rawData]);

  return (
    <div className="bg-white rounded-xl p-4 shadow-md h-full w-full">
      <h2 className="text-lg font-semibold text-[#2E3A59] mb-3">
        {translatedLabels.heading}
        <span className="text-xs text-gray-400 ml-2">({currentLang})</span>
      </h2>

      {translatedChartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={translatedChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="assistant" />
            <YAxis allowDecimals={false} />
            <Tooltip
              formatter={(value) => [`${value}`, translatedLabels.issues]}
              labelFormatter={(label) =>
                `${translatedLabels.assistant}: ${label}`
              }
            />
            <Bar dataKey="issues" fill="#4F46E5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center text-gray-400 mt-16">
          {translatedLabels.noData}
        </div>
      )}
    </div>
  );
};

export default WorkloadChart;
