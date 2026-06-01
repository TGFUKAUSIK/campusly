import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "amoled" | "system";

type AppState = {
  theme: Theme;
  isCommandPaletteOpen: boolean;
  setTheme: (theme: Theme) => void;
  setCommandPaletteOpen: (open: boolean) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: "system",
      isCommandPaletteOpen: false,
      setTheme: (theme) => set({ theme }),
      setCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen })
    }),
    { name: "campusly-settings" }
  )
);
