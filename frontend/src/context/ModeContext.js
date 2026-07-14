import { createContext } from "react";

export const ModeContext = createContext(null);

export const STORAGE_KEY = "multidoc-mode";

export const modes = {
  light: { name: "light" },
  dark: { name: "dark" },
};
