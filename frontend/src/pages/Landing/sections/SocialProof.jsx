const SocialProof = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto text-center px-4 my-14">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Trusted by Leaders & Public Representatives
        </h2>
        <p className="text-gray-600 mb-10">
          MPs, MLAs & Local Leaders are already using SmartPolitician Assistant
          to stay connected with their people.
        </p>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-700 font-medium">
          <div className="bg-[#F3F1F8] p-8 rounded-lg text-center">
            <h3 className="text-4xl font-bold text-teal-500">500+</h3>
            <p>Politicians onboard</p>
          </div>
          <div className="bg-[#FAF7F0] p-8 rounded-lg text-center">
            <h3 className="text-4xl font-bold text-teal-500">10K+</h3>
            <p>Citizen issues resolved</p>
          </div>
          <div className="bg-[#FEFDFB] p-8 rounded-lg text-center">
            <h3 className="text-4xl font-bold text-teal-500">150+</h3>
            <p>Constituencies covered</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
