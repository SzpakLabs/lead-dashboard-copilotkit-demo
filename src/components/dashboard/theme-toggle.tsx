"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

type ThemePreference = "light" | "dark";

const storageKey = "leadops-color-scheme";

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  );

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    localStorage.setItem(storageKey, nextTheme);
    applyTheme(nextTheme);
  }

  const isDark = theme === "dark";

  return (
    <button
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-pressed={isDark}
      className="ops-icon-button"
      type="button"
      onClick={toggleTheme}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

function applyTheme(theme: ThemePreference) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document
    .querySelector('meta[name="color-scheme"]')
    ?.setAttribute("content", theme);
  window.dispatchEvent(new Event("leadops-theme-change"));
}

function getThemeSnapshot(): ThemePreference {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function getServerThemeSnapshot(): ThemePreference {
  return "light";
}

function subscribeToTheme(callback: () => void) {
  window.addEventListener("leadops-theme-change", callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener("leadops-theme-change", callback);
    window.removeEventListener("storage", callback);
  };
}
