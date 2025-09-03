import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFilePdf, FaFileCsv } from "react-icons/fa";
import { useLanguage } from "../../../context/LanguageContext";
import { translateText } from "../../../utils/translateText";

// 🌍 Fallback Translations
const FALLBACK_TRANSLATIONS = {
  hi: {
    pdf: "PDF निर्यात करें",
    csv: "CSV निर्यात करें",
    title: "स्मार्ट पॉलिटिशियन असिस्टेंट - रिपोर्ट",
    noData: "निर्यात करने के लिए कोई डेटा नहीं है",
  },
  ta: {
    pdf: "PDF ஏற்றுமதி",
    csv: "CSV ஏற்றுமதி",
    title: "ஸ்மார்ட் அரசியல்வாதி உதவியாளர் - அறிக்கை",
    noData: "ஏற்றுமதிக்கென்று தரவு இல்லை",
  },
  mr: {
    pdf: "PDF निर्यात करा",
    csv: "CSV निर्यात करा",
    title: "स्मार्ट राजकारणी सहाय्यक - अहवाल",
    noData: "निर्यात करण्यासाठी डेटा नाही",
  },
  bn: {
    pdf: "PDF রপ্তানি করুন",
    csv: "CSV রপ্তানি করুন",
    title: "স্মার্ট রাজনীতিবিদ সহকারী - প্রতিবেদন",
    noData: "রপ্তানির জন্য কোন ডেটা নেই",
  },
};

const ExportButtons = ({ data = [] }) => {
  const { currentLang } = useLanguage();

  const [labels, setLabels] = useState({
    pdf: "Export PDF",
    csv: "Export CSV",
    title: "Smart Politician Assistant - Report",
    noData: "No data to export",
  });

  // 1️⃣ Translate UI Labels
  useEffect(() => {
    const fetchLabels = async () => {
      if (currentLang === "en") return;

      const fallback = FALLBACK_TRANSLATIONS[currentLang];
      if (fallback) {
        setLabels(fallback);
      } else {
        try {
          const [pdf, csv, title, noData] = await Promise.all([
            translateText("Export PDF", currentLang),
            translateText("Export CSV", currentLang),
            translateText("Smart Politician Assistant - Report", currentLang),
            translateText("No data to export", currentLang),
          ]);
          setLabels({ pdf, csv, title, noData });
        } catch (e) {
          console.error("❌ Translation failed in ExportButtons:", e);
        }
      }
    };

    fetchLabels();
  }, [currentLang]);

  // 2️⃣ Flatten GeoJSON
  if (!Array.isArray(data)) {
    console.warn("ExportButtons expects array data");
    return null;
  }

  const flattenedData = data.map((item) => item.properties || {});
  const headers = flattenedData.length > 0 ? Object.keys(flattenedData[0]) : [];

  // 3️⃣ Export to CSV
  const handleCSVExport = () => {
    if (flattenedData.length === 0) return alert(labels.noData);

    const csvRows = [
      headers.join(","),
      ...flattenedData.map((row) =>
        headers.map((header) => `"${row[header] ?? ""}"`).join(",")
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "SmartPolitician_Report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  // 4️⃣ Export to PDF
  const handlePDFExport = () => {
    if (flattenedData.length === 0) return alert(labels.noData);

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(labels.title, 14, 20);

    const rows = flattenedData.map((row) =>
      headers.map((header) => row[header] ?? "")
    );

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 30,
      styles: { fontSize: 10 },
      theme: "grid",
    });

    doc.save("SmartPolitician_Report.pdf");
  };

  return (
    <div className="flex flex-wrap gap-4 mt-4">
      <button
        onClick={handlePDFExport}
        className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-all"
      >
        <FaFilePdf />
        {labels.pdf}
      </button>

      <button
        onClick={handleCSVExport}
        className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition-all"
      >
        <FaFileCsv />
        {labels.csv}
      </button>
    </div>
  );
};

export default ExportButtons;
