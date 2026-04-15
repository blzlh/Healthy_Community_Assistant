"use client";

import { create } from "zustand";
import type { AuthUser } from "@/services/auth";

type ProfileState = {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  // 管理员相关状态
  users: AuthUser[];
  usersLoading: boolean;
  setUsers: (users: AuthUser[]) => void;
  setUsersLoading: (loading: boolean) => void;
  updateUserInList: (userId: string, updates: Partial<AuthUser>) => void;
  clear: () => void;
};

export const useProfileStore = create<ProfileState>((set) => ({
  loading: false,
  setLoading: (loading) => set({ loading }),
  users: [],
  usersLoading: false,
  setUsers: (users) => set({ users }),
  setUsersLoading: (loading) => set({ usersLoading: loading }),
  updateUserInList: (userId, updates) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId ? { ...user, ...updates } : user
      ),
    })),
  clear: () => set({ loading: false, users: [], usersLoading: false }),
}));
