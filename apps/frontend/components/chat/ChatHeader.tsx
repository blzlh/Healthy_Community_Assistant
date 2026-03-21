"use client";

import { Icon } from "@iconify/react";

import { useChatStore } from "@/store/chat-store";

export function ChatHeader() {
  const roomId = useChatStore((state) => state.roomId);
  const connected = useChatStore((state) => state.connected);

  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
          <Icon icon="token:chat" className="h-7 w-7 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold">社区聊天</span>
          <span className="text-xs text-white/50">房间：{roomId}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span
          className={`h-2 w-2 rounded-full ${
            connected ? "bg-emerald-400" : "bg-white/30"
          }`}
        />
        <span className="text-white/60">{connected ? "已连接" : "未连接"}</span>
      </div>
    </div>
  );
}
