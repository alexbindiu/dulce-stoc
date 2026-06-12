import { create } from 'zustand';

interface CityState {
  city: string | null;
  setCity: (city: string | null) => void;
}

// Orașul selectat de client; persistat ca să supraviețuiască navigării/refresh-ului.
export const useCityStore = create<CityState>((set) => ({
  city: localStorage.getItem('selectedCity') || null,
  setCity: (city) => {
    if (city) localStorage.setItem('selectedCity', city);
    else localStorage.removeItem('selectedCity');
    set({ city });
  },
}));
