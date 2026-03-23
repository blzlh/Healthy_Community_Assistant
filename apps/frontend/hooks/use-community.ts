"use client";

import { useCallback, useState } from "react";
import type { JSONContent } from "@tiptap/react";

import { getAxiosErrorMessage } from "@/services/auth";
import {
  createCommunityPost,
  fetchCommunityPosts,
  addPostComment,
  updateCommunityPost,
  togglePostLike,
  deleteCommunityPost,
  type CommunityPost,
  type CommunityComment,
} from "@/services/community";
import { useAuthStore } from "@/store/auth-store";

type CommunityResult = {
  ok: boolean;
  status?: number;
  message?: string;
};

export function useCommunity() {
  const token = useAuthStore((state) => state.token);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const loadPosts = useCallback(
    async (scope: "all" | "mine"): Promise<CommunityResult & { posts?: CommunityPost[] }> => {
      if (!token) {
        return { ok: false, message: "未登录" };
      }
      setLoading(true);
      try {
        const { data, status } = await fetchCommunityPosts(token, scope);
        return { ok: true, status, posts: data.posts ?? [] };
      } catch (error) {
        const message = getAxiosErrorMessage(error);
        return { ok: false, message };
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const publishPost = useCallback(
    async (payload: {
      contentJson: JSONContent;
      contentText: string;
      images?: string[];
    }): Promise<CommunityResult & { post?: CommunityPost }> => {
      if (!token) {
        return { ok: false, message: "未登录" };
      }
      setPublishing(true);
      try {
        const { data, status } = await createCommunityPost(token, payload);
        return { ok: true, status, post: data.post };
      } catch (error) {
        const message = getAxiosErrorMessage(error);
        return { ok: false, message };
      } finally {
        setPublishing(false);
      }
    },
    [token]
  );

  const editPost = useCallback(
    async (
      postId: string,
      payload: {
        contentJson?: JSONContent;
        contentText?: string;
        images?: string[];
      }
    ): Promise<CommunityResult & { post?: CommunityPost }> => {
      if (!token) {
        return { ok: false, message: "未登录" };
      }
      setPublishing(true);
      try {
        const { data, status } = await updateCommunityPost(token, postId, payload);
        return { ok: true, status, post: data.post };
      } catch (error) {
        const message = getAxiosErrorMessage(error);
        return { ok: false, message };
      } finally {
        setPublishing(false);
      }
    },
    [token]
  );

  const toggleLike = useCallback(
    async (postId: string): Promise<CommunityResult & { isLiked?: boolean }> => {
      if (!token) {
        return { ok: false, message: "未登录" };
      }
      try {
        const { data, status } = await togglePostLike(token, postId);
        return { ok: true, status, isLiked: data.isLiked };
      } catch (error) {
        const message = getAxiosErrorMessage(error);
        return { ok: false, message };
      }
    },
    [token]
  );

  const addComment = useCallback(
    async (
      postId: string,
      content: string
    ): Promise<CommunityResult & { comment?: CommunityComment; commentsCount?: number }> => {
      if (!token) {
        return { ok: false, message: "未登录" };
      }
      try {
        const { data, status } = await addPostComment(token, postId, content);
        return { ok: true, status, comment: data.comment, commentsCount: data.commentsCount };
      } catch (error) {
        const message = getAxiosErrorMessage(error);
        return { ok: false, message };
      }
    },
    [token]
  );

  const deletePost = useCallback(
    async (postId: string): Promise<CommunityResult> => {
      if (!token) {
        return { ok: false, message: "未登录" };
      }
      try {
        const { data, status } = await deleteCommunityPost(token, postId);
        return { ok: true, status, ...data };
      } catch (error) {
        const message = getAxiosErrorMessage(error);
        return { ok: false, message };
      }
    },
    [token]
  );

  return {
    loading,
    publishing,
    loadPosts,
    publishPost,
    editPost,
    toggleLike,
    addComment,
    deletePost,
  };
}
