import { FaUserPlus, FaMapMarkedAlt, FaClipboardList, FaCheckCircle } from "react-icons/fa";

const HowItWorks = () => {
  const steps = [
    {
      title: "Sign Up",
      description: "Create your account in just a few clicks with your official details.",
      icon: <FaUserPlus className="text-4xl text-teal-500" />,
    },
    {
      title: "Add Constituency",
      description: "Register your constituency and start adding the key members of your team.",
      icon: <FaMapMarkedAlt className="text-4xl text-teal-500" />,
    },
    {
      title: "Track Issues",
      description: "Get real-time citizen issue reports directly inside your dashboard.",
      icon: <FaClipboardList className="text-4xl text-teal-500" />,
    },
    {
      title: "Take Action",
      description: "Assign, resolve, and close issues to build citizen trust efficiently.",
      icon: <FaCheckCircle className="text-4xl text-teal-500" />,
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-4">How It Works</h2>
        <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
          Manage citizen issues with ease and transparency. Our platform simplifies the entire process for you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white border-2 border-transparent hover:border-teal-400 rounded-2xl p-6 shadow-md hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <div className="flex justify-center mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
