// src/pages/Assistants Page/AddAssistantPage.jsx
import React, { useState, useEffect } from 'react';
import AddAssistantModal from './AddAssistantModal';
import EditFieldAgentModal from './EditFieldAgentModal';
import fieldAgentApi from '../../services/fieldAgentApi'; 

const AddAssistantPage = () => {
 
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFieldAgent, setSelectedFieldAgent] = useState(null);
  const [assistantList, setAssistantList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [fieldAgentPasswords, setFieldAgentPasswords] = useState({});

  // Fetch Field Agents from backend on component mount
  useEffect(() => {
    fetchFieldAgents();
  }, []);

  const fetchFieldAgents = async () => {
    try {
      setLoading(true);
      setError("");
      const fieldAgents = await fieldAgentApi.getFieldAgents();
      setAssistantList(fieldAgents);
    } catch (error) {
      console.error('Error fetching Field Agents:', error);
      setError(error.message || 'Failed to fetch Field Agents');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles adding a new assistant to the list.
   * @param {object} newAssistant - The new assistant data from the backend.
   */
  const handleAddAssistant = (newAssistant) => {
    setAssistantList((prev) => [...prev, newAssistant]);
    setShowModal(false); 
  };

  /**
   * Handles editing a Field Agent.
   * @param {object} fieldAgent - The Field Agent to edit.
   */
  const handleEditFieldAgent = (fieldAgent) => {
    setSelectedFieldAgent(fieldAgent);
    setShowEditModal(true);
  };

  /**
   * Handles updating a Field Agent.
   * @param {object} updatedFieldAgent - The updated Field Agent data.
   */
  const handleUpdateFieldAgent = (updatedFieldAgent) => {
    setAssistantList((prev) => 
      prev.map(agent => 
        agent.id === updatedFieldAgent.id ? updatedFieldAgent : agent
      )
    );
    setShowEditModal(false);
    setSelectedFieldAgent(null);
  };

  /**
   * Toggles password visibility and fetches passwords if needed
   */
  const togglePasswordVisibility = async () => {
    if (!showPasswords) {
      // Fetch passwords for all field agents
      const passwordPromises = assistantList.map(async (agent) => {
        try {
          const details = await fieldAgentApi.getFieldAgentDetails(agent.id);
          return { id: agent.id, password: details.password };
        } catch (error) {
          console.error(`Error fetching password for ${agent.name}:`, error);
          return { id: agent.id, password: '******' };
        }
      });
      
      const passwords = await Promise.all(passwordPromises);
      const passwordMap = {};
      passwords.forEach(({ id, password }) => {
        passwordMap[id] = password;
      });
      setFieldAgentPasswords(passwordMap);
    }
    setShowPasswords(!showPasswords);
  };

  /**

   * @param {string | number} idToDelete - The unique ID of the assistant to delete.
   * 
   */
  const handleDeleteAssistant = async (idToDelete) => {
    // A simple browser confirmation. For a production app, consider a custom confirmation dialog.
    if (window.confirm("Are you sure you want to delete this Field Agent? This action cannot be undone.")) {
      try {
        await fieldAgentApi.deleteFieldAgent(idToDelete);
        setAssistantList((prev) => prev.filter(assistant => assistant.id !== idToDelete));
      } catch (error) {
        console.error('Error deleting Field Agent:', error);
        alert(error.message || 'Failed to delete Field Agent');
      }
    }
  };

  return (
    // Main container - responsive padding and spacing
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen font-inter">
      {/* Page Header and Action Buttons - Stack on mobile, flex on larger screens */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6 border-b pb-3 md:pb-4 space-y-3 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left">
          Manage Field Agents
        </h1>
        {/* Action Buttons - Full width on mobile, auto width on larger screens */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <button
            onClick={togglePasswordVisibility}
            className={`w-full sm:w-auto px-3 py-2 rounded-lg transition duration-200 flex items-center justify-center sm:justify-start space-x-2 text-sm ${
              showPasswords 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              {showPasswords ? (
                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
              ) : (
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              )}
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            <span>{showPasswords ? 'Hide Passwords' : 'Show Passwords'}</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out flex items-center justify-center sm:justify-start space-x-2 text-sm sm:text-base"
          >
            {/* Plus icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>Add New Field Agent</span>
          </button>
        </div>
      </div>

      {/* Field Agent List Section */}
      <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 md:mb-4 text-gray-700">
          Field Agent List
        </h2>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
            <button 
              onClick={fetchFieldAgents}
              className="ml-2 text-red-600 hover:text-red-800 underline"
            >
              Retry
            </button>
          </div>
        )}
        
        {/* Loading State */}
        {loading ? (
          <div className="text-center py-6 sm:py-8">
            <div className="inline-flex items-center space-x-2 text-gray-500">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <span>Loading Field Agents...</span>
            </div>
          </div>
        ) : assistantList.length === 0 ? (
          // Empty state message
          <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">
            No Field Agents added yet. Click "Add New Field Agent" to get started.
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
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditFieldAgent(assistant)}
                        className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-full transition duration-200"
                        title="Edit Field Agent"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteAssistant(assistant.id)}
                        className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-full transition duration-200"
                        title="Delete Field Agent"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
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
                      <span className="font-medium text-gray-600">Password:</span>
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded w-fit">
                        {showPasswords ? (fieldAgentPasswords[assistant.id] || '******') : '******'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-600">Status:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full w-fit ${
                        assistant.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {assistant.status || 'active'}
                      </span>
                    </div>
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
                    <th scope="col" className="hidden lg:table-cell px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Password
                    </th>
                    <th scope="col" className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
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
                      <td className="hidden lg:table-cell px-3 md:px-6 py-4 text-sm text-gray-500">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {showPasswords ? (fieldAgentPasswords[assistant.id] || '******') : '******'}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-4 text-sm text-gray-500">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          assistant.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {assistant.status || 'active'}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEditFieldAgent(assistant)}
                            className="inline-flex items-center justify-center p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-full transition duration-200"
                            title="Edit Field Agent"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteAssistant(assistant.id)}
                            className="inline-flex items-center justify-center p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-full transition duration-200"
                            title="Delete Field Agent"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
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

      {/* Edit Field Agent Modal */}
      {showEditModal && selectedFieldAgent && (
        <EditFieldAgentModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedFieldAgent(null);
          }}
          fieldAgent={selectedFieldAgent}
          onUpdate={handleUpdateFieldAgent}
        />
      )}
    </div>
  );
};

export default AddAssistantPage;