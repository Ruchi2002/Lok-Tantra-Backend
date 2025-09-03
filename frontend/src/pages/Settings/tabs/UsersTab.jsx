import React, { useEffect, useState } from 'react';
import { Users, Plus, Edit3, Trash2, X, Loader2 } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import {translateText} from '../../../utils/translateText';

// Original English labels
const ORIGINAL_LABELS = {
  // Main section
  title: "Users",
  add: "Add User",
  edit: "Edit User",
  save: "Save",
  
  // Table headers
  name: "Name",
  role: "Role",
  email: "Email",
  status: "Status",
  actions: "Actions",
  
  // Status
  active: "Active",
  inactive: "Inactive",
  
  // Roles
  assistant: "Assistant",
  analyst: "Analyst",
};

// Pre-defined translations for better performance
const TRANSLATIONS = {
  hi: {
    title: "उपयोगकर्ता",
    add: "उपयोगकर्ता जोड़ें",
    edit: "उपयोगकर्ता संपादित करें",
    save: "सेव करें",
    name: "नाम",
    role: "भूमिका",
    email: "ईमेल",
    status: "स्थिति",
    actions: "कार्य",
    active: "सक्रिय",
    inactive: "निष्क्रिय",
    assistant: "सहायक",
    analyst: "विश्लेषक",
  },
  bn: {
    title: "ব্যবহারকারী",
    add: "ব্যবহারকারী যোগ করুন",
    edit: "ব্যবহারকারী সম্পাদনা করুন",
    save: "সংরক্ষণ করুন",
    name: "নাম",
    role: "ভূমিকা",
    email: "ইমেইল",
    status: "অবস্থা",
    actions: "কর্ম",
    active: "সক্রিয়",
    inactive: "নিষ্ক্রিয়",
    assistant: "সহায়ক",
    analyst: "বিশ্লেষক",
  },
  ta: {
    title: "பயனர்கள்",
    add: "பயனர் சேர்க்க",
    edit: "பயனர் திருத்த",
    save: "சேமி",
    name: "பெயர்",
    role: "பங்கு",
    email: "மின்னஞ்சல்",
    status: "நிலை",
    actions: "செயல்கள்",
    active: "செயலில்",
    inactive: "செயலற்ற",
    assistant: "உதவியாளர்",
    analyst: "ஆய்வாளர்",
  },
  mr: {
    title: "वापरकर्ते",
    add: "वापरकर्ता जोडा",
    edit: "वापरकर्ता संपादित करा",
    save: "जतन करा",
    name: "नाव",
    role: "भूमिका",
    email: "ईमेल",
    status: "स्थिती",
    actions: "कृती",
    active: "सक्रिय",
    inactive: "निष्क्रिय",
    assistant: "सहाय्यक",
    analyst: "विश्लेषक",
  }
};

