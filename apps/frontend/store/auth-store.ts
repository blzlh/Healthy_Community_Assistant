"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AuthSession, AuthUser } from "@/services/auth";

type AuthState = {
  token: string;
  user: AuthUser | null;
  setSession: (session?: AuthSession, user?: AuthUser) => void;
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
      clear: () => set({ token: "", user: null }),
    }),
    {
      name: "hca_auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
