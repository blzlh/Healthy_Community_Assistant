"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AuthSession, AuthUser } from "@/services/auth";

type AuthState = {
  token: string;
  user: AuthUser | null;
  setSession: (session?: AuthSession, user?: AuthUser) => void;
  updateUser: (user: Partial<AuthUser>) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: "",
      user: null,
      setSession: (session, user) =>
        set({
          token: session?.access_token ?? "",
          user: user ?? null,
        }),
      updateUser: (user) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...user } : { ...user },
        })),
      clear: () => {
        set({ token: "", user: null });
        if (typeof window !== "undefined") {
          localStorage.removeItem("hca_auth");
        }
      },
    }),
    {
      name: "hca_auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
