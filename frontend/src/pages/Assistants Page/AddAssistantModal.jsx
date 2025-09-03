// src/pages/Assistants Page/AddAssistantModal.jsx
import React, { useState } from "react";
import { Dialog } from "@headlessui/react"; // Import Dialog from Headless UI
import { X } from "lucide-react"; // Import X icon from lucide-react

const AddAssistantModal = ({ isOpen, onClose, onSave }) => {
  // State to manage form input data
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    area: "",
    description: "",
  });

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
   * Performs basic validation and calls the onSave prop with the form data.
   * @param {object} e - The event object from the form submission.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation: ensure required fields are not empty
    if (formData.name.trim() && formData.phone.trim() && formData.email.trim()) {
      onSave(formData);
      setFormData({ name: "", phone: "", email: "", area: "", description: "" });
    } else {
      alert('Please fill in all required fields (Name, Phone, and Email).');
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
            Add Assistant
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
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
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
                placeholder="Enter assistant's full name"
              />
            </div>

            {/* Phone Field */}
            <div>
              <label 
                htmlFor="phone" 
                className="block text-gray-700 text-sm font-medium mb-1 sm:mb-2"
              >
                Phone *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Enter phone number"
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

            {/* Area Field */}
            <div>
              <label 
                htmlFor="area" 
                className="block text-gray-700 text-sm font-medium mb-1 sm:mb-2"
              >
                Assigned Area
              </label>
              <input
                type="text"
                id="area"
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="e.g., Central Delhi"
              />
            </div>

            {/* Description Field */}
            <div>
              <label 
                htmlFor="description" 
                className="block text-gray-700 text-sm font-medium mb-1 sm:mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-vertical"
                placeholder="Brief description of the assistant's role, skills, or responsibilities..."
              />
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
                className="order-1 sm:order-2 w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 shadow-md text-sm sm:text-base"
              >
                Save Assistant
              </button>
            </div>
          </form>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default AddAssistantModal;