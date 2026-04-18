import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Chatpage from "../page/Chatpage";
import chat from "../assets/chatLogo.png";
import { motion, AnimatePresence } from "framer-motion";
import { FiLogOut, FiMenu } from "react-icons/fi";
import ThemeToggle from "./ThemeToggle";
import socket from "../utils/socket";
import { setLostFoundAlert, clearLostFoundAlert } from "../utils/appSlice";
import { logout } from "../utils/userSlice";
import { clearStoredAuth } from "../utils/authUtils";

const HomeHeader = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const chatDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.user);
  const hasLostFoundAlert = useSelector((state) => state.app.hasLostFoundAlert);

  const [profileImage, setProfileImage] = useState(
    "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
  );

  const navItems = [
    { name: "Home", path: "/home" },
    { name: "Sell Now", path: "/sell" },
    { name: "Saved", path: "/favorites" },
    { name: "Lost & Found", path: "/lost-found" },
    { name: "Feedback", path: "/feedback" },
    ...(user?.isAdmin ? [{ name: "Admin", path: "/admin" }] : []),
  ];

  const handleLogout = () => {
    clearStoredAuth();
    dispatch(logout());
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate("/login", { replace: true });
  };

  // Clear alert when user visits the Lost & Found page
  useEffect(() => {
    if (location.pathname === "/lost-found") {
      dispatch(clearLostFoundAlert());
    }
  }, [location.pathname, dispatch]);

  // Listen for new lost & found tickets via socket
  useEffect(() => {
    const handleNewTicket = () => {
      // Only show alert if user is NOT already on the lost-found page
      if (location.pathname !== "/lost-found") {
        dispatch(setLostFoundAlert());
      }
    };
    socket.on("lost_found_ticket_created", handleNewTicket);
    return () => socket.off("lost_found_ticket_created", handleNewTicket);
  }, [dispatch, location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (
        chatDropdownRef.current &&
        !chatDropdownRef.current.contains(e.target)
      ) {
        setShowChat(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user && user.profileImage) {
      setProfileImage(user.profileImage);
    } else {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.profileImage) {
            setProfileImage(parsedUser.profileImage);
          }
        } catch (error) {
          console.error("Error parsing user from localStorage:", error);
        }
      }
    }
  }, [user]);

  return (
    <motion.header
      className="flex items-center justify-between px-6 py-3 sticky top-0 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm z-50 transition-all duration-300"
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-2 sm:gap-4">
        <motion.a
          href="/home"
          className="flex items-center"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.img
            src="https://res.cloudinary.com/dzkprawxw/image/upload/v1754247101/final_logo_z1ncld.png"
            alt="Logo"
            className="w-14 h-14 rounded-full object-cover shadow-sm"
            whileHover={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.6 }}
          />
        </motion.a>
      </div>

      {/* Center: Nav Items (hidden on mobile) */}
      <nav className="hidden md:flex flex-1 justify-center items-center">
        <div className="flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item, index) => {
            const isLostFound = item.path === "/lost-found";
            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative"
              >
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `transition-all duration-300 px-5 py-2.5 rounded-full font-semibold ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-sm border border-transparent hover:border-indigo-100"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
                {/* Red alert dot for Lost & Found */}
                {isLostFound && hasLostFoundAlert && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3 pointer-events-none">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </nav>

      {/* Right: Chat & Profile */}
      <div className="flex items-center gap-3 sm:gap-5">
        <ThemeToggle />
        {/* Chat */}
        <div className="relative" ref={chatDropdownRef}>
          <div
            className="w-10 cursor-pointer"
            onClick={() => setShowChat(!showChat)}
          >
            <motion.img
              src={chat}
              alt="Chat"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
              className="w-10 h-10 drop-shadow-sm"
            />
          </div>
          <AnimatePresence>
            {showChat && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="fixed right-4 sm:right-16 top-16 w-[90vw] sm:w-[70vw] md:w-[400px] h-[80vh] bg-white border border-gray-300 rounded-xl shadow-lg z-50 flex flex-col overflow-hidden"
              >
                <div className="p-2 border-b border-gray-200">
                  <h3 className="font-medium text-indigo-700">Messages</h3>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar p-2">
                  <Chatpage />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <motion.div
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-400 shadow-sm cursor-pointer hover:shadow-md hover:border-indigo-600 transition-all"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            whileTap={{ scale: 0.95 }}
          >
            <img
              src={profileImage}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";
              }}
            />
          </motion.div>
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-40 bg-white border rounded-xl shadow-xl z-10 overflow-hidden"
              >
                <button
                  onClick={() => navigate("/profile")}
                  className="block w-full text-left px-4 py-3 text-sm font-medium hover:bg-indigo-50 transition-colors"
                >
                  My Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 text-sm hover:bg-red-50 transition-colors border-t border-gray-100"
                >
                  <div className="flex items-center gap-2 text-black cursor-pointer hover:text-red-800">
                    <FiLogOut className="text-xl text-red-600" />
                    <span className="text-base font-medium">Logout</span>
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Hamburger menu for mobile */}
        <button
          className="md:hidden text-2xl text-indigo-700 p-2 hover:bg-indigo-50 rounded-full transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <FiMenu />
        </button>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
            className="md:hidden fixed top-0 right-0 w-3/4 max-w-xs h-full bg-white/95 backdrop-blur-xl border-l border-white/50 shadow-2xl z-50 p-6 flex flex-col gap-4"
          >
            <div className="flex justify-end pb-4 border-b border-gray-100">
                <button onClick={() => setMobileMenuOpen(false)} className="text-2xl text-gray-500 hover:text-indigo-600 transition-colors">
                    <FiLogOut className="rotate-180" /> {/* Just an icon to close */}
                </button>
            </div>
            {navItems.map((item, index) => {
              const isLostFound = item.path === "/lost-found";
              return (
                <div key={index} className="relative">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                        `px-4 py-3 rounded-xl text-center text-sm font-bold transition-all block ${
                          isActive
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                            : "bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100"
                        }`
                    }
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                    {isLostFound && hasLostFoundAlert && (
                      <span className="inline-flex ml-2 h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                      </span>
                    )}
                  </NavLink>
                </div>
              );
            })}
            <button
              className="mt-4 bg-red-50 border border-red-100 px-4 py-3 rounded-xl text-center text-sm font-bold text-red-700 hover:bg-red-100 transition-all flex justify-center items-center gap-2"
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
            >
              <FiLogOut className="text-xl" />
              <span>Logout</span>
            </button>
            <div className="mt-4 flex justify-center">
                <ThemeToggle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default HomeHeader;
