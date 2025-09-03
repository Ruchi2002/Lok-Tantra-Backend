import React from 'react';

const SocialMedia = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Social Media Handles and Their Hits</h3>
        </div>
                 <div className="text-gray-600 text-sm">
           <p>Social media engagement metrics</p>
         </div>
       </div>
     );
   };

export default SocialMedia;
