const Testimonial = () => {
  const testimonial = [
    {
      name: "Ananya Sharma",
      role: "Member of Parliament",
      feedback:
        "SmartPolitician has helped me stay connected with my citizens like never before. Managing issues is now seamless!",
    },
    {
      name: "Rohit Singh",
      role: "Ward Councilor",
      feedback:
        "The platform’s simplicity and power are unmatched. Solved 200+ local issues in just 3 months!",
    },
    {
      name: "Priya Desai",
      role: "MLA Maharashtra",
      feedback:
        "An absolute game-changer for constituency management. I recommend this to every public servant.",
    },
  ];
  return (
    <section id="testimonials" className="py-24 bg-gradient-to-r from-indigo-50 to-purple-100 text-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
          What Our Users Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonial.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300"
            >
              <p className="text-lg italic mb-4">"{testimonial.feedback}"</p>
              <h4 className="font-semibold text-purple-800">
                {testimonial.name}
              </h4>
              <p className="text-sm font-bold text-gray-500">
                {testimonial.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
