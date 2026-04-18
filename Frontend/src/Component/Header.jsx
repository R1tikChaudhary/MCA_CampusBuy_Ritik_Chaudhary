import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";
import ThemeToggle from "./ThemeToggle";

const Header = () => {
  const { showLogin, showSignup } = useSelector((state) => state.header);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-3 sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm transition-all duration-300">
      {/* Logo */}
      <Link to="/" className="flex items-center">
        <motion.img
          src="https://res.cloudinary.com/dzkprawxw/image/upload/v1754247101/final_logo_z1ncld.png"
          alt="Logo"
          className="w-14 h-14 rounded-full object-cover"
          whileHover={{ rotate: [0, 8, -8, 0] }}
          transition={{ duration: 0.5 }}
        />
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center space-x-4">
        {showLogin && (
          <Link
            to="/login"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg hover:shadow-indigo-500/30 px-6 py-2.5 rounded-full font-bold hover:-translate-y-0.5 transition-all duration-300"
          >
            Login
          </Link>
        )}
        {showSignup && (
          <Link
            to="/signup"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg hover:shadow-indigo-500/30 px-6 py-2.5 rounded-full font-bold hover:-translate-y-0.5 transition-all duration-300"
          >
            Sign up
          </Link>
        )}
        <ThemeToggle />
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center gap-2">
        <ThemeToggle />
        <button
          className="text-2xl text-indigo-700"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            transition={{ duration: 0.3 }}
            className="md:hidden absolute top-16 right-4 w-48 bg-white rounded-lg shadow-lg p-4 flex flex-col space-y-3"
          >
            {showLogin && (
              <Link
                to="/login"
                className="bg-indigo-100 px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-500 hover:text-white transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
            {showSignup && (
              <Link
                to="/signup"
                className="bg-indigo-100 px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-500 hover:text-white transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign up
              </Link>
            )}
            <div className="pt-1">
              <ThemeToggle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
