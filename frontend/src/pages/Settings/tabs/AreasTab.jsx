import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit3, Trash2, Save, X, Loader2 } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { translateText } from '../../../utils/translateText';

const ORIGINAL_LABELS = {
  title: "Constituency Areas",
  addArea: "Add Area",
  newConstituencyPlaceholder: "New Constituency Name",
  newSubAreaPlaceholder: "First Sub-area",
  subAreaPlaceholder: "Enter sub-area",
  addSubArea: "+ Add Sub-area",
  translatingInterface: "Translating interface...",
  translationFailed: "Translation failed. Showing original text."
};

const TRANSLATIONS = {
  hi: {
    title: "निर्वाचन क्षेत्र",
    addArea: "क्षेत्र जोड़ें",
    newConstituencyPlaceholder: "नया निर्वाचन क्षेत्र नाम",
    newSubAreaPlaceholder: "पहला उप-क्षेत्र",
    subAreaPlaceholder: "उप-क्षेत्र दर्ज करें",
    addSubArea: "+ उप-क्षेत्र जोड़ें",
    translatingInterface: "इंटरफेस का अनुवाद किया जा रहा है...",
    translationFailed: "अनुवाद विफल हुआ। मूल पाठ दिखाया जा रहा है।",
  },
  bn: {
    title: "নির্বাচনী এলাকা",
    addArea: "এলাকা যোগ করুন",
    newConstituencyPlaceholder: "নতুন নির্বাচনী এলাকার নাম",
    newSubAreaPlaceholder: "প্রথম উপ-এলাকা",
    subAreaPlaceholder: "উপ-এলাকা লিখুন",
    addSubArea: "+ উপ-এলাকা যোগ করুন",
    translatingInterface: "ইন্টারফেস অনুবাদ করা হচ্ছে...",
    translationFailed: "অনুবাদ ব্যর্থ হয়েছে। মূল পাঠ্য দেখানো হচ্ছে।",
  },
  ta: {
    title: "தொகுதி பகுதிகள்",
    addArea: "பகுதி சேர்க்கவும்",
    newConstituencyPlaceholder: "புதிய தொகுதி பெயர்",
    newSubAreaPlaceholder: "முதல் துணை பகுதி",
    subAreaPlaceholder: "துணை பகுதியை உள்ளிடவும்",
    addSubArea: "+ துணை பகுதி சேர்க்கவும்",
    translatingInterface: "இடைமுகம் மொழிபெயர்க்கப்படுகிறது...",
    translationFailed: "மொழிபெயர்ப்பு தோல்வியடைந்தது. அசல் உரை காட்டப்படுகிறது.",
  },
  mr: {
    title: "मतदारसंघ क्षेत्र",
    addArea: "क्षेत्र जोडा",
    newConstituencyPlaceholder: "नवीन मतदारसंघाचे नाव",
    newSubAreaPlaceholder: "पहिले उप-क्षेत्र",
    subAreaPlaceholder: "उप-क्षेत्र प्रविष्ट करा",
    addSubArea: "+ उप-क्षेत्र जोडा",
    translatingInterface: "इंटरफेस भाषांतर केले जात आहे...",
    translationFailed: "भाषांतर अयशस्वी. मूळ मजकूर दाखवला जात आहे.",
  }
};

const AreaItem = ({ consti, translatedLabels, isTranslating, onEdit, onDelete, onAddSubArea }) => {
  const [editing, setEditing] = useState(false);
  const [editedName, setEditedName] = useState(consti.name);
  const [newSubArea, setNewSubArea] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleSaveEdit = () => {
    onEdit(consti.id, editedName);
    setEditing(false);
  };

  const handleAddSubArea = () => {
    if (newSubArea.trim()) {
      onAddSubArea(consti.id, newSubArea.trim());
      setNewSubArea('');
      setShowInput(false);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        {editing ? (
          <div className="flex gap-2 items-center">
            <input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="border px-2 py-1 rounded"
              disabled={isTranslating}
            />
            <button
              onClick={handleSaveEdit}
              className="bg-green-600 text-white px-2 py-1 rounded"
              disabled={isTranslating}
            >
              <Save className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <h4 className="font-semibold text-lg">{consti.name}</h4>
        )}
        <div className="flex space-x-2">
          <button
            onClick={() => setEditing(true)}
            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
            disabled={isTranslating}
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(consti.id)}
            className="p-1 text-red-600 hover:bg-red-100 rounded"
            disabled={isTranslating}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {consti.areas.map((area, index) => (
          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {area}
          </span>
        ))}
        {showInput ? (
          <div className="flex items-center gap-2">
            <input
              value={newSubArea}
              onChange={(e) => setNewSubArea(e.target.value)}
              placeholder={translatedLabels.subAreaPlaceholder}
              className="px-3 py-1 border rounded-md text-sm"
              disabled={isTranslating}
            />
            <button
              onClick={handleAddSubArea}
              className="px-2 py-1 bg-green-600 text-white rounded"
              disabled={isTranslating}
            >
              <Save className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            className="px-3 py-1 border-2 border-dashed border-gray-300 rounded-full text-sm text-gray-600 hover:border-blue-400"
            disabled={isTranslating}
          >
            {translatedLabels.addSubArea}
          </button>
        )}
      </div>
    </div>
  );
};

