const Pricing = () => {
  const plan = [
    {
      name: "Free",
      Price: "₹0",
      targetUsers: "Trial users, party karyakartas",
      limits: ["50 entries/month"],
    },
    {
      name: "Basic",
      Price: "₹499/mo",
      targetUsers: "Local leaders, Block Pramukhs",
      limits: ["3 Staff Logins"],
    },
    {
      name: "Premium",
      Price: "₹1,999/mo",
      targetUsers: "Sitting MLA , MPs",
      limits: ["Unlimited logins ", "Whatsapp enabled"],
      popular: true,
    },
    {
      name: "Enterprise",
      Price: "Custom Pricing",
      targetUsers: "Political Parties Agencies",
      limits: ["Regional Dashboard", "AI Insight"],
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-[#FAF7F0] text-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-black-500 mb-12">
          💼 Business Plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-8">
          {plan.map((plan, index) => (
            <div
              key={index}
              className={`border rounded-lg p-6 shadow-md transition hover:shadow-xl ${
                plan.popular ? "border-teal-500" : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="text-sm bg-teal-500 text-white px-3 py-1 rounded-full inline-block mb-4">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {plan.name}
              </h3>
              <p className="text-3xl font-extrabold text-teal-600 mb-2">
                {plan.Price}
              </p>
              <p className="text-gray-600 text-sm mb-4">{plan.targetUsers}</p>
              <ul className="text-sm space-y-2 mb-6 text-gray-700">
                {plan.limits.map((limit, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    ✅ <span>{limit}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full bg-teal-500 text-white py-2 rounded-full hover:bg-teal-600 text-sm">
                {plan.prize === "₹0 / month" ? "Start for Free" : "Choose Plan"}
              </button>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
};

export default Pricing;
