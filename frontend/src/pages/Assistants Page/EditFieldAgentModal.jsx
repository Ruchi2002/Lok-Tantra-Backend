// src/pages/Assistants Page/EditFieldAgentModal.jsx
import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react"; // Import Dialog from Headless UI
import { X } from "lucide-react"; // Import X icon from lucide-react
import fieldAgentApi from "../../services/fieldAgentApi";

const EditFieldAgentModal = ({ isOpen, onClose, fieldAgent, onUpdate }) => {
  // State to manage form input data
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    status: "active",
    language_preference: "English",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Load field agent details when modal opens
  useEffect(() => {
    if (isOpen && fieldAgent?.id) {
      loadFieldAgentDetails();
    }
  }, [isOpen, fieldAgent?.id]);

  const loadFieldAgentDetails = async () => {
    try {
      setLoadingDetails(true);
      setError("");
      const details = await fieldAgentApi.getFieldAgentDetails(fieldAgent.id);
      
      setFormData({
        name: details.name || "",
        phone: details.phone || "",
        email: details.email || "",
        status: details.status || "active",
        language_preference: details.language_preference || "English",
      });
    } catch (error) {
      console.error('Error loading Field Agent details:', error);
      setError(error.message || 'Failed to load Field Agent details');
    } finally {
      setLoadingDetails(false);
    }
  };

  /**
   * Handles changes in form input fields.
   * Updates the formData state based on input name and value.
   * @param {object} e - The event object from the input field.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handles the form submission.
   * Performs basic validation and calls the backend API to update Field Agent.
   * @param {object} e - The event object from the form submission.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation: ensure required fields are not empty
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Please fill in all required fields (Name and Email).');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      // Prepare data for backend
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        status: formData.status,
        language_preference: formData.language_preference
      };

      // Call backend API
      const updatedFieldAgent = await fieldAgentApi.updateFieldAgent(fieldAgent.id, updateData);
      
      // Call the onUpdate callback with the updated field agent
      onUpdate(updatedFieldAgent);
      
      // Close modal
      onClose();
      
    } catch (error) {
      console.error('Error updating Field Agent:', error);
      setError(error.message || 'Failed to update Field Agent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Responsive modal with proper positioning and sizing
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 font-inter"
    >
      {/* Overlay for background dimming */}
      <div className="fixed inset-0 backdrop:backdrop-blur-lg bg-opacity-50 backdrop-blur-sm" aria-hidden="true" />

      {/* Modal Panel - Responsive sizing and positioning */}
      <Dialog.Panel className="relative bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md md:max-w-lg p-4 sm:p-6 z-50 transform transition-all scale-100 opacity-100 max-h-[95vh] flex flex-col">
        {/* Modal Header - Responsive spacing and text size */}
        <div className="flex justify-between items-center mb-4 sm:mb-6 border-b pb-3 sm:pb-4 flex-shrink-0">
          <Dialog.Title className="text-xl sm:text-2xl font-bold text-gray-800">
            Edit Field Agent
          </Dialog.Title>
          {/* Close button with responsive sizing */}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition duration-200 p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Form Container - Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {loadingDetails ? (
            <div className="text-center py-6 sm:py-8">
              <div className="inline-flex items-center space-x-2 text-gray-500">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <span>Loading Field Agent details...</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Name Field */}
              <div>
                <label 
                  htmlFor="name" 
                  className="block text-gray-700 text-sm font-medium mb-1 sm:mb-2"
                >
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter Field Agent's full name"
                />
              </div>

              {/* Email Field */}
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-gray-700 text-sm font-medium mb-1 sm:mb-2"
                >
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter email address"
                />
              </div>

              {/* Phone Field */}
              <div>
                <label 
                  htmlFor="phone" 
                  className="block text-gray-700 text-sm font-medium mb-1 sm:mb-2"
                >
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter phone number"
                />
              </div>

              {/* Status Field */}
              <div>
                <label 
                  htmlFor="status" 
                  className="block text-gray-700 text-sm font-medium mb-1 sm:mb-2"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Language Preference Field */}
              <div>
                <label 
                  htmlFor="language_preference" 
                  className="block text-gray-700 text-sm font-medium mb-1 sm:mb-2"
                >
                  Language Preference
                </label>
                <select
                  id="language_preference"
                  name="language_preference"
                  value={formData.language_preference}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Bengali">Bengali</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Gujarati">Gujarati</option>
                  <option value="Kannada">Kannada</option>
                  <option value="Malayalam">Malayalam</option>
                  <option value="Punjabi">Punjabi</option>
                </select>
              </div>

              {/* Form Action Buttons - Responsive layout */}
              <div className="flex flex-col sm:flex-row justify-end pt-3 sm:pt-4 space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="order-2 sm:order-1 w-full sm:w-auto px-4 sm:px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-200 shadow-sm text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="order-1 sm:order-2 w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 shadow-md text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Field Agent</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default EditFieldAgentModal;
