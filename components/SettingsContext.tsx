"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark" | "system";
type FontSize = "sm" | "md" | "lg";
type Language = "fa" | "en" | "ar";

type Profile = {
  name: string;
  mobile: string;
  avatar?: string; // data URL
  bio?: string;
};

type SettingsState = {
  profile: Profile;
  theme: Theme;
  fontSize: FontSize;
  language: Language;
};

type SettingsContextType = SettingsState & {
  setProfile: (p: Partial<Profile>) => void;
  setTheme: (t: Theme) => void;
  setFontSize: (f: FontSize) => void;
  setLanguage: (l: Language) => void;
  reset: () => void;
};

const DEFAULT_STATE: SettingsState = {
  profile: { name: "", mobile: "" },
  theme: "light",
  fontSize: "md",
  language: "fa",
};

const STORAGE_KEY = "app_settings_v1";

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const readPersistedState = (): SettingsState => {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<SettingsState>;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      profile: { ...DEFAULT_STATE.profile, ...(parsed.profile || {}) },
    };
  } catch {
    return DEFAULT_STATE;
  }
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SettingsState>(() => readPersistedState());

  // Persist settings
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    } catch {}
  }, [state]);

  // Apply side effects: theme, font size, language, dir
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    // theme
    const resolvedTheme = state.theme === "system" ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light") : state.theme;
    root.dataset.theme = resolvedTheme;

    // font size
    root.dataset.font = state.fontSize;

    // language and direction
    root.lang = state.language;
    const dir = state.language === "en" ? "ltr" : "rtl";
    root.dir = dir;
  }, [state.theme, state.fontSize, state.language]);

  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const resolved = state.theme === "system" ? (media.matches ? "dark" : "light") : state.theme;
      document.documentElement.dataset.theme = resolved;
    };
    apply();
    if (state.theme !== "system") return;
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', apply);
      return () => media.removeEventListener('change', apply);
    } else {
      media.addListener(apply);
      return () => media.removeListener(apply);
    }
  }, [state.theme]);

  const api = useMemo<SettingsContextType>(() => ({
    ...state,
    setProfile: (p) => setState((s) => ({ ...s, profile: { ...s.profile, ...p } })),
    setTheme: (t) => setState((s) => ({ ...s, theme: t })),
    setFontSize: (f) => setState((s) => ({ ...s, fontSize: f })),
    setLanguage: (l) => setState((s) => ({ ...s, language: l })),
    reset: () => setState(DEFAULT_STATE),
  }), [state]);

  return <SettingsContext.Provider value={api}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};
