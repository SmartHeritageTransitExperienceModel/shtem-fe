import { create } from "zustand";

type State = {
  currentLocation: { lat: number; lng: number } | null;
  setLocation: (loc: { lat: number; lng: number }) => void;
  language: string;
  setLanguage: (lang: string) => void;
};

export const useLocationStore = create<State>((set) => ({
  currentLocation: null,
  setLocation: (loc) => set({ currentLocation: loc }),
  language: "vi",
  setLanguage: (lang) => set({ language: lang }),
}));
