/**
 * 健康分析 - 对话消息列表组件
 */

"use client";

import { useEffect, useRef, useState, useCallback, type ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Avatar } from "antd";
import { Icon } from "@iconify/react";
import { ChatMessage, HealthFormData } from "./types";
import { stripSuggestedQuestions } from "./HealthChatComposer";
import { HealthDataSnapshot } from "./HealthDataSnapshot";
import { cn } from "@/lib/utils";
import { ChatScrollbar } from "@/components/chat/ChatScrollbar";
import { useAuthStore } from "@/store/auth-store";

/**
 * Markdown 自定义组件样式配置
 */
const markdownComponents: ComponentPropsWithoutRef<typeof ReactMarkdown>["components"] = {
  // 标题样式 - 加粗
  h1: ({ children }) => (
    <h1 className="text-xl font-bold text-white mt-4 mb-3">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-bold text-white mt-3 mb-2">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-bold text-sky-400 mt-3 mb-2">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-sm font-bold text-white mt-2 mb-1">{children}</h4>
  ),
  // 段落样式 - 增大段距和行距
  p: ({ children }) => (
    <p className="text-white/80 leading-8 my-3">{children}</p>
  ),
  // 列表样式
  ul: ({ children }) => (
    <ul className="list-disc pl-5 text-white/80 my-3 space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 text-white/80 my-3 space-y-1">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="leading-7">{children}</li>
  ),
  // 强调文本
  strong: ({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  // 行内代码
  code: ({ className, children, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs text-sky-300 font-mono" {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className={cn("block bg-white/5 p-3 rounded-lg text-sm text-white/80 font-mono overflow-x-auto", className)} {...props}>
        {children}
      </code>
    );
  },
  // 代码块
  pre: ({ children }) => (
    <pre className="bg-white/5 rounded-lg p-3 my-3 overflow-x-auto">{children}</pre>
  ),
  // 引用块
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-sky-500/50 pl-4 text-white/60 my-3 italic">{children}</blockquote>
  ),
  // 链接
  a: ({ href, children }) => (
    <a href={href} className="text-sky-400 hover:text-sky-300 underline" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  // 表格样式 - 添加边框、表头加粗
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full border-collapse border border-white/20">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-white/5">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="border border-white/20 px-3 py-2 text-left text-white font-bold">{children}</th>
  ),
  tbody: ({ children }) => (
    <tbody>{children}</tbody>
  ),
  tr: ({ children }) => (
    <tr className="hover:bg-white/5 transition-colors">{children}</tr>
  ),
  td: ({ children }) => (
    <td className="border border-white/20 px-3 py-2 text-white/80">{children}</td>
  ),
  // 水平分割线
  hr: () => (
    <hr className="border-white/10 my-4" />
  ),
};

interface HealthChatMessageListProps {
  messages: ChatMessage[];
  className?: string;
  /** 健康数据更新回调 */
  onDataUpdate?: (data: HealthFormData) => void;
  /** 提交新数据回调 */
  onDataSubmit?: (data: HealthFormData) => void;
  /** 是否正在加载 */
  loading?: boolean;
}

/**
 * 单条消息组件
 */
function MessageItem({ 
  message, 
  userAvatar, 
  userName,
  onDataUpdate,
  onDataSubmit,
  loading,
}: {
  message: ChatMessage;
  userAvatar?: string;
  userName?: string;
  onDataUpdate?: (data: HealthFormData) => void;
  onDataSubmit?: (data: HealthFormData) => void;
  loading?: boolean;
}) {
  const isUser = message.role === 'user';
  const isStreaming = message.isStreaming;

  // 用户头像 fallback
  const avatarFallback = userName?.slice(0, 1).toUpperCase() || "我";

  return (
    <div
      className={cn(
        "flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* 头像 */}
      {isUser ? (
        <Avatar
          className="shrink-0 bg-zinc-700"
          size={32}
          src={userAvatar}
        >
          {avatarFallback}
        </Avatar>
      ) : (
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-emerald-500/20 border border-emerald-500/30">
          <Icon icon="healthicons:ai" className="w-4 h-4 text-emerald-400" />
        </div>
      )}

      {/* 消息内容 */}
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-1",
          isUser ? "items-end" : "items-start"
        )}
      >
        {/* 角色标签 */}
        <div
          className={cn(
            "flex items-center gap-2",
            isUser ? "justify-end" : "justify-start"
          )}
        >
          <span className="text-xs font-medium text-white/60">
            {isUser ? (userName || "我") : "AI 健康助手"}
          </span>
          <span className="text-[10px] text-white/40">
            {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* 消息气泡 */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2 text-sm text-white",
            isUser
              ? "w-fit max-w-[70%] whitespace-pre-wrap break-words bg-sky-500/20 border border-sky-500/30 rounded-tr-none"
              : "w-full bg-white/5 border border-white/10 rounded-tl-none"
          )}
        >
          {/* 健康数据快照（仅首条 AI 消息显示） */}
          {!isUser && message.healthDataSnapshot && (
            <HealthDataSnapshot 
              data={message.healthDataSnapshot}
              editable={true}
              onDataUpdate={onDataUpdate}
              onSubmit={onDataSubmit}
              loading={loading}
            />
          )}

          {/* 用户消息：纯文本 */}
          {isUser ? (
            message.content
          ) : (
            /* AI 消息：Markdown 渲染 */
            <div className="markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {stripSuggestedQuestions(message.content) || '...'}
              </ReactMarkdown>
            </div>
          )}

          {/* 流式输出光标 */}
          {/* {isStreaming && (
            <span className="inline-block w-2 h-4 bg-sky-400 animate-pulse ml-1 rounded-sm" />
          )} */}
        </div>
      </div>
    </div>
  );
}

/**
 * 空状态组件
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
        <Icon icon="healthicons:chat" className="w-8 h-8 text-emerald-400" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">开始健康对话</h3>
      <p className="text-sm text-white/50 max-w-xs">
        录入您的健康数据后，AI 将为您进行详细分析，您可以随时追问相关问题
      </p>
    </div>
  );
}

export function HealthChatMessageList({ 
  messages, 
  className,
  onDataUpdate,
  onDataSubmit,
  loading,
}: HealthChatMessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollbarVisible, setScrollbarVisible] = useState(false);
  const scrollTimerRef = useRef<number | undefined>(undefined);

  // 获取当前用户信息
  const currentUser = useAuthStore((state) => state.user);
  const userAvatar = currentUser?.avatarUrl ?? undefined;
  const userName = currentUser?.name || currentUser?.email || undefined;

  // 自动滚动到底部
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, messages.map(m => m.content).join('')]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        window.clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  // 滚动时显示滚动条，停止滚动后隐藏
  const handleScroll = useCallback(() => {
    setScrollbarVisible(true);

    if (scrollTimerRef.current) {
      window.clearTimeout(scrollTimerRef.current);
    }

    scrollTimerRef.current = window.setTimeout(() => {
      setScrollbarVisible(false);
    }, 1000);
  }, []);

  if (messages.length === 0) {
    return (
      <div className={cn("flex-1 flex items-center justify-center", className)}>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className={cn("relative flex flex-col min-h-0", className)}>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="chat-scroll flex-1 min-h-0 overflow-y-auto"
      >
        <div className="flex flex-col gap-4 p-4">
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              userAvatar={userAvatar}
              userName={userName}
              onDataUpdate={onDataUpdate}
              onDataSubmit={onDataSubmit}
              loading={loading}
            />
          ))}
        </div>
      </div>

      {/* 使用 chat 页面的滚动条组件 */}
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
