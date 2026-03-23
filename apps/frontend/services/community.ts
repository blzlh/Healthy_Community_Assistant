import { http } from "@/lib/http";
import type { JSONContent } from "@tiptap/react";

export type CommunityAuthor = {
  id: string;
  name: string;
  avatarUrl?: string | null;
};

export type CommunityPost = {
  id: string;
  contentJson: JSONContent;
  contentText: string;
  createdAt: string;
  updatedAt: string;
  author: CommunityAuthor;
};

type CommunityListResponse = {
  posts?: CommunityPost[];
  message?: string;
};

type CommunityCreateResponse = {
  post?: CommunityPost;
  message?: string;
};

export async function fetchCommunityPosts(token: string, scope: "all" | "mine") {
  const response = await http.get<CommunityListResponse>("/api/community/posts", {
    params: scope === "mine" ? { scope: "mine" } : {},
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
  return { data: response.data, status: response.status };
}

export async function createCommunityPost(
  token: string,
  payload: { contentJson: JSONContent; contentText: string }
) {
  const response = await http.post<CommunityCreateResponse>("/api/community/posts", payload, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
  return { data: response.data, status: response.status };
}
