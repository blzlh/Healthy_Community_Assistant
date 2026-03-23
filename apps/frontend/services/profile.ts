import { http } from "@/lib/http";
import type { AuthUser } from "@/services/auth";

export type ProfileResponse = {
  user?: AuthUser;
  message?: string;
};

export type ProfilePayload = {
  name?: string;
  avatarUrl?: string | null;
};

export async function fetchProfile(token: string) {
  const response = await http.get<ProfileResponse>("/api/profile", {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
  return { data: response.data, status: response.status };
}

export async function updateProfile(token: string, payload: ProfilePayload) {
  const response = await http.put<ProfileResponse>("/api/profile", payload, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
  return { data: response.data, status: response.status };
}

export async function fetchAllUsers(token: string) {
  const response = await http.get<{ users: AuthUser[] }>(
    "/api/profile/admin/users",
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
  return { data: response.data, status: response.status };
}

export async function banUser(
  token: string,
  targetUserId: string,
  isBanned: boolean
) {
  const response = await http.put<{ success: boolean }>(
    "/api/profile/admin/ban",
    { targetUserId, isBanned },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
  return { data: response.data, status: response.status };
}
