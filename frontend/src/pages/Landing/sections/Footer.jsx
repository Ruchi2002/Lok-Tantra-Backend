import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-[#f9f7f3] text-black-800 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Logo & Description */}
        <div>
          <h2 className="text-2xl font-bold text-black-800 mb-2">SmartPolitician</h2>
          <p className="text-black-800 text-sm">
            Empowering Indian leaders with smarter governance tools. Manage citizen requests, plan impactful work, and deliver transparency.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm text-black-800">
            <li><a href="#features" className="hover:text-white">Features</a></li>
            <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
            <li><a href="#how-it-works" className="hover:text-white">How It Works</a></li>
            <li><a href="#testimonials" className="hover:text-white">Testimonials</a></li>
            <li><a href="#contact" className="hover:text-white">Contact</a></li>
          </ul>
        </div>

        {/* Product */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Product</h3>
          <ul className="space-y-2 text-sm text-black-800">
            <li><a href="#" className="hover:text-teal-800">Login</a></li>
            <li><a href="#" className="hover:text-teal-800">Sign Up</a></li>
            <li><a href="#" className="hover:text-teal-800">Request Demo</a></li>
            <li><a href="#" className="hover:text-teal-800">Support</a></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Connect With Us</h3>
          <div className="flex gap-4 text-xl">
            <a href="#" className="hover:text-teal-800"><FaFacebookF /></a>
            <a href="#" className="hover:text-teal-800"><FaTwitter /></a>
            <a href="#" className="hover:text-teal-800"><FaLinkedinIn /></a>
            <a href="#" className="hover:text-teal-800"><FaInstagram /></a>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm text-black-800">
        © {new Date().getFullYear()} SmartPolitician. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
