"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Avatar, Segmented, Spin } from "antd";

import { CommunityPostContent } from "@/components/community/CommunityPostContent";
import { Toast } from "@/components/ui/Toast/Toast";
import { useCommunity } from "@/hooks/use-community";
import type { CommunityPost } from "@/services/community";
import { useAuthStore } from "@/store/auth-store";

function formatPublishTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function CommunityFeed() {
  const token = useAuthStore((state) => state.token);
  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);
  const { loading, loadPosts, toggleLike } = useCommunity();
  const [scope, setScope] = useState<"all" | "mine">("all");
  const [posts, setPosts] = useState<CommunityPost[]>([]);

  const load = useCallback(async () => {
    const result = await loadPosts("all");
    if (!result.ok) {
      Toast.error({
        title: "加载失败",
        message: result.message ?? "请稍后重试",
      });
      return;
    }
    setPosts(result.posts ?? []);
  }, [loadPosts]);

  // 处理点赞/取消点赞的交互（使用乐观更新方案）
  const handleToggleLike = async (postId: string) => {
    // 1. 记录当前状态，以便请求失败时回滚
    const previousPosts = [...posts];

    // 2. 立即更新 UI（乐观更新）
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const newIsLiked = !post.isLiked;
          return {
            ...post,
            isLiked: newIsLiked,
            likesCount: newIsLiked ? post.likesCount + 1 : Math.max(0, post.likesCount - 1),
          };
        }
        return post;
      })
    );

    // 3. 发送实际请求到后端
    const result = await toggleLike(postId);

    // 4. 如果请求失败，回滚到之前的状态并提示用户
    if (!result.ok) {
      setPosts(previousPosts);
      Toast.error({
        title: "点赞失败",
        message: result.message ?? "网络请求失败，请稍后重试",
      });
    }
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
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
        正在加载登录状态...
      </div>
    );
  }

  if (!token) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
        <div className="text-base font-semibold">请先登录后查看社区动态</div>
        <Link href="/auth/login" className="mt-2 inline-block text-sm text-white/70 underline">
          前往登录
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-lg font-semibold text-white">社区动态</div>
          <Link
            href="/community/new"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700"
          >
            <Icon icon="material-symbols:add" className="h-4 w-4" />
            写动态
          </Link>
        </div>
        <div className="mb-4 flex justify-end">
          <Segmented
            options={[
              { label: "全部动态", value: "all" },
              { label: "我的动态", value: "mine" },
            ]}
            value={scope}
            onChange={(value) => setScope(value as "all" | "mine")}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Spin />
          </div>
        ) : visiblePosts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/20 py-10 text-center text-sm text-white/60">
            暂无动态，发布第一条内容吧
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {visiblePosts.map((post) => {
              const isOwnPost = user?.id === post.author.id;
              return (
                <article
                  key={post.id}
                  className="group relative rounded-xl border border-white/10 bg-black/30 p-4 transition-colors hover:bg-white/5"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar src={post.author.avatarUrl} className="bg-zinc-700">
                        {(post.author.name || "U").slice(0, 1).toUpperCase()}
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium text-white">{post.author.name}</div>
                        <div className="text-xs text-white/50">
                          {formatPublishTime(post.createdAt)}
                        </div>
                      </div>
                    </div>
                    {/* 仅对自己的动态显示编辑按钮 */}
                    {isOwnPost && (
                      <Link
                        href={`/community/edit/${post.id}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 transition-all hover:bg-white/20 hover:text-white active:scale-90"
                        title="编辑动态"
                      >
                        <Icon icon="material-symbols:edit-outline" className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                  {/* 帖子内容渲染（Tiplap JSON 格式） */}
                  <CommunityPostContent content={post.contentJson} images={post.images} />

                  {/* 底部交互区：点赞计数 */}
                  <div className="mt-4 flex items-center gap-4 border-t border-white/5 pt-3">
                    <button
                      type="button"
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2 text-xs transition-all active:scale-95 ${
                        post.isLiked
                          ? "text-red-500 bg-red-500/5"
                          : "text-white/40 hover:bg-white/5 hover:text-red-400/80"
                      }`}
                    >
                      <div className="relative flex h-4 w-4 items-center justify-center">
                        <Icon
                          icon={post.isLiked ? "material-symbols:favorite" : "material-symbols:favorite-outline"}
                          className={`h-4 w-4 transition-all duration-300 ${
                            post.isLiked ? "animate-heart-beat" : ""
                          }`}
                        />
                      </div>
                      <span className="font-medium">{post.likesCount || "点赞"}</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
