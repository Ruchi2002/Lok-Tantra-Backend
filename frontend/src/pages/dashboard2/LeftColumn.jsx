import React from 'react';

const LeftColumn = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full">
      <h3 className="text-xl font-bold text-gray-800 mb-6">
        Top most works to be watched and their update
      </h3>
      <div className="space-y-3">
        {[...Array(9)].map((_, index) => (
          <div key={index} className="text-blue-700 hover:text-blue-900 cursor-pointer text-sm font-medium p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-all duration-300 border border-blue-100 hover:border-blue-200">
            Test
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeftColumn;