export default function UsersTab() {
  const { currentLang } = useLanguage();
  const [translatedLabels, setTranslatedLabels] = useState(ORIGINAL_LABELS);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState(null);

  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Assistant',
    active: true
  });

  // Translate labels when language changes
  useEffect(() => {
    const fetchTranslations = async () => {
      setTranslationError(null);

      console.log("🌐 Translating users to:", currentLang);

      // If language is English, use original labels
      if (currentLang === "en") {
        setTranslatedLabels(ORIGINAL_LABELS);
        return;
      }

      // If we have pre-defined translations, use them
      if (TRANSLATIONS[currentLang]) {
        console.log(`🌍 Using pre-defined ${currentLang} translations for users`);
        setTranslatedLabels(TRANSLATIONS[currentLang]);
        return;
      }

      // For other languages, use the translation API
      setIsTranslating(true);

      try {
        const keys = Object.keys(ORIGINAL_LABELS);
        const originalTexts = Object.values(ORIGINAL_LABELS);
        
        console.log("🔄 Translating users labels to:", currentLang);
        
        // Translate all texts in parallel
        const translations = await Promise.all(
          originalTexts.map((text) => translateText(text, currentLang))
        );

        console.log("🎯 Users translation results:", translations);

        // Build the translated labels object
        const updatedLabels = keys.reduce((acc, key, idx) => {
          acc[key] = translations[idx] || ORIGINAL_LABELS[key];
          return acc;
        }, {});

        setTranslatedLabels(updatedLabels);
      } catch (err) {
        console.error("Users translation failed:", err);
        setTranslationError(err.message || "Translation failed");
        setTranslatedLabels(ORIGINAL_LABELS);
      } finally {
        setIsTranslating(false);
      }
    };

    fetchTranslations();
  }, [currentLang]);

  useEffect(() => {
    const fetchUsersFromGeoJSON = async () => {
      try {
        const res = await fetch('/CitizenIssues.geojson.json');
        const data = await res.json();

        const assistants = data.features.map(f => f.properties.assistant);
        const uniqueNames = [...new Set(assistants.filter(Boolean))];

        const generatedUsers = uniqueNames.map((name, index) => ({
          id: index + 1,
          name,
          role: name.toLowerCase().includes('analyst') ? 'Analyst' : 'Assistant',
          email: `${name.toLowerCase().replace(/\s+/g, '')}@smartpolitics.in`,
          active: Math.random() < 0.8
        }));

        setUsers(generatedUsers);
      } catch (err) {
        console.error("Failed to load assistants from GeoJSON:", err);
      }
    };

    fetchUsersFromGeoJSON();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'Assistant', active: true });
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData(user);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormData({ name: '', email: '', role: 'Assistant', active: true });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(users.map(u => (u.id === editingUser.id ? { ...formData, id: editingUser.id } : u)));
    } else {
      const newUser = { ...formData, id: Date.now() };
      setUsers([...users, newUser]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    setUsers(users.filter(user => user.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Translation loading indicator */}
      {isTranslating && (
        <div className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-md">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600 mr-2" />
          <span className="text-blue-600 text-sm">Translating interface...</span>
        </div>
      )}

      {/* Translation error indicator */}
      {translationError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">
            {currentLang === "hi"
              ? "अनुवाद विफल हुआ। मूल पाठ दिखाया जा रहा है।"
              : currentLang === "bn"
              ? "অনুবাদ ব্যর্থ হয়েছে। মূল পাঠ্য দেখানো হচ্ছে।"
              : currentLang === "ta"
              ? "மொழிபெயர்ப்பு தோல்வியடைந்தது. அசல் உரை காட்டப்படுகிறது."
              : currentLang === "mr"
              ? "भाषांतर अयशस्वी. मूळ मजकूर दाखवला जात आहे."
              : "Translation failed. Showing original text."}
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Users className="mr-2 h-5 w-5" />
            {translatedLabels.title}
          </h3>
          <button
            onClick={openAddModal}
            className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${isTranslating ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isTranslating}
          >
            <Plus className="mr-2 h-4 w-4" />
            {translatedLabels.add}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-medium">{translatedLabels.name}</th>
                <th className="text-left p-3 font-medium">{translatedLabels.role}</th>
                <th className="text-left p-3 font-medium">{translatedLabels.email}</th>
                <th className="text-left p-3 font-medium">{translatedLabels.status}</th>
                <th className="text-left p-3 font-medium">{translatedLabels.actions}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'Assistant' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role === 'Assistant' ? translatedLabels.assistant : translatedLabels.analyst}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600">{user.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.active ? translatedLabels.active : translatedLabels.inactive}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openEditModal(user)} 
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        disabled={isTranslating}
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)} 
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        disabled={isTranslating}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingUser ? translatedLabels.edit : translatedLabels.add}</h2>
              <button onClick={closeModal}><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{translatedLabels.name}</label>
                <input
                  type="text"
                  className="w-full border p-2 rounded"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isTranslating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{translatedLabels.email}</label>
                <input
                  type="email"
                  className="w-full border p-2 rounded"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isTranslating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{translatedLabels.role}</label>
                <select
                  className="w-full border p-2 rounded"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  disabled={isTranslating}
                >
                  <option value="Assistant">{translatedLabels.assistant}</option>
                  <option value="Analyst">{translatedLabels.analyst}</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  disabled={isTranslating}
                />
                <label className="text-sm">{translatedLabels.active}</label>
              </div>

              <button
                type="submit"
                className={`w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors ${isTranslating ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isTranslating}
              >
                {translatedLabels.save}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}