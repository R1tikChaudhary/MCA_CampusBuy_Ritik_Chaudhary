const THEME_STORAGE_KEY = "theme";

export const getPreferredTheme = () => {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const applyTheme = (theme) => {
  const isDark = theme === "dark";
  document.documentElement.setAttribute("data-theme", theme);
  document.body.classList.toggle("dark-theme", isDark);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
};

export const initializeTheme = () => {
  const theme = getPreferredTheme();
  applyTheme(theme);
  return theme;
};
