const TotalIssuesCard = () => {
  return (
    <div className="bg-gradient-to-tr from-teal-50 to-teal-100 rounded-xl p-4 shadow-md">
      <p className="text-gray-600 text-sm mb-1">Total Issues</p>
      <h2 className="text-4xl font-bold text-gray-800">128</h2>
      <p className="text-gray-500 text-xs">This month</p>

      {/* Dummy Graph Line - can replace with real chart later */}
      <svg className="w-full h-12 mt-2" viewBox="0 0 100 30" fill="none">
        <path
          d="M0,30 Q20,10 40,15 T80,20 T100,10"
          stroke="#0d9488"
          strokeWidth="2"
          fill="transparent"
        />
      </svg>
    </div>
  );
};

export default TotalIssuesCard;
