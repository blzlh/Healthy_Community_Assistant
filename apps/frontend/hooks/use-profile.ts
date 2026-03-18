"use client";

import { useCallback, useState } from "react";

import { getAxiosErrorMessage } from "@/services/auth";
import { fetchProfile, updateProfile, type ProfilePayload } from "@/services/profile";
import { useAuthStore } from "@/store/auth-store";

type ProfileResult = {
  ok: boolean;
  status?: number;
  message?: string;
};

export function useProfile() {
  const token = useAuthStore((state) => state.token);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [loading, setLoading] = useState(false);

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
  }, [token, updateUser]);

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
    [token, updateUser]
  );

  return {
    loading,
    loadProfile,
    saveProfile,
  };
}
