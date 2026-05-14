import { create } from "zustand";
import i18n from "../i18n/config";

const THEME_KEY = "urbanlens_theme";
const LANG_KEY = "urbanlens_lang";

type Theme = "light" | "dark";
type Lang = "en" | "kn" | "hi";

interface UiState {
  theme: Theme;
  language: Lang;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setLanguage: (l: Lang) => void;
  hydrate: () => void;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export const useUiStore = create<UiState>((set, get) => ({
  theme: "light",
  language: "en",
  setTheme: (theme) => {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
    set({ theme });
  },
  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    get().setTheme(next);
  },
  setLanguage: (language) => {
    localStorage.setItem(LANG_KEY, language);
    void i18n.changeLanguage(language);
    set({ language });
  },
  hydrate: () => {
    const storedTheme = (localStorage.getItem(THEME_KEY) as Theme | null) || "light";
    const storedLang = (localStorage.getItem(LANG_KEY) as Lang | null) || "en";
    applyTheme(storedTheme);
    void i18n.changeLanguage(storedLang);
    set({ theme: storedTheme, language: storedLang });
  },
}));
