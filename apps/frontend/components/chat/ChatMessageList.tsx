"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar } from "antd";

import { useChatStore } from "@/store/chat-store";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";
import { ChatScrollbar } from "@/components/chat/ChatScrollbar";

export function ChatMessageList() {
  const messages = useChatStore((state) => state.messages);
  const currentUser = useAuthStore((state) => state.user);
  const containerRef = useRef<HTMLDivElement | null>(null);
  // 用于实现“滚动时显示滚动条，停止滚动 N 秒后隐藏”的定时器
  const scrollTimerRef = useRef<number | undefined>(undefined);
  const [scrollbarVisible, setScrollbarVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        window.clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    setScrollbarVisible(true);

    // 每次滚动都刷新隐藏计时
    if (scrollTimerRef.current) {
      window.clearTimeout(scrollTimerRef.current);
    }

    scrollTimerRef.current = window.setTimeout(() => {
      setScrollbarVisible(false);
    }, 1000); // 停止滚动 1 秒后隐藏
  }, []);

  return (
    <div className="relative h-[520px] overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="chat-scroll flex h-full flex-col gap-4 overflow-y-auto p-4"
      >
        {messages.map((msg) => {
          const isMe = msg.user.id === currentUser?.id;
          const displayName = msg.user.name ?? msg.user.email ?? msg.user.id;
          const avatarUrl = isMe ? currentUser?.avatarUrl ?? msg.user.avatarUrl : msg.user.avatarUrl;
          const avatarFallbackSource = isMe
            ? currentUser?.name ?? currentUser?.email ?? "我"
            : msg.user.name ?? msg.user.email ?? "U";
          const avatarFallback = avatarFallbackSource.slice(0, 1).toUpperCase();

          return (
            <div
              key={msg.id}
              className={cn("flex items-start gap-3", isMe ? "flex-row-reverse" : "flex-row")}
            >
              <Avatar className="shrink-0 bg-zinc-700" size={32} src={avatarUrl}>
                {avatarFallback}
              </Avatar>
              <div
                className={cn(
                  "flex min-w-0 flex-1 flex-col gap-1",
                  isMe ? "items-end" : "items-start"
                )}
              >
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <span className="text-sm font-medium text-white/70">{displayName}</span>
                  <span className="text-[10px]">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div
                  className={cn(
                    "w-fit max-w-[70%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2 text-sm text-white",
                    "border border-white/20 bg-white/10",
                    isMe ? "rounded-tr-none" : "rounded-tl-none"
                  )}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ChatScrollbar
        containerRef={containerRef}
        visible={scrollbarVisible}
        right={6}
        top={12}
        bottom={12}
        width={5}
        minThumbHeight={28}
      />
    </div>
  );
}
