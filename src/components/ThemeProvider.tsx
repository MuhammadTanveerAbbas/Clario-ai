"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { applyTokens } from "@/lib/design-tokens";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined,
);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    // Get theme from localStorage or default to 'dark'
    const storedTheme = localStorage.getItem("clario-theme") as Theme | null;
    const initialTheme = storedTheme || "dark";

    if (initialTheme !== theme) {
      setThemeState(initialTheme);
    }

    // Apply theme to document
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(initialTheme);
    applyTokens(initialTheme);
  }, []);

  useEffect(() => {
    // Apply theme changes
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    applyTokens(theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("clario-theme", newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
