"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Avatar } from "antd";

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
  authorName,
  authorAvatarUrl,
  createdAt,
  isOwnPost,
}: {
  postId: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  createdAt: string;
  isOwnPost: boolean;
}) {
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
  );
}

