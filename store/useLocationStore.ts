import { create } from "zustand";

type LocationType = {
  lat: number;
  lng: number;
  [key: string]: any;
};

type State = {
  currentLocation: LocationType | null;
  setLocation: (loc: LocationType) => void;
  language: string;
  setLanguage: (lang: string) => void;
  selectedLocation: LocationType | null;
  setSelectedLocation: (location: LocationType) => void;
};

export const useLocationStore = create<State>((set) => ({
  currentLocation: null,
  setLocation: (loc) => set({ currentLocation: loc }),
  language: "vi",
  setLanguage: (lang) => set({ language: lang }),
  selectedLocation: null,
  setSelectedLocation: (location) =>
    set({
      selectedLocation: {
        ...location,
        lat: Number(location.lat),
        lng: Number(location.lon),
      },
    }),
}));
