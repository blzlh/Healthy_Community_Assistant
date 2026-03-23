"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Avatar, Modal, message } from "antd";

import { useAuthStore } from "@/store/auth-store";
import { banUser } from "@/services/profile";

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

export function PostHeader({
  postId,
  authorId,
  authorName,
  authorAvatarUrl,
  createdAt,
  isOwnPost,
}: {
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  createdAt: string;
  isOwnPost: boolean;
}) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAdmin = user?.isAdmin === true;

  const handleBan = () => {
    Modal.confirm({
      title: `封禁用户 ${authorName}`,
      content: "封禁后该用户将无法发布动态和在聊天室发言（但仍可进入聊天室）。确定要封禁吗？",
      okText: "确定封禁",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        try {
          await banUser(token, authorId, true);
          message.success(`用户 ${authorName} 已被封禁`);
        } catch (error) {
          console.error("Ban user error:", error);
          message.error("封禁失败，请稍后重试");
        }
      },
    });
  };

  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar src={authorAvatarUrl} className="bg-zinc-700">
          {(authorName || "U").slice(0, 1).toUpperCase()}
        </Avatar>
        <div>
          <div className="text-sm font-medium text-white">{authorName}</div>
          <div className="text-xs text-white/50">{formatPublishTime(createdAt)}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isAdmin && !isOwnPost && (
          <button
            onClick={handleBan}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-500/60 transition-all hover:bg-red-500/20 hover:text-red-500 active:scale-90"
            title="封禁此用户"
          >
            <Icon icon="material-symbols:block" className="h-4 w-4" />
          </button>
        )}
        {isOwnPost && (
          <Link
            href={`/community/edit/${postId}`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 transition-all hover:bg-white/20 hover:text-white active:scale-90"
            title="编辑动态"
          >
            <Icon icon="material-symbols:edit-outline" className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}

