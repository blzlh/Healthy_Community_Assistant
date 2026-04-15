"use client";

import { useCallback } from "react";

import { getAxiosErrorMessage } from "@/services/auth";
import { fetchProfile, updateProfile, fetchAllUsers, banUser, type ProfilePayload } from "@/services/profile";
import { useAuthStore } from "@/store/auth-store";
import { useProfileStore } from "@/store/profile-store";

type ProfileResult = {
  ok: boolean;
  status?: number;
  message?: string;
};

export function useProfile() {
  const token = useAuthStore((state) => state.token);
  const updateUser = useAuthStore((state) => state.updateUser);

  // Store 状态和操作
  const loading = useProfileStore((state) => state.loading);
  const users = useProfileStore((state) => state.users);
  const usersLoading = useProfileStore((state) => state.usersLoading);
  const setLoading = useProfileStore((state) => state.setLoading);
  const setUsers = useProfileStore((state) => state.setUsers);
  const setUsersLoading = useProfileStore((state) => state.setUsersLoading);
  const updateUserInList = useProfileStore((state) => state.updateUserInList);

  const loadProfile = useCallback(async (): Promise<ProfileResult> => {
    if (!token) {
      return { ok: false, message: "未登录" };
    }
    setLoading(true);
    try {
      const { data, status } = await fetchProfile(token);
      if (data?.user) {
        updateUser(data.user);
      }
      return { ok: true, status };
    } catch (error) {
      const message = getAxiosErrorMessage(error);
      return { ok: false, message };
    } finally {
      setLoading(false);
    }
  }, [token, updateUser, setLoading]);

  const saveProfile = useCallback(
    async (payload: ProfilePayload): Promise<ProfileResult> => {
      if (!token) {
        return { ok: false, message: "未登录" };
      }
      setLoading(true);
      try {
        const { data, status } = await updateProfile(token, payload);
        if (data?.user) {
          updateUser(data.user);
        }
        return { ok: true, status };
      } catch (error) {
        const message = getAxiosErrorMessage(error);
        return { ok: false, message };
      } finally {
        setLoading(false);
      }
    },
    [token, updateUser, setLoading]
  );

  // 管理员功能：加载所有用户
  const loadUsers = useCallback(async (): Promise<ProfileResult> => {
    if (!token) {
      return { ok: false, message: "未登录" };
    }
    setUsersLoading(true);
    try {
      const { data, status } = await fetchAllUsers(token);
      setUsers(data.users ?? []);
      return { ok: true, status };
    } catch (error) {
      const message = getAxiosErrorMessage(error);
      return { ok: false, message };
    } finally {
      setUsersLoading(false);
    }
  }, [token, setUsers, setUsersLoading]);

  // 管理员功能：封禁/解封用户
  const toggleBanUser = useCallback(
    async (targetUserId: string, isBanned: boolean): Promise<ProfileResult> => {
      if (!token) {
        return { ok: false, message: "未登录" };
      }
      try {
        const { data, status } = await banUser(token, targetUserId, isBanned);
        if (data.success) {
          updateUserInList(targetUserId, { isBanned });
        }
        return { ok: true, status };
      } catch (error) {
        const message = getAxiosErrorMessage(error);
        return { ok: false, message };
      }
    },
    [token, updateUserInList]
  );

  return {
    loading,
    users,
    usersLoading,
    loadProfile,
    saveProfile,
    loadUsers,
    toggleBanUser,
  };
}
