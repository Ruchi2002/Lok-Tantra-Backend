// src/pages/Assistants Page/AddAssistantPage.jsx
import React, { useState } from 'react';
import AddAssistantModal from './AddAssistantModal'; 

const AddAssistantPage = () => {
 
  const [showModal, setShowModal] = useState(false);
 
  const [assistantList, setAssistantList] = useState([]);

  /**
   * Handles adding a new assistant to the list.
   * @param {object} newAssistant - The new assistant data from the modal form.
   */
  const handleAddAssistant = (newAssistant) => {
   
    setAssistantList((prev) => [...prev, { ...newAssistant, id: Date.now() + Math.random() }]);
    setShowModal(false); 
  };

  /**

   * @param {string | number} idToDelete - The unique ID of the assistant to delete.
   * 
   */
  const handleDeleteAssistant = (idToDelete) => {
    // A simple browser confirmation. For a production app, consider a custom confirmation dialog.
    if (window.confirm("Are you sure you want to delete this assistant? This action cannot be undone.")) {
      setAssistantList((prev) => prev.filter(assistant => assistant.id !== idToDelete));
    }
  };

  return (
    // Main container - responsive padding and spacing
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen font-inter">
      {/* Page Header and Add Assistant Button - Stack on mobile, flex on larger screens */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6 border-b pb-3 md:pb-4 space-y-3 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left">
          Manage Assistants
        </h1>
        {/* Button - Full width on mobile, auto width on larger screens */}
        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out flex items-center justify-center sm:justify-start space-x-2 text-sm sm:text-base"
        >
          {/* Plus icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span>Add New Assistant</span>
        </button>
      </div>

      {/* Assistant List Section */}
      <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 md:mb-4 text-gray-700">
          Assistant List
        </h2>
        
        {assistantList.length === 0 ? (
          // Empty state message
          <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">
            No assistants added yet. Click "Add New Assistant" to get started.
          </p>
        ) : (
          // Responsive assistant list
          <div className="space-y-3 sm:space-y-0">
            {/* Mobile Card View - Hidden on larger screens */}
            <div className="block sm:hidden space-y-3">
              {assistantList.map((assistant) => (
                <div key={assistant.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg">{assistant.name}</h3>
                    <button
                      onClick={() => handleDeleteAssistant(assistant.id)}
                      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-full transition duration-200"
                      title="Delete Assistant"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-600">Phone:</span>
                      <span className="text-gray-900">{assistant.phone}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-600">Email:</span>
                      <span className="text-gray-900 break-all">{assistant.email}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-600">Area:</span>
                      <span className="text-gray-900">{assistant.area || 'N/A'}</span>
                    </div>
                    {assistant.description && (
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-600">Description:</span>
                        <span className="text-gray-900">{assistant.description}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View - Hidden on mobile */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                {/* Table Header */}
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th scope="col" className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Area
                    </th>
                    <th scope="col" className="hidden lg:table-cell px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-3 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                {/* Table Body */}
                <tbody className="bg-white divide-y divide-gray-200">
                  {assistantList.map((assistant) => (
                    <tr key={assistant.id}>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {assistant.name}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assistant.phone}
                      </td>
                      <td className="px-3 md:px-6 py-4 text-sm text-gray-500 max-w-xs">
                        <div className="truncate" title={assistant.email}>
                          {assistant.email}
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assistant.area || 'N/A'}
                      </td>
                      <td className="hidden lg:table-cell px-3 md:px-6 py-4 text-sm text-gray-500 max-w-xs">
                        <div className="truncate" title={assistant.description || 'N/A'}>
                          {assistant.description || 'N/A'}
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleDeleteAssistant(assistant.id)}
                          className="inline-flex items-center justify-center p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-full transition duration-200"
                          title="Delete Assistant"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Assistant Modal */}
      {showModal && (
        <AddAssistantModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleAddAssistant}
        />
      )}
    </div>
  );
};

export default AddAssistantPage;