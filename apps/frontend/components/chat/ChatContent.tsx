"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";

import { useChat } from "@/hooks/use-chat";
import { useAuthStore } from "@/store/auth-store";
import { useChatStore } from "@/store/chat-store";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { ChatSkeleton } from "@/components/chat/ChatSkeleton";

export function ChatContent() {
  const token = useAuthStore((state) => state.token);
  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);
  const loading = useChatStore((state) => state.loading);
  const roomId = useChatStore((state) => state.roomId);
  const connected = useChatStore((state) => state.connected);
  const { sendMessage } = useChat();

  // 连接状态组件
  const ConnectionStatus = (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-400" : "bg-white/30"
          }`}
      />
      <span className="text-white/60">{connected ? "已连接" : "未连接"}</span>
    </div>
  );

  if (!hydrated) {
    return (
      <div className="h-full bg-[#0A0A0A] border border-[#292929] rounded-md p-4 text-white">
        正在加载登录状态...
      </div>
    );
  }

  if (!token) {
    return (
      <div className="h-full bg-[#0A0A0A] border border-[#292929] rounded-md p-4 text-white">
        <div className="text-base font-semibold">请先登录</div>
        <Link href="/auth/login" className="mt-2 inline-block text-sm text-white/70 underline">
          前往登录
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#0A0A0A] border border-[#292929] rounded-md overflow-hidden flex flex-col">
      {/* 连接状态 */}
      <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
        <span className="text-sm text-white/60">房间：{roomId}</span>
        {ConnectionStatus}
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-hidden">
        {loading ? <ChatSkeleton /> : <ChatMessageList />}
      </div>

      {/* 输入框 */}
      <div className="border-t border-white/10">
        {user?.isBanned ? (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-200">
            <Icon icon="solar:danger-circle-bold" className="h-4 w-4 shrink-0" />
            <span>您的账号已被封禁，无法发送消息。如有疑问请联系管理员。</span>
          </div>
        ) : (
          <ChatComposer onSend={sendMessage} disabled={loading} />
        )}
      </div>
    </div>
  );
}
