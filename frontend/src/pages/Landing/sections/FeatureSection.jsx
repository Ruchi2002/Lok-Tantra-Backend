import { FaUserPlus, FaMapMarkedAlt, FaWhatsapp, FaMicrophone, FaLanguage, FaChartBar } from "react-icons/fa";

const FeaturesSection = () => {
  return (
    <section className="py-16 bg-[#FAF7F0]" id="features">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Your Complete Digital Assistant</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage your constituency efficiently and transparently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard icon={<FaUserPlus />} title="Citizen & Issue Tracking" desc="Capture name, phone, location, and issue description with voice-to-text and photo uploads. Never lose a citizen request again." />
          <FeatureCard icon={<FaMapMarkedAlt />} title="Smart Heatmaps" desc="Visual dashboards showing hotspots of complaints, unresolved issues, and priority zones across your constituency." />
          <FeatureCard icon={<FaWhatsapp />} title="WhatsApp Integration" desc="Send automatic updates to citizens, confirm appointments, and trigger follow-ups directly through WhatsApp." />
          <FeatureCard icon={<FaMicrophone />} title="AI Voice Notes" desc="Record quick voice notes that automatically transcribe and link to citizen files using advanced AI technology." />
          <FeatureCard icon={<FaLanguage />} title="Multilingual Support" desc="Interface available in Hindi, Marathi, Bengali, Tamil, and more regional languages based on your constituency." />
          <FeatureCard icon={<FaChartBar />} title="Performance Reports" desc="Generate monthly, quarterly reports for party presentations. Export as PDF or share directly via WhatsApp." />
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white p-8 rounded-2xl shadow hover:shadow-lg transition">
    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-400 to-rose-300 flex items-center justify-center text-white text-3xl mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-800 mb-3">{title}</h3>
    <p className="text-gray-600">{desc}</p>
  </div>
);

export default FeaturesSection;
