"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AuthSession, AuthUser } from "@/services/auth";

type AuthState = {
  token: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUser | null;
  hydrated: boolean;
  setSession: (session?: AuthSession, user?: AuthUser) => void;
  updateUser: (user: Partial<AuthUser>) => void;
  setHydrated: (value: boolean) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: "",
      refreshToken: "",
      expiresAt: 0,
      user: null,
      hydrated: false,
      setSession: (session, user) =>
        set((state) => ({
          token: session?.access_token ?? state.token,
          refreshToken: session?.refresh_token ?? state.refreshToken,
          expiresAt: session?.expires_at ?? state.expiresAt,
          user: user
            ? state.user
              ? { ...state.user, ...user }
              : user
            : state.user,
        })),
      updateUser: (user) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...user } : { ...user },
        })),
      setHydrated: (value) => set({ hydrated: value }),
      clear: () => {
        set({
          token: "",
          refreshToken: "",
          expiresAt: 0,
          user: null,
          hydrated: true,
        });
        if (typeof window !== "undefined") {
          localStorage.removeItem("hca_auth");
        }
      },
    }),
    {
      name: "hca_auth",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
