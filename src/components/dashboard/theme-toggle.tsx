"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

type ThemePreference = "light" | "dark";

const storageKey = "leadops-color-scheme";
const themeFadeMs = 120;
let themeFadeTimeout: number | undefined;

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  );

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";

    fadeThemeChange(() => {
      localStorage.setItem(storageKey, nextTheme);
      syncTheme();
    });
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

function syncTheme() {
  const storedTheme = localStorage.getItem(storageKey);
  const explicitTheme =
    storedTheme === "light" || storedTheme === "dark" ? storedTheme : null;
  const systemTheme = getSystemTheme();
  const activeTheme = explicitTheme ?? systemTheme;

  document.documentElement.classList.toggle("dark", activeTheme === "dark");

  if (explicitTheme) {
    document.documentElement.dataset.theme = explicitTheme;
    document.documentElement.style.colorScheme = explicitTheme;
  } else {
    delete document.documentElement.dataset.theme;
    document.documentElement.style.colorScheme = "";
  }

  document
    .querySelector('meta[name="color-scheme"]')
    ?.setAttribute("content", explicitTheme ?? "light dark");
  window.dispatchEvent(new Event("leadops-theme-change"));
}

function fadeThemeChange(applyThemeChange: () => void) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    applyThemeChange();
    return;
  }

  window.clearTimeout(themeFadeTimeout);
  document.documentElement.dataset.themeFade = "out";

  themeFadeTimeout = window.setTimeout(() => {
    applyThemeChange();
    document.documentElement.dataset.themeFade = "in";

    themeFadeTimeout = window.setTimeout(() => {
      delete document.documentElement.dataset.themeFade;
    }, themeFadeMs);
  }, themeFadeMs);
}

function getThemeSnapshot(): ThemePreference {
  const storedTheme = localStorage.getItem(storageKey);

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return getSystemTheme();
}

function getServerThemeSnapshot(): ThemePreference {
  return "light";
}

function subscribeToTheme(callback: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const handleThemeChange = () => {
    syncTheme();
    callback();
  };

  window.addEventListener("leadops-theme-change", callback);
  window.addEventListener("storage", handleThemeChange);
  media.addEventListener("change", handleThemeChange);

  return () => {
    window.removeEventListener("leadops-theme-change", callback);
    window.removeEventListener("storage", handleThemeChange);
    media.removeEventListener("change", handleThemeChange);
  };
}

function getSystemTheme(): ThemePreference {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}
