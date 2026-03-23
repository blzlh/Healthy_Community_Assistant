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
  const { loading, loadPosts } = useCommunity();
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
            {visiblePosts.map((post) => (
              <article key={post.id} className="rounded-xl border border-white/10 bg-black/30 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <Avatar src={post.author.avatarUrl} className="bg-zinc-700">
                    {(post.author.name || "U").slice(0, 1).toUpperCase()}
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium text-white">{post.author.name}</div>
                    <div className="text-xs text-white/50">{formatPublishTime(post.createdAt)}</div>
                  </div>
                </div>
                <CommunityPostContent content={post.contentJson} />
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
