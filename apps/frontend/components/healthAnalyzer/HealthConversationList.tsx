/**
 * 健康对话列表组件 - 显示用户的历史对话
 * 使用 health-store 管理状态
 */

"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { Skeleton } from "antd";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/shadcn/button";
import { useAuthStore } from "@/store/auth-store";
import { useHealthStore } from "@/store/health-store";
import { useHealthConversation } from "@/hooks/use-health-conversation";
import { deleteConversation, type Conversation } from "@/services/health-conversation";

interface HealthConversationListProps {
  currentConversationId?: string | null;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  className?: string;
  /** 新创建的对话（用于立即显示在列表中） */
  newConversation?: Conversation | null;
}

/**
 * 格式化日期显示
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "今天";
  } else if (diffDays === 1) {
    return "昨天";
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
  }
}

/**
 * 对话列表骨架屏
 */
function ConversationListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="px-3 py-2.5 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Skeleton.Input active size="small" style={{ width: 140, height: 18 }} />
              <Skeleton.Input active size="small" style={{ width: 60, height: 14 }} className="mt-1.5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function HealthConversationList({
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  className,
  newConversation,
}: HealthConversationListProps) {
  const token = useAuthStore((state) => state.token);
  const hydrated = useAuthStore((state) => state.hydrated);

  // 从 store 获取状态
  const conversations = useHealthStore((state) => state.conversations);
  const loadingConversations = useHealthStore((state) => state.loadingConversations);
  const setConversations = useHealthStore((state) => state.setConversations);
  const removeConversationFromStore = useHealthStore((state) => state.removeConversation);
  const resetStore = useHealthStore((state) => state.reset);

  // 使用 ref 防止重复请求
  const hasLoadedRef = useRef(false);

  // 从 hook 获取加载方法
  const { loadConversations } = useHealthConversation();

  // 加载对话列表（只加载一次）
  useEffect(() => {
    if (!hydrated || !token) return;

    // 如果已经加载过或 store 中已有数据，不再请求
    if (hasLoadedRef.current || conversations.length > 0) return;

    hasLoadedRef.current = true;
    loadConversations();
  }, [hydrated, token, conversations.length, loadConversations]);

  // 删除对话
  const handleDelete = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();

    if (!token) return;
    if (!confirm("确定要删除这个对话吗？")) {
      return;
    }

    try {
      await deleteConversation(token, conversationId);
      removeConversationFromStore(conversationId);

      // 如果删除的是当前对话，创建新对话
      if (conversationId === currentConversationId) {
        onNewConversation();
      }
    } catch (err) {
      console.error("删除对话失败:", err);
      alert("删除失败");
    }
  };

  // 合并新对话到列表（用于显示）
  const displayConversations = newConversation && !conversations.find(c => c.id === newConversation.id)
    ? [newConversation, ...conversations]
    : conversations;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* 新建对话按钮 */}
      <Button
        onClick={onNewConversation}
        className={cn(
          "w-full mb-3 !bg-sky-600 !text-white hover:!bg-sky-500"
        )}
      >
        <Icon icon="lucide:plus" className="w-4 h-4 mr-1.5" />
        新建对话
      </Button>

      {/* 对话列表 */}
      <div className="flex-1 overflow-y-auto chat-scroll">
        {loadingConversations ? (
          <ConversationListSkeleton count={5} />
        ) : displayConversations.length === 0 ? (
          <div className="text-center py-8 text-white/40 text-sm">
            暂无历史对话
          </div>
        ) : (
          <div className="space-y-1">
            {displayConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={cn(
                  "group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer",
                  "hover:bg-white/10 transition-colors",
                  currentConversationId === conversation.id
                    ? "bg-white/10 border border-white/20"
                    : "border border-transparent"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">
                    {conversation.title || "健康分析对话"}
                  </div>
                  <div className="text-xs text-white/40 mt-0.5">
                    {formatDate(conversation.updatedAt)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={(e) => handleDelete(e, conversation.id)}
                  className={cn(
                    "opacity-0 group-hover:opacity-100",
                    "!text-white/40 hover:!text-red-400 hover:!bg-red-500/10"
                  )}
                  title="删除对话"
                >
                  <Icon icon="lucide:trash-2" className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
