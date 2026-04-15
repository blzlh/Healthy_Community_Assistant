"use client";

import { create } from "zustand";
import type { CommunityPost, CommunityComment } from "@/services/community";

type CommunityState = {
  posts: CommunityPost[];
  loading: boolean;
  publishing: boolean;
  setPosts: (posts: CommunityPost[]) => void;
  addPost: (post: CommunityPost) => void;
  updatePost: (postId: string, post: Partial<CommunityPost>) => void;
  removePost: (postId: string) => void;
  setLoading: (loading: boolean) => void;
  setPublishing: (publishing: boolean) => void;
  updatePostLike: (postId: string, isLiked: boolean, likesCount: number) => void;
  addComment: (postId: string, comment: CommunityComment, commentsCount: number) => void;
  clear: () => void;
};

export const useCommunityStore = create<CommunityState>((set) => ({
  posts: [],
  loading: false,
  publishing: false,
  setPosts: (posts) => set({ posts }),
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  updatePost: (postId, updatedPost) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId ? { ...post, ...updatedPost } : post
      ),
    })),
  removePost: (postId) =>
    set((state) => ({
      posts: state.posts.filter((post) => post.id !== postId),
    })),
  setLoading: (loading) => set({ loading }),
  setPublishing: (publishing) => set({ publishing }),
  updatePostLike: (postId, isLiked, likesCount) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId ? { ...post, isLiked, likesCount } : post
      ),
    })),
  addComment: (postId, comment, commentsCount) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? { ...post, comments: [...post.comments, comment], commentsCount }
          : post
      ),
    })),
  clear: () => set({ posts: [], loading: false, publishing: false }),
}));
