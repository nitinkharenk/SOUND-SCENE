"use client";

import { create } from "zustand";

interface SearchStore {
  isOpen: boolean;
  query: string;
  activeFilters: string[];
  open: () => void;
  close: () => void;
  setQuery: (query: string) => void;
  toggleFilter: (id: string) => void;
  reset: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  isOpen: false,
  query: "",
  activeFilters: [],
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false, query: "", activeFilters: [] }),
  setQuery: (query) => set({ query }),
  toggleFilter: (id) =>
    set((state) => ({
      activeFilters: state.activeFilters.includes(id)
        ? state.activeFilters.filter((filter) => filter !== id)
        : [...state.activeFilters, id],
    })),
  reset: () => set({ isOpen: false, query: "", activeFilters: [] }),
}));
