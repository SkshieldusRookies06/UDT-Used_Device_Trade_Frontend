import { create } from "zustand";

export const useWishStore = create((set) => ({
  wishedIds: [],
  setWishedIds: (ids) => set({ wishedIds: ids }),
  add: (id) => set((s) => (s.wishedIds.includes(id) ? s : { wishedIds: [...s.wishedIds, id] })),
  remove: (id) => set((s) => ({ wishedIds: s.wishedIds.filter((v) => v !== id) })),
  clear: () => set({ wishedIds: [] }),
}));
