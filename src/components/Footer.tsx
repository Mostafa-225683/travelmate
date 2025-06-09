import {
  Plane,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#1a1d26] text-white py-12 px-6 md:px-10 animate-fade-in-up">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand + Description */}
          <div>
            <div className="flex items-center mb-4 cursor-pointer transition-transform duration-300 hover:scale-105">
              <Plane className="h-6 w-6 text-blue-500 mr-2 animate-pulse" />
              <span className="text-xl font-bold">
                TravelMate
              </span>
            </div>
            <p className="text-gray-400 mb-4">
              Discover your perfect destination with our AI-powered travel recommendation system.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 transform hover:scale-110 cursor-pointer">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 transform hover:scale-110 cursor-pointer">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 transform hover:scale-110 cursor-pointer">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="/" className="hover:text-blue-400 transition-colors duration-300 cursor-pointer inline-block">
                  Home
                </a>
              </li>
              <li>
                <a href="/destinations" className="hover:text-blue-400 transition-colors duration-300 cursor-pointer inline-block">
                  Destinations
                </a>
              </li>
              <li>
                <a href="#quiz-section" className="hover:text-blue-400 transition-colors duration-300 cursor-pointer inline-block">
                  Find Your Destination
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-blue-400 transition-colors duration-300 cursor-pointer inline-block">
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Top Destinations */}
          <div>
            <h3 className="text-lg font-bold mb-4">Top Destinations</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors duration-300 cursor-pointer inline-block">
                  Bali, Indonesia
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors duration-300 cursor-pointer inline-block">
                  Kyoto, Japan
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors duration-300 cursor-pointer inline-block">
                  Swiss Alps
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors duration-300 cursor-pointer inline-block">
                  Barcelona, Spain
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                <span>123 Travel Lane, Explorer City, 10001</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-blue-500 mr-2" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-blue-500 mr-2" />
                <span>info@travelmate.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} TravelMate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
