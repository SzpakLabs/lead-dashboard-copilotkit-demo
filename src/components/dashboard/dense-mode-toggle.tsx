"use client";

import { Rows3 } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";

type DensityPreference = "comfortable" | "dense";

const storageKey = "leadops-density";

export function DenseModeToggle() {
  const density = useSyncExternalStore(
    subscribeToDensity,
    getDensitySnapshot,
    getServerDensitySnapshot
  );
  const isDense = density === "dense";

  useEffect(() => {
    setShellDensity(density);
  }, [density]);

  function toggleDensity() {
    const nextDensity = isDense ? "comfortable" : "dense";
    localStorage.setItem(storageKey, nextDensity);
    applyDensity(nextDensity);
  }

  return (
    <button
      aria-label={`${isDense ? "Disable" : "Enable"} dense mode`}
      aria-pressed={isDense}
      className="ops-density-toggle"
      type="button"
      onClick={toggleDensity}
    >
      <Rows3 className="size-4" />
      <span>Dense</span>
    </button>
  );
}

function applyDensity(density: DensityPreference) {
  setShellDensity(density);
  window.dispatchEvent(new Event("leadops-density-change"));
}

function getDensitySnapshot(): DensityPreference {
  const storedDensity = localStorage.getItem(storageKey);

  if (storedDensity === "dense" || storedDensity === "comfortable") {
    return storedDensity;
  }

  return "comfortable";
}

function getServerDensitySnapshot(): DensityPreference {
  return "comfortable";
}

function subscribeToDensity(callback: () => void) {
  window.addEventListener("leadops-density-change", callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener("leadops-density-change", callback);
    window.removeEventListener("storage", callback);
  };
}

function setShellDensity(density: DensityPreference) {
  const shell = document.getElementById("ops-app-shell");

  if (shell?.dataset.density !== density) {
    shell?.setAttribute("data-density", density);
  }
}
