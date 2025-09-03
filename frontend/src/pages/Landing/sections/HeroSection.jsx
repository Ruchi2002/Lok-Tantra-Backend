import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  const handleViewDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <section className="w-full min-h-screen flex items-center bg-gradient-to-br from-green-100 to-yellow-50 px-4 sm:px-6 md:px-8 lg:px-16 py-12">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* Left side text */}
        <div className="text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-green-900 leading-tight mb-4 sm:mb-6">
            Digital Office Suite for <br /> Indian Politicians
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-6 sm:mb-8 max-w-md sm:max-w-xl mx-auto md:mx-0">
            Manage citizen issues, track constituency engagement, and plan impactful visits with ease.
            Transform thousands of unorganized requests into streamlined governance.
          </p>
          <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-3 sm:gap-4">
            <button className="bg-orange-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold hover:bg-orange-600 transition text-sm sm:text-base">
              Start 30-Day Free Trial
            </button>
            <button 
              onClick={handleViewDashboard}
              className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold hover:bg-blue-700 transition text-sm sm:text-base"
            >
              View Dashboard
            </button>
            <button className="border-2 border-teal-500 text-teal-600 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold hover:bg-teal-700 hover:text-white transition text-sm sm:text-base">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Right side Dashboard mock */}
        <div className="bg-white shadow-xl rounded-2xl p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 w-full md:h-auto">
          <div className="bg-green-100 text-green-900 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-semibold w-fit">
            Constituency Dashboard
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-purple-100 text-center rounded-lg py-4 sm:py-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-teal-700">245</h2>
              <p className="text-gray-700 text-xs sm:text-sm md:text-base">Active Issues</p>
            </div>
            <div className="bg-orange-100 text-center rounded-lg py-4 sm:py-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-600">18</h2>
              <p className="text-gray-700 text-xs sm:text-sm md:text-base">Urgent Cases</p>
            </div>
          </div>
          <div className="bg-gray-100 rounded px-2 sm:px-3 py-2 text-gray-700 text-xs sm:text-sm">
            Next Visit: Kanpur South - 12 meetings
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
