"use client";

import { useCallback, useState } from "react";

import {
  getAxiosErrorMessage,
  sendLoginOtp,
  sendOtp,
  verifyOtp,
  type AuthResponse,
} from "@/services/auth";
import { fetchProfile } from "@/services/profile";
import { useAuthStore } from "@/store/auth-store";

type AuthResult = {
  ok: boolean;
  status?: number;
  data?: AuthResponse;
  message?: string;
};

export function useAuth() {
  const setSession = useAuthStore((state) => state.setSession);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState("");

  const normalizeEmail = (email: string) => email.trim().toLowerCase();
  const normalizeCode = (code: string) => code.replace(/\s+/g, "");

  const sendEmailOtp = useCallback(
    async (email: string, isAdmin: boolean = false): Promise<AuthResult> => {
      const normalizedEmail = normalizeEmail(email);
      setLoading(true);
      setMessage("");
      try {
        const { data, status } = await sendOtp(normalizedEmail, isAdmin);
        setMessage(`${status} ${JSON.stringify(data)}`);
        return { ok: true, status, data };
      } catch (error) {
        const errorMessage = getAxiosErrorMessage(error);
        setMessage(errorMessage);
        return { ok: false, message: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const sendLoginEmailOtp = useCallback(
    async (email: string): Promise<AuthResult> => {
      const normalizedEmail = normalizeEmail(email);
      setLoading(true);
      setMessage("");
      try {
        const { data, status } = await sendLoginOtp(normalizedEmail);
        setMessage(`${status} ${JSON.stringify(data)}`);
        return { ok: true, status, data };
      } catch (error) {
        const errorMessage = getAxiosErrorMessage(error);
        setMessage(errorMessage);
        return { ok: false, message: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const resendEmailOtp = useCallback(
    async (email: string): Promise<AuthResult> => {
      const normalizedEmail = normalizeEmail(email);
      setResendLoading(true);
      setMessage("");
      try {
        const { data, status } = await sendLoginOtp(normalizedEmail);
        setMessage(`${status} ${JSON.stringify(data)}`);
        return { ok: true, status, data };
      } catch (error) {
        const errorMessage = getAxiosErrorMessage(error);
        setMessage(errorMessage);
        return { ok: false, message: errorMessage };
      } finally {
        setResendLoading(false);
      }
    },
    []
  );

  const confirmEmailOtp = useCallback(
    async (
      email: string,
      code: string
    ): Promise<AuthResult> => {
      const normalizedEmail = normalizeEmail(email);
      const normalizedCode = normalizeCode(code);
      setLoading(true);
      setMessage("");
      try {
        const { data, status } = await verifyOtp(
          normalizedEmail,
          normalizedCode
        );
        // 只有当 session 存在时才算登录成功
        if (data?.session?.access_token) {
          setSession(data.session, data.user);
          const token = data.session.access_token;
          fetchProfile(token)
            .then(({ data: profileData }) => {
              if (profileData?.user) {
                updateUser(profileData.user);
              }
            })
            .catch(() => undefined);
          setMessage(`${status} ${JSON.stringify(data)}`);
          return { ok: true, status, data };
        } else {
          // 没有 session，登录失败
          return { ok: false, message: "验证码错误或已过期" };
        }
      } catch (error) {
        const errorMessage = getAxiosErrorMessage(error);
        setMessage(errorMessage);
        return { ok: false, message: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [setSession, updateUser]
  );

  return {
    loading,
    resendLoading,
    message,
    sendEmailOtp,
    sendLoginEmailOtp,
    resendEmailOtp,
    confirmEmailOtp,
  };
}
