import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useLanguage } from "../../../context/LanguageContext";
import { translateText } from "../../../utils/translateText";

const FALLBACK_TRANSLATIONS = {
  ta: {
    heading: "தீர்வு போக்குகள்",
    noResolvedData: "தீர்க்கப்பட்ட தரவுகள் கிடைக்கவில்லை",
    Resolved: "தீர்க்கப்பட்டது",
  },
  mr: {
    heading: "निराकरण प्रवाह",
    noResolvedData: "निराकरण डेटा उपलब्ध नाही",
    Resolved: "निराकरण झाले",
  },
  hi: {
    heading: "समाधान ट्रेंड्स",
    noResolvedData: "कोई समाधान डेटा उपलब्ध नहीं है",
    Resolved: "सुलझाया गया",
  },
  bn: {
    heading: "সমাধান প্রবণতা",
    noResolvedData: "কোনো সমাধান ডেটা উপলব্ধ নেই",
    Resolved: "সমাধান করা হয়েছে",
  },
};

const parseCustomDate = (str) => {
  if (!str) return null;
  const [day, monthStr, year] = str.split(" ");
  const monthMap = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const month = monthMap[monthStr.slice(0, 3)];
  return new Date(year, month, parseInt(day));
};

const groupResolvedByTime = (geojsonData, type) => {
  const result = {};

  geojsonData.forEach((item) => {
    const status = item?.properties?.status;
    const rawDate = item?.properties?.date;

    if (!rawDate || status !== "Resolved") return;

    const date = parseCustomDate(rawDate);
    if (!date) return;

    let key;

    if (type === "Daily") {
      key = date.toISOString().split("T")[0];
    } else if (type === "Monthly") {
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      key = `${date.getFullYear()}-${month}`;
    } else {
      return;
    }

    result[key] = (result[key] || 0) + 1;
  });

  const chartData = Object.entries(result).map(([date, resolved]) => ({
    date,
    resolved,
  }));

  return chartData.sort((a, b) => new Date(a.date) - new Date(b.date));
};

const ResolutionChart = ({ data, reportType }) => {
  const { currentLang } = useLanguage();
  const [headingLabel, setHeadingLabel] = useState("Resolution Trends");
  const [noDataLabel, setNoDataLabel] = useState("No resolved data available");
  const [resolvedLabel, setResolvedLabel] = useState("Resolved");

  const chartData = groupResolvedByTime(data || [], reportType || "Daily");

  useEffect(() => {
    const fetchTranslations = async () => {
      if (currentLang === "en") return;

      if (FALLBACK_TRANSLATIONS[currentLang]) {
        setHeadingLabel(FALLBACK_TRANSLATIONS[currentLang].heading);
        setNoDataLabel(FALLBACK_TRANSLATIONS[currentLang].noResolvedData);
        setResolvedLabel(FALLBACK_TRANSLATIONS[currentLang].Resolved);
        return;
      }

      const heading = await translateText("Resolution Trends", currentLang);
      const noData = await translateText("No resolved data available", currentLang);
      const resolved = await translateText("Resolved", currentLang);
      setHeadingLabel(heading);
      setNoDataLabel(noData);
      setResolvedLabel(resolved);
    };

    fetchTranslations();
  }, [currentLang]);

  return (
    <div className="bg-white rounded-xl p-4 shadow-md h-full w-full">
      <h2 className="text-lg font-semibold text-[#2E3A59] mb-3">
        {headingLabel}
      </h2>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="resolved"
              name={resolvedLabel}
              stroke="#22c55e"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center text-gray-400 mt-16">{noDataLabel}</div>
      )}
    </div>
  );
};

export default ResolutionChart;
