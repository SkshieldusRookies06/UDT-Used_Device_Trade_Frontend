import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useWishStore } from "./wishStore.js";

export const useAuthStore = create(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setAuth: (accessToken, user) => {
        useWishStore.getState().clear();
        set({ accessToken, user });
      },
      setUser: (user) => set({ user }),
      clear: () => {
        useWishStore.getState().clear();
        set({ accessToken: null, user: null });
      },
    }),
    { name: "udt-auth" }
  )
);