const AreasTab = () => {
  const { currentLang } = useLanguage();
  const [translatedLabels, setTranslatedLabels] = useState(ORIGINAL_LABELS);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState(null);
  const [constituencies, setConstituencies] = useState([]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newArea, setNewArea] = useState('');

  useEffect(() => {
    const fetchTranslations = async () => {
      setTranslationError(null);
      if (currentLang === 'en') {
        setTranslatedLabels(ORIGINAL_LABELS);
        return;
      }
      if (TRANSLATIONS[currentLang]) {
        setTranslatedLabels(TRANSLATIONS[currentLang]);
        return;
      }
      setIsTranslating(true);
      try {
        const keys = Object.keys(ORIGINAL_LABELS);
        const originalTexts = Object.values(ORIGINAL_LABELS);
        const translations = await Promise.all(originalTexts.map((text) => translateText(text, currentLang)));
        const updatedLabels = keys.reduce((acc, key, idx) => {
          acc[key] = translations[idx] || ORIGINAL_LABELS[key];
          return acc;
        }, {});
        setTranslatedLabels(updatedLabels);
      } catch (err) {
        setTranslationError(err.message || 'Translation failed');
        setTranslatedLabels(ORIGINAL_LABELS);
      } finally {
        setIsTranslating(false);
      }
    };
    fetchTranslations();
  }, [currentLang]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/CitizenIssues.geojson.json');
        const data = await res.json();
        const grouped = {};
        data.features.forEach(({ properties }) => {
          const area = properties.area || 'Unknown';
          const constituency = properties.constituency || 'Unnamed';
          if (!grouped[constituency]) grouped[constituency] = new Set();
          grouped[constituency].add(area);
        });
        const result = Object.entries(grouped).map(([name, areasSet], i) => ({
          id: i + 1,
          name,
          areas: Array.from(areasSet)
        }));
        setConstituencies(result);
      } catch (err) {
        console.error('GeoJSON Fetch Error:', err);
      }
    };
    fetchData();
  }, []);

  const addConstituency = () => {
    if (!newName.trim() || !newArea.trim()) return;
    const newItem = {
      id: Date.now(),
      name: newName.trim(),
      areas: [newArea.trim()]
    };
    setConstituencies((prev) => [...prev, newItem]);
    setAdding(false);
    setNewName('');
    setNewArea('');
  };

  const editName = (id, newName) => {
    setConstituencies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: newName } : c))
    );
  };

  const deleteConstituency = (id) => {
    setConstituencies((prev) => prev.filter((c) => c.id !== id));
  };

  const addSubArea = (id, area) => {
    setConstituencies((prev) =>
      prev.map((c) =>
        c.id === id && !c.areas.includes(area)
          ? { ...c, areas: [...c.areas, area] }
          : c
      )
    );
  };

  return (
    <div className="space-y-6">
      {isTranslating && (
        <div className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-md">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600 mr-2" />
          <span className="text-blue-600 text-sm">{translatedLabels.translatingInterface}</span>
        </div>
      )}
      {translationError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{translatedLabels.translationFailed}</p>
        </div>
      )}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            {translatedLabels.title}
          </h3>
          {!adding ? (
            <button
              onClick={() => setAdding(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={isTranslating}
            >
              <Plus className="mr-2 h-4 w-4" />
              {translatedLabels.addArea}
            </button>
          ) : (
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={translatedLabels.newConstituencyPlaceholder}
                className="border p-2 rounded-md"
                disabled={isTranslating}
              />
              <input
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                placeholder={translatedLabels.newSubAreaPlaceholder}
                className="border p-2 rounded-md"
                disabled={isTranslating}
              />
              <button
                onClick={addConstituency}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                disabled={isTranslating}
              >
                <Save className="h-4 w-4" />
              </button>
              <button
                onClick={() => setAdding(false)}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                disabled={isTranslating}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        <div className="space-y-4">
          {constituencies.map((consti) => (
            <AreaItem
              key={consti.id}
              consti={consti}
              translatedLabels={translatedLabels}
              isTranslating={isTranslating}
              onEdit={editName}
              onDelete={deleteConstituency}
              onAddSubArea={addSubArea}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AreasTab;
