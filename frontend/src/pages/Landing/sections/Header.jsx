import { useState } from "react";
import Login from "../../Dashboard/component/Login";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow z-50">
      <div className="mx-auto max-w-7xl flex justify-between items-center px-4 py-3">
        {/* Logo */}
        <div className="text-2xl font-bold text-teal-600">SmartPolitician</div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-8 text-gray-800 font-medium items-center">
          <a href="#features" className="hover:text-teal-600">Features</a>
          <a href="#how-it-works" className="hover:text-teal-600">How it Works</a>
          <a href="#testimonials" className="hover:text-teal-600">Testimonials</a>
          <a href="#pricing" className="hover:text-teal-600">Pricing</a>

        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-4 ml-6">
          <a href="/superadmin" className="text-gray-800 hover:text-teal-600 font-medium whitespace-nowrap">
           Super Admin
          </a>
          <a
            href="/login"
            className="bg-teal-500 text-white px-4 py-2 rounded-full hover:bg-teal-600 whitespace-nowrap"
          >
           Login
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-3xl text-gray-700 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "✖" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <nav className="flex flex-col gap-4 p-4 text-gray-700 font-medium">
            <a href="#features" className="hover:text-teal-600" onClick={() => setIsOpen(false)}>Features</a>
            <a href="#how-it-works" className="hover:text-teal-600" onClick={() => setIsOpen(false)}>How it Works</a>
            <a href="#testimonials" className="hover:text-teal-600" onClick={() => setIsOpen(false)}>Testimonials</a>
            <a href="#pricing" className="hover:text-teal-600" onClick={() => setIsOpen(false)}>Pricing</a>
           
            <div className="flex flex-col gap-2 mt-2">
              <a
                href="/login"
                className="w-full border border-teal-500 text-teal-600 text-center py-2 rounded-full font-semibold hover:bg-teal-50"
                onClick={() => setIsOpen(false)}
              >
                Login
              </a>
              <a
                href="/login"
                className="w-full bg-teal-500 text-white text-center py-2 rounded-full font-semibold hover:bg-teal-600"
                onClick={() => setIsOpen(false)}
              >
                Sign Up
              </a>
            </div>
            <button
            
            ><a href="/dashboard">Login</a>

            </button>
          </nav>
        </div>
      )}
    </header>
  );
  
};

export default Header;
