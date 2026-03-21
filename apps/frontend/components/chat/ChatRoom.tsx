"use client";

import Link from "next/link";

import { useChat } from "@/hooks/use-chat";
import { useAuthStore } from "@/store/auth-store";
import { useChatStore } from "@/store/chat-store";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { ChatSkeleton } from "@/components/chat/ChatSkeleton";

export function ChatRoom() {
  const token = useAuthStore((state) => state.token);
  const hydrated = useAuthStore((state) => state.hydrated);
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
      <ChatHeader />
      {loading ? <ChatSkeleton /> : <ChatMessageList />}
      <ChatComposer onSend={sendMessage} disabled={loading} />
    </div>
  );
}
