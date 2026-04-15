"use client";

import { useCallback } from "react";
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
import { useCommunityStore } from "@/store/community-store";

type CommunityResult = {
  ok: boolean;
  status?: number;
  message?: string;
};

export function useCommunity() {
  const token = useAuthStore((state) => state.token);

  // Store 状态和操作
  const posts = useCommunityStore((state) => state.posts);
  const loading = useCommunityStore((state) => state.loading);
  const publishing = useCommunityStore((state) => state.publishing);
  const setPosts = useCommunityStore((state) => state.setPosts);
  const addPost = useCommunityStore((state) => state.addPost);
  const updatePost = useCommunityStore((state) => state.updatePost);
  const removePost = useCommunityStore((state) => state.removePost);
  const setLoading = useCommunityStore((state) => state.setLoading);
  const setPublishing = useCommunityStore((state) => state.setPublishing);
  const updatePostLike = useCommunityStore((state) => state.updatePostLike);
  const addCommentToStore = useCommunityStore((state) => state.addComment);

  const loadPosts = useCallback(
    async (scope: "all" | "mine"): Promise<CommunityResult> => {
      if (!token) {
        return { ok: false, message: "未登录" };
      }
      setLoading(true);
      try {
        const { data, status } = await fetchCommunityPosts(token, scope);
        setPosts(data.posts ?? []);
        return { ok: true, status };
      } catch (error) {
        const message = getAxiosErrorMessage(error);
        return { ok: false, message };
      } finally {
        setLoading(false);
      }
    },
    [token, setLoading, setPosts]
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
        if (data.post) {
          addPost(data.post);
        }
        return { ok: true, status, post: data.post };
      } catch (error) {
        const message = getAxiosErrorMessage(error);
        return { ok: false, message };
      } finally {
        setPublishing(false);
      }
    },
    [token, setPublishing, addPost]
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
        if (data.post) {
          updatePost(postId, data.post);
        }
        return { ok: true, status, post: data.post };
      } catch (error) {
        const message = getAxiosErrorMessage(error);
        return { ok: false, message };
      } finally {
        setPublishing(false);
      }
    },
    [token, setPublishing, updatePost]
  );

  const toggleLike = useCallback(
    async (postId: string): Promise<CommunityResult & { isLiked?: boolean }> => {
      if (!token) {
        return { ok: false, message: "未登录" };
      }

      // 乐观更新：先立即更新 UI
      const post = posts.find(p => p.id === postId);
      if (post) {
        const newIsLiked = !post.isLiked;
        const newLikesCount = newIsLiked ? post.likesCount + 1 : Math.max(0, post.likesCount - 1);
        updatePostLike(postId, newIsLiked, newLikesCount);
      }

      try {
        const { data, status } = await togglePostLike(token, postId);
        // 请求成功后，使用服务器返回的真实状态更新
        const currentPost = posts.find(p => p.id === postId);
        if (currentPost) {
          // 根据服务器返回的 isLiked 计算正确的 likesCount
          // 注意：由于乐观更新已经改变，需要基于原始状态计算
          const originalIsLiked = post?.isLiked ?? false;
          const originalLikesCount = post?.likesCount ?? 0;
          const realLikesCount = data.isLiked
            ? (originalIsLiked ? originalLikesCount : originalLikesCount + 1)
            : (originalIsLiked ? originalLikesCount - 1 : originalLikesCount);
          updatePostLike(postId, data.isLiked, Math.max(0, realLikesCount));
        }
        return { ok: true, status, isLiked: data.isLiked };
      } catch (error) {
        // 请求失败，回滚到原始状态
        if (post) {
          updatePostLike(postId, post.isLiked, post.likesCount);
        }
        const message = getAxiosErrorMessage(error);
        return { ok: false, message };
      }
    },
    [token, posts, updatePostLike]
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
        if (data.comment) {
          addCommentToStore(postId, data.comment, data.commentsCount);
        }
        return { ok: true, status, comment: data.comment, commentsCount: data.commentsCount };
      } catch (error) {
        const message = getAxiosErrorMessage(error);
        return { ok: false, message };
      }
    },
    [token, addCommentToStore]
  );

  const deletePost = useCallback(
    async (postId: string): Promise<CommunityResult> => {
      if (!token) {
        return { ok: false, message: "未登录" };
      }
      try {
        const { data, status } = await deleteCommunityPost(token, postId);
        removePost(postId);
        return { ok: true, status, ...data };
      } catch (error) {
        const message = getAxiosErrorMessage(error);
        return { ok: false, message };
      }
    },
    [token, removePost]
  );

  return {
    posts,
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
