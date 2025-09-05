import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../hooks/useAuth';

const MainCards = () => {
  const navigate = useNavigate();
  const { t, tSection } = useTranslation();
  const { isFieldAgent } = useAuth();
  const tDashboard = tSection('dashboard');
  return (
    <>
      {/* First Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6"
      
      >
        <div 
          className={`bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 transition-all duration-300 ${
            isFieldAgent() 
              ? 'cursor-not-allowed opacity-50' 
              : 'cursor-pointer hover:shadow-lg hover:bg-gray-50'
          }`}
          onClick={() => !isFieldAgent() && navigate('/dashboard/lok-sabha')}
          onKeyDown={(e) => {
            if (!isFieldAgent() && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              navigate('/dashboard/lok-sabha');
            }
          }}
          tabIndex={isFieldAgent() ? -1 : 0}
          role="button"
          aria-label={isFieldAgent() ? "Lok Sabha Session (Access Restricted)" : "Navigate to Lok Sabha Session page"}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v2H7V5zm6 4H7v2h6V9zm0 4H7v2h6v-2z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">{tDashboard('lokSabhaSession')}</h3>
          </div>
          <div className="text-gray-600 text-sm">
            <p>{tDashboard('sessionUpdatesAndProceedings')}</p>
          </div>
        </div>
        
        <div 
          className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 cursor-pointer hover:shadow-lg transition-all duration-300"
          onClick={() => navigate('/dashboard/received-letters')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate('/dashboard/received-letters');
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Navigate to Received Letters page"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">{tDashboard('receivedLetters')}</h3>
          </div>
          <div className="text-gray-600 text-sm">
            <p>{tDashboard('incomingCorrespondence')}</p>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 cursor-pointer hover:shadow-lg transition-all duration-300 hover:bg-gray-50"
          onClick={() => navigate('/dashboard/sent-letters')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate('/dashboard/sent-letters');
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Navigate to Sent Letters page"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">{tDashboard('sentLettersPublicInterest')}</h3>
          </div>
          <div className="text-gray-600 text-sm">
            <p>{tDashboard('outgoingPublicInterestLetters')}</p>
          </div>
        </div>
        
        <div 
          className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 cursor-pointer hover:shadow-lg transition-all duration-300 hover:bg-gray-50"
          onClick={() => navigate('/dashboard/sent-grievance-letters')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate('/dashboard/sent-grievance-letters');
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Navigate to Sent Grievance Letters page"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">{tDashboard('sentLettersPublicGrievance')}</h3>
          </div>
          <div className="text-gray-600 text-sm">
            <p>{tDashboard('grievanceResponseLetters')}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainCards;
