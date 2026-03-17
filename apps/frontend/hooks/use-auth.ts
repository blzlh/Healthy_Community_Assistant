"use client";

import { useCallback, useState } from "react";

import {
  getAxiosErrorMessage,
  sendLoginOtp,
  sendOtp,
  verifyOtp,
  type AuthResponse,
} from "@/services/auth";
import { useAuthStore } from "@/store/auth-store";

type AuthResult = {
  ok: boolean;
  status?: number;
  data?: AuthResponse;
  message?: string;
};

export function useAuth() {
  const setSession = useAuthStore((state) => state.setSession);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState("");

  const normalizeEmail = (email: string) => email.trim().toLowerCase();
  const normalizeCode = (code: string) => code.replace(/\s+/g, "");

  const sendEmailOtp = useCallback(async (email: string): Promise<AuthResult> => {
    const normalizedEmail = normalizeEmail(email);
    setLoading(true);
    setMessage("");
    try {
      const { data, status } = await sendOtp(normalizedEmail);
      setMessage(`${status} ${JSON.stringify(data)}`);
      return { ok: true, status, data };
    } catch (error) {
      const errorMessage = getAxiosErrorMessage(error);
      setMessage(errorMessage);
      return { ok: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const sendLoginEmailOtp = useCallback(async (email: string): Promise<AuthResult> => {
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
  }, []);

  const resendEmailOtp = useCallback(async (email: string): Promise<AuthResult> => {
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
  }, []);

  const confirmEmailOtp = useCallback(
    async (email: string, code: string): Promise<AuthResult> => {
      const normalizedEmail = normalizeEmail(email);
      const normalizedCode = normalizeCode(code);
      setLoading(true);
      setMessage("");
      try {
        const { data, status } = await verifyOtp(normalizedEmail, normalizedCode);
        if (data?.session || data?.user) {
          setSession(data.session, data.user);
        }
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
    [setSession]
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
