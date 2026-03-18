import type { AxiosError } from "axios";

import { http } from "@/lib/http";

export type AuthSession = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  token_type?: string;
};

export type AuthUser = {
  id?: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
};

export type AuthResponse = {
  user?: AuthUser;
  session?: AuthSession;
  message?: string;
};

export function getAxiosErrorMessage(error: unknown) {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError?.response?.data?.message ?? axiosError?.message ?? "Request failed";
}

export async function sendOtp(email: string) {
  const response = await http.post<AuthResponse>("/api/auth/register", { email });
  return { data: response.data, status: response.status };
}

export async function sendLoginOtp(email: string) {
  const response = await http.post<AuthResponse>("/api/auth/register", {
    email,
    flow: "login",
  });
  return { data: response.data, status: response.status };
}

export async function verifyOtp(email: string, code: string) {
  const response = await http.post<AuthResponse>("/api/auth/login", { email, code });
  return { data: response.data, status: response.status };
}
