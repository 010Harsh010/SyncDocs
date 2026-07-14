import { useEffect, useMemo, useState } from "react";
import { ModeContext, STORAGE_KEY, modes } from "./ModeContext.js";

function getInitialMode() {
  if (typeof window === "undefined") {
    return modes.light.name;
  }

  const savedMode = window.localStorage.getItem(STORAGE_KEY);

  if (savedMode === modes.light.name || savedMode === modes.dark.name) {
    return savedMode;
  }

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? modes.dark.name
    : modes.light.name;
}

export function ModeProvider({ children }) {
  const [mode, setMode] = useState(getInitialMode);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.documentElement.dataset.theme = mode;
    document.documentElement.style.colorScheme = mode;
    window.localStorage?.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      isDark: mode === modes.dark.name,
      toggleMode: () => {
        setMode((currentMode) =>
          currentMode === modes.dark.name ? modes.light.name : modes.dark.name,
        );
      },
    }),
    [mode],
  );

  return (
    <ModeContext.Provider value={value}>
      {children}
    </ModeContext.Provider>
  );
}
