"use client";

import { Icon } from "@iconify/react";

export function LikeButton({
  isLiked,
  likesCount,
  onClick,
}: {
  isLiked: boolean;
  likesCount: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2 text-xs transition-all active:scale-95 ${
        isLiked
          ? "text-red-500 bg-red-500/5"
          : "text-white/40 hover:bg-white/5 hover:text-red-400/80"
      }`}
    >
      <div className="relative flex h-4 w-4 items-center justify-center">
        <Icon
          icon={isLiked ? "material-symbols:favorite" : "material-symbols:favorite-outline"}
          className={`h-4 w-4 transition-all duration-300 ${isLiked ? "animate-heart-beat" : ""}`}
        />
      </div>
      <span className="font-medium">{likesCount || "点赞"}</span>
    </button>
  );
}

export function CommentButton({
  isOpen,
  commentsCount,
  onClick,
}: {
  isOpen: boolean;
  commentsCount: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2 text-xs transition-all hover:bg-white/5 hover:text-white/80 active:scale-95 ${
        isOpen ? "text-white/80 bg-white/5" : "text-white/40"
      }`}
    >
      <div className="relative flex h-4 w-4 items-center justify-center">
        <Icon icon="material-symbols:chat-bubble-outline" className="h-4 w-4" />
      </div>
      <span className="font-medium">{commentsCount || "评论"}</span>
    </button>
  );
}

