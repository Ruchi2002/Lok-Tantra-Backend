// import React, { useState } from "react";
// import { FaPlay, FaClock } from "react-icons/fa";

// const ActionButtons = () => {
//   const [loading, setLoading] = useState(false);

//   const handleGenerate = () => {
//     setLoading(true);
//     // Fake async task — replace with your logic
//     setTimeout(() => {
//       alert("✅ Report Generated!");
//       setLoading(false);
//     }, 1500);
//   };

//   const handleSchedule = () => {
//     // Here you can open a modal or redirect
//     alert("📅 Schedule Report: Feature coming soon!");
//   };

//   return (
//     <div className="flex flex-wrap gap-4 mt-4">
//       {/* ▶️ Generate Report */}
//       <button
//         onClick={handleGenerate}
//         disabled={loading}
//         className={`flex items-center gap-2 px-4 py-2 rounded text-white font-medium transition-all duration-200 ${
//           loading
//             ? "bg-gray-400 cursor-not-allowed"
//             : "bg-green-600 hover:bg-green-700"
//         }`}
//       >
//         <FaPlay />
//         {loading ? "Generating..." : "Generate Report"}
//       </button>

      
//     </div>
//   );
// };

// export default ActionButtons;
import React from 'react'

function ActionButtons() {
  return (
    <div>ActionButtons</div>
  )
}

export default ActionButtons
