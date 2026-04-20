"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Toast } from "@/components/ui/Toast/Toast";
import { FeedHeader, type FeedScope } from "@/components/community/feed/FeedHeader";
import { PostCard } from "@/components/community/feed/PostCard";
import { useCommunity } from "@/hooks/use-community";
import { useAuthStore } from "@/store/auth-store";
import { CommunityFeedSkeleton } from "@/components/community/feed/CommunityFeedSkeleton";

export function CommunityContent() {
  const token = useAuthStore((state) => state.token);
  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);

  // 使用 hook 返回的 posts（来自 store）
  const { posts, loading, loadPosts, toggleLike, addComment } = useCommunity();

  const [scope, setScope] = useState<FeedScope>("all");
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentTextByPost, setCommentTextByPost] = useState<Record<string, string>>({});
  const [commentSubmitting, setCommentSubmitting] = useState<Record<string, boolean>>({});
  const tempCommentSeqRef = useRef(0);

  const load = useCallback(async () => {
    const result = await loadPosts("all");
    if (!result.ok) {
      Toast.error({
        title: "加载失败",
        message: result.message ?? "请稍后重试",
      });
    }
  }, [loadPosts]);

  // 处理点赞/取消点赞的交互（使用乐观更新方案）
  const handleToggleLike = async (postId: string) => {
    // 直接调用 toggleLike，它会更新 store
    const result = await toggleLike(postId);
    if (!result.ok) {
      Toast.error({
        title: "点赞失败",
        message: result.message ?? "网络请求失败，请稍后重试",
      });
    }
  };

  const handleToggleComments = (postId: string) => {
    setOpenComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleSubmitComment = async (postId: string) => {
    const content = (commentTextByPost[postId] ?? "").trim();
    if (!content) return;

    tempCommentSeqRef.current += 1;
    const tempId = `temp-${tempCommentSeqRef.current}`;
    const authorName = (user?.name ?? user?.email ?? "我").trim();
    const authorAvatarUrl = user?.avatarUrl ?? null;
    const userId = user?.id ?? "";

    setOpenComments((prev) => ({ ...prev, [postId]: true }));
    setCommentTextByPost((prev) => ({ ...prev, [postId]: "" }));
    setCommentSubmitting((prev) => ({ ...prev, [postId]: true }));

    const result = await addComment(postId, content);
    if (!result.ok || !result.comment) {
      Toast.error({
        title: "评论失败",
        message: result.message ?? "网络请求失败，请稍后重试",
      });
    }

    setCommentSubmitting((prev) => ({ ...prev, [postId]: false }));
  };

  // 根据当前视图模式（全部/我的）过滤显示的动态
  const visiblePosts = useMemo(() => {
    if (scope === "all") {
      return posts;
    }
    const currentUserId = user?.id ?? "";
    if (!currentUserId) {
      return [];
    }
    return posts.filter((post) => post.author.id === currentUserId);
  }, [scope, posts, user?.id]);

  useEffect(() => {
    if (!hydrated || !token) return;
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [hydrated, token, load]);

  if (!hydrated) {
    return (
      <div className="p-4 text-white">
        正在加载登录状态...
      </div>
    );
  }

  if (!token) {
    return (
      <div className="p-4 text-white">
        <div className="text-base font-semibold">请先登录后查看社区动态</div>
        <Link href="/auth/login" className="mt-2 inline-block text-sm text-white/70 underline">
          前往登录
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4">
      <FeedHeader scope={scope} onScopeChange={setScope} />

      {loading ? (
        <CommunityFeedSkeleton />
      ) : visiblePosts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/20 py-10 text-center text-sm text-white/60">
          暂无动态，发布第一条内容吧
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-4">
          {visiblePosts.map((post) => {
            const isOwnPost = user?.id === post.author.id;
            const isCommentsOpen = Boolean(openComments[post.id]);
            const commentText = commentTextByPost[post.id] ?? "";
            const submitting = Boolean(commentSubmitting[post.id]);
            return (
              <div key={post.id}>
                <PostCard
                  post={post}
                  isOwnPost={isOwnPost}
                  isCommentsOpen={isCommentsOpen}
                  commentText={commentText}
                  commentSubmitting={submitting}
                  onToggleLike={() => handleToggleLike(post.id)}
                  onToggleComments={() => handleToggleComments(post.id)}
                  onChangeCommentText={(value) =>
                    setCommentTextByPost((prev) => ({ ...prev, [post.id]: value }))
                  }
                  onSubmitComment={() => handleSubmitComment(post.id)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
