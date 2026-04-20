/**
 * 聊天消息加载骨架屏组件
 * 用于加载历史对话时显示占位内容
 */

"use client";

import { Skeleton } from "antd";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

interface ChatLoadingSkeletonProps {
  /** 显示的消息骨架数量，默认 3 条 */
  count?: number;
  /** 自定义类名 */
  className?: string;
}

/**
 * 单条消息骨架
 */
function MessageSkeleton({ isUser }: { isUser: boolean }) {
  return (
    <div
      className={cn(
        "flex gap-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* 头像 */}
      {isUser ? (
        <div className="shrink-0 w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
          <Skeleton.Avatar active size={32} shape="circle" />
        </div>
      ) : (
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-sky-500/20 to-sky-500/5 border border-sky-500/20">
          <Icon icon="solar:stethoscope-bold" className="w-4 h-4 text-sky-400" />
        </div>
      )}

      {/* 消息内容 */}
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-1",
          isUser ? "items-end" : "items-start"
        )}
      >

        {/* 消息气泡骨架 */}
        <div
          className={cn(
            "rounded-2xl px-4 py-3",
            isUser
              ? "w-fit w-[40%] bg-gradient-to-br from-sky-500/20 to-sky-500/5 border border-sky-500/20 rounded-tr-none"
              : "w-full max-w-[90%] bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-tl-none"
          )}
        >
          <Skeleton
            active
            paragraph={{
              rows: isUser ? 1 : Math.floor(Math.random() * 2) + 2,
              width: isUser ? "100%" : ["100%", "85%", "60%"],
            }}
            title={false}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * 聊天消息加载骨架屏
 * 模拟用户和 AI 交替对话的布局
 */
export function ChatLoadingSkeleton({
  count = 3,
  className,
}: ChatLoadingSkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-4 p-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <MessageSkeleton key={index} isUser={index % 2 === 0} />
      ))}
    </div>
  );
}

export default ChatLoadingSkeleton;
