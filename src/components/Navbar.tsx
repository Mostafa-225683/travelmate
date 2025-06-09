import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, User, LogOut, Globe, Heart, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSavedHotels } from "../context/SavedHotelsContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient"; // make sure this path is correct

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { savedCount } = useSavedHotels();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate("/login"); // or navigate('/') if you prefer to go to the homepage
  };

  return (
    <nav className="bg-white shadow-lg backdrop-blur-md bg-opacity-90 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link
                to="/"
                className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
                style={{ fontFamily: '"Poppins", sans-serif' }}
              >
                TravelMate
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-blue-500 transition-all duration-200 hover:text-blue-600"
              >
                Home
              </Link>
              <Link
                to="/destinations"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-blue-500 transition-all duration-200 hover:text-blue-600"
              >
                Destinations
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-blue-500 transition-all duration-200 hover:text-blue-600"
              >
                Contact
              </Link>
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">

            {/* Saved Destinations */}
            <Link
              to="/profile#saved"
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200 group"
              aria-label="Saved destinations"
            >
              <Heart className="h-5 w-5 transform group-hover:scale-110 transition-transform duration-200" />
              {savedCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                  {savedCount}
                </span>
              )}
            </Link>

            {user && (
              <div className="hidden sm:block text-gray-700 text-sm font-medium mr-2">
                Welcome,{" "}
                <span className="text-blue-600">
                  {user.name?.split(" ")[0]}
                </span>
                !
              </div>
            )}

            {user ? (
              <div className="ml-3 relative">
                <div>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  </button>
                </div>
                {isProfileOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-xl py-1 bg-white/95 backdrop-blur-sm ring-1 ring-black/5 focus:outline-none transform opacity-100 scale-100 transition-all duration-200 ease-out">
                    <div className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg font-semibold shadow-inner">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-gray-500 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                      >
                        <User className="h-4 w-4" />
                        View Profile
                      </Link>
                      <Link
                        to="/profile#trips"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm-3 6h-3v3h3v-3z"
                          />
                        </svg>
                        My Bookings
                      </Link>
                      <Link
                        to="/profile#settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </div>
                    <div className="border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-purple-600 hover:to-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Home
            </Link>
            <Link
              to="/destinations"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Destinations
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Contact
            </Link>
          </div>
          {user ? (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg font-semibold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {user.name}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {user.email}
                  </div>
                  {user && (
                    <div className="text-sm text-blue-600 font-semibold mt-1">
                      Welcome, {user.name?.split(" ")[0]}!
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  <User className="h-5 w-5" />
                  View Profile
                </Link>
                <Link
                  to="/profile#trips"
                  className="flex items-center gap-2 px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm-3 6h-3v3h3v-3z"
                    />
                  </svg>
                  My Bookings
                </Link>
                <Link
                  to="/profile#settings"
                  className="flex items-center gap-2 px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  <Settings className="h-5 w-5" />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="space-y-1">
                <Link
                  to="/login"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Sign up
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
