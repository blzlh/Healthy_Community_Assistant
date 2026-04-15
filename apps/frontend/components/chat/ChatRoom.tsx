"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";

import { useChat } from "@/hooks/use-chat";
import { useAuthStore } from "@/store/auth-store";
import { useChatStore } from "@/store/chat-store";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { ChatSkeleton } from "@/components/chat/ChatSkeleton";
import { BackToHome } from "@/components/BackToHome";

export function ChatRoom() {
  const token = useAuthStore((state) => state.token);
  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);
  const loading = useChatStore((state) => state.loading);
  const { sendMessage } = useChat();

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
        <div className="text-base font-semibold">正在加载登录状态...</div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
        <div className="text-base font-semibold">请先登录</div>
        <Link href="/auth/login" className="w-fit text-sm text-white/70 underline">
          前往登录
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <ChatHeader />
      </div>
      {loading ? <ChatSkeleton /> : <ChatMessageList />}
      {user?.isBanned ? (
        <div className="flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-200">
          <Icon icon="lucide:alert-circle" className="h-4 w-4 shrink-0" />
          <span>您的账号已被封禁，无法发送消息。如有疑问请联系管理员。</span>
        </div>
      ) : (
        <ChatComposer onSend={sendMessage} disabled={loading} />
      )}
    </div>
  );
}
