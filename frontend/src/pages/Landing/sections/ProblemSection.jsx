import { AlertCircle, Clock, XOctagon, Users, MessageSquareWarning, FileWarning } from "lucide-react";

const ProblemSection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-indigo-50 to-purple-100 text-gray-900">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
          Problems We Solve
        </h2>
        <p className="max-w-2xl mx-auto text-lg text-gray-600 mb-14">
          We make governance smarter by solving the key issues politicians and citizens face when trying to work together effectively.
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Card 1 */}
          <div className="bg-white shadow-lg rounded-2xl p-8 hover:scale-105 transition-transform duration-300">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-purple-600" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Lack of Transparency</h3>
            <p className="text-gray-600">
              Citizens don’t know where their complaints go. We bring complete transparency and traceability to the process.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white shadow-lg rounded-2xl p-8 hover:scale-105 transition-transform duration-300">
            <div className="flex justify-center mb-4">
              <Clock className="h-12 w-12 text-purple-600" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Slow Response Time</h3>
            <p className="text-gray-600">
              Complaints often take weeks or months to get addressed. We help speed up the response loop.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white shadow-lg rounded-2xl p-8 hover:scale-105 transition-transform duration-300">
            <div className="flex justify-center mb-4">
              <XOctagon className="h-12 w-12 text-purple-600" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">No Follow-Up</h3>
            <p className="text-gray-600">
              Most platforms don’t offer status updates. With us, citizens know exactly when their issues are resolved.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white shadow-lg rounded-2xl p-8 hover:scale-105 transition-transform duration-300">
            <div className="flex justify-center mb-4">
              <Users className="h-12 w-12 text-purple-600" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Disconnected Teams</h3>
            <p className="text-gray-600">
              Representatives and their teams often work in silos. We provide a single platform for collaboration.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-white shadow-lg rounded-2xl p-8 hover:scale-105 transition-transform duration-300">
            <div className="flex justify-center mb-4">
              <MessageSquareWarning className="h-12 w-12 text-purple-600" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Overwhelming Workload</h3>
            <p className="text-gray-600">
              Politicians can get buried in paperwork and manual work. Automation features keep things manageable.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-white shadow-lg rounded-2xl p-8 hover:scale-105 transition-transform duration-300">
            <div className="flex justify-center mb-4">
              <FileWarning className="h-12 w-12 text-purple-600" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Missing Data</h3>
            <p className="text-gray-600">
              Many teams work without the right data to make decisions. We give insights & reporting at their fingertips.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
