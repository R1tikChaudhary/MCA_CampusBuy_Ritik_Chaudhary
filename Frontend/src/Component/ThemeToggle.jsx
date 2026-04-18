import React, { useEffect, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { applyTheme, getPreferredTheme } from "../utils/themeUtils";

const ThemeToggle = () => {
  const [theme, setTheme] = useState(getPreferredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
      className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 bg-white/70 text-gray-700 hover:bg-indigo-100 transition"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
    </button>
  );
};

export default ThemeToggle;
