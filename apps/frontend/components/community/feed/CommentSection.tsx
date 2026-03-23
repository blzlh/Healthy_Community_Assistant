"use client";

import { Button, Input } from "antd";

import type { CommunityComment } from "@/services/community";
import { useAuthStore } from "@/store/auth-store";

export function CommentList({ comments }: { comments: CommunityComment[] }) {
  if (!comments.length) return null;
  return (
    <div className="mt-3">
      <div className="flex flex-col gap-1.5">
        {comments.map((comment) => (
          <div key={comment.id} className="text-xs leading-5 text-white/80">
            <span className="font-semibold text-white/90">{comment.authorName}</span>
            <span className="text-white/50">：</span>
            <span className="text-white/70">{comment.content}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CommentComposer({
  visible,
  value,
  submitting,
  onChange,
  onSubmit,
}: {
  visible: boolean;
  value: string;
  submitting: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const user = useAuthStore((state) => state.user);
  if (!visible) return null;

  if (user?.isBanned) {
    return (
      <div className="mt-3 text-xs text-red-200/60">
        账号已被封禁，无法评论。
      </div>
    );
  }

  return (
    <div className="mt-3 flex items-center gap-2">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPressEnter={onSubmit}
        placeholder="写评论..."
        className="!bg-black/60 !text-white !border-white/10 placeholder:!text-white/40"
      />
      <Button
        type="primary"
        loading={submitting}
        disabled={submitting}
        onClick={onSubmit}
        className="!bg-zinc-800 !text-white hover:!bg-zinc-700"
      >
        发送
      </Button>
    </div>
  );
}

