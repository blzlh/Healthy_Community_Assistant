"use client";

import { useEffect, useRef } from "react";

import { useChatStore } from "@/store/chat-store";

export function ChatMessageList() {
  const messages = useChatStore((state) => state.messages);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  return (
    <div
      ref={containerRef}
      className="flex h-[520px] flex-col gap-3 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-4"
    >
      {messages.map((msg) => (
        <div key={msg.id} className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span className="font-medium text-white/70">
              {msg.user.email ?? msg.user.id}
            </span>
            <span>{new Date(msg.createdAt).toLocaleString()}</span>
          </div>
          <div className="w-fit max-w-[80%] rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white">
            {msg.text}
          </div>
        </div>
      ))}
    </div>
  );
}
