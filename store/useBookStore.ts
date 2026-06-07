import { create } from "zustand";
import { albumData } from "@/data/album";

interface BookState {
  currentPage: number; // State index: 0 (Closed Front) to M + 1 (Closed Back)
  totalPages: number; // Total physical pages: M + 1 (where M is number of spreads)
  isAnimating: boolean;
  nextPage: () => void;
  prevPage: () => void;
  setPage: (page: number) => void;
  setTotalPages: (totalPages: number) => void;
  setAnimating: (isAnimating: boolean) => void;
}

const M = albumData.length;

export const useBookStore = create<BookState>((set) => ({
  currentPage: 0,
  totalPages: M + 1, // 6 spreads + 1 = 7 pages
  isAnimating: false,
  
  nextPage: () =>
    set((state) => {
      if (state.isAnimating || state.currentPage >= state.totalPages) {
        return {};
      }
      return { currentPage: state.currentPage + 1 };
    }),

  prevPage: () =>
    set((state) => {
      if (state.isAnimating || state.currentPage <= 0) {
        return {};
      }
      return { currentPage: state.currentPage - 1 };
    }),

  setPage: (page) =>
    set((state) => {
      if (state.isAnimating || page < 0 || page > state.totalPages) {
        return {};
      }
      return { currentPage: page };
    }),

  setTotalPages: (totalPages) => set({ totalPages }),

  setAnimating: (isAnimating) => set({ isAnimating }),
}));
