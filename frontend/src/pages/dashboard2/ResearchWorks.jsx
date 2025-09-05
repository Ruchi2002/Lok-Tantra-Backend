import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../hooks/useAuth';

const ResearchWorks = () => {
  const navigate = useNavigate();
  const { t, tSection } = useTranslation();
  const { isFieldAgent } = useAuth();
  const tDashboard = tSection('dashboard');

  return (
    <div 
      className={`bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 transition-all duration-300 ${
        isFieldAgent() 
          ? 'cursor-not-allowed opacity-50' 
          : 'cursor-pointer hover:shadow-lg hover:bg-gray-50'
      }`}
      onClick={() => !isFieldAgent() && navigate('/dashboard/research-repository')}
      onKeyDown={(e) => {
        if (!isFieldAgent() && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          navigate('/dashboard/research-repository');
        }
      }}
      tabIndex={isFieldAgent() ? -1 : 0}
      role="button"
      aria-label={isFieldAgent() ? "Research Works (Access Restricted)" : "Navigate to Research Repository page"}
    >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{tDashboard('researchWorksAndSpeeches')}</h3>
                 <div className="text-gray-600 text-sm">
           <p>{tDashboard('researchPublicationsAndSpeechArchives')}</p>
         </div>
       </div>
     );
   };

export default ResearchWorks;
