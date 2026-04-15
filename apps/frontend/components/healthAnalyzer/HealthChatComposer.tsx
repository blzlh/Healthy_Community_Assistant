/**
 * 健康分析 - 对话输入组件
 */

"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/shadcn/button";
import { cn } from "@/lib/utils";

interface HealthChatComposerProps {
  onSend: (message: string) => void;
  onAbort?: () => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  className?: string;
  /** AI 生成的建议问题 */
  suggestedQuestions?: string[];
  /** 是否显示建议问题（默认 true） */
  showSuggestions?: boolean;
}

/**
 * 默认快捷建议标签（当没有 AI 建议时显示）
 */
const DEFAULT_SUGGESTIONS = [
  "如何改善睡眠质量？",
  "饮食方面有什么建议？",
  "适合做什么运动？",
];

/**
 * 从 AI 回复中解析建议问题
 * 支持格式：
 * 1. **建议问题：** 或 **相关追问：** 后跟列表
 * 2. 带编号的问题列表 (1. 2. 3.)
 * 3. 带破折号的问题列表 (- - -)
 */
export function parseSuggestedQuestions(content: string): string[] {
  const questions: string[] = [];

  // 尝试匹配多种格式
  const patterns = [
    // 匹配 "建议问题：" 或 "相关追问：" 后的问题列表
    /(?:建议问题|相关追问|推荐问题|您可以追问)[：:]\s*([\s\S]*?)(?=\n\n|$)/i,
    // 匹配编号列表
    /(?:^|\n)[\d]+[.、)]\s*(.+?)(?=\n|$)/g,
  ];

  // 尝试第一种模式
  const sectionMatch = content.match(patterns[0]);
  if (sectionMatch) {
    const section = sectionMatch[1];
    // 提取其中的问题
    const lines = section.split('\n').filter(line => line.trim());
    for (const line of lines) {
      // 移除编号、破折号等前缀
      const cleaned = line.replace(/^[\d]+[.、)\-－]\s*/, '').replace(/^[－\-\•]\s*/, '').trim();
      if (cleaned && cleaned.length > 3 && cleaned.length < 100) {
        questions.push(cleaned);
      }
    }
  }

  // 如果没找到，尝试查找带问号的句子
  if (questions.length === 0) {
    const questionMatches = content.match(/[^。！？\n]*[？?][^。！？\n]*/g);
    if (questionMatches) {
      for (const q of questionMatches.slice(0, 4)) {
        const cleaned = q.trim();
        if (cleaned.length > 5 && cleaned.length < 100) {
          questions.push(cleaned);
        }
      }
    }
  }

  return questions.slice(0, 4); // 最多返回 4 个
}

/**
 * 从 AI 回复中移除建议问题部分（不显示在聊天气泡中）
 */
export function stripSuggestedQuestions(content: string): string {
  // 移除分隔线及其后面的建议问题部分
  // 支持多种格式：
  // 1. ---\n**建议问题：**
  // 2. **建议问题：**
  // 3. 建议问题：
  let result = content;

  // 先尝试移除分隔线 + 建议问题的组合
  result = result.replace(/\n*[-─]{3,}\n*\*{0,2}(?:建议问题|相关追问|推荐问题|您可以追问)\*{0,2}[：:][\s\S]*$/i, '');

  // 再单独移除建议问题部分（处理没有分隔线的情况）
  result = result.replace(/\n*\*{0,2}(?:建议问题|相关追问|推荐问题|您可以追问)\*{0,2}[：:][\s\S]*$/i, '');

  // 移除末尾可能残留的分隔线
  result = result.replace(/\n*[-─]{3,}\s*$/g, '');

  return result.trim();
}

export function HealthChatComposer({
  onSend,
  onAbort,
  disabled = false,
  loading = false,
  placeholder = "输入您的问题...",
  className,
  suggestedQuestions = [],
  showSuggestions = true,
}: HealthChatComposerProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // 自动聚焦
  useEffect(() => {
    if (!loading && !disabled) {
      inputRef.current?.focus();
    }
  }, [loading, disabled]);

  // 合并 AI 建议和默认建议
  const displaySuggestions = useMemo(() => {
    if (!showSuggestions) {
      return [];
    }
    if (suggestedQuestions.length > 0) {
      return suggestedQuestions;
    }
    return DEFAULT_SUGGESTIONS;
  }, [suggestedQuestions, showSuggestions]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled || loading) return;
    onSend(trimmed);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (disabled || loading) return;
    // 填入输入框而非直接发送
    setText(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* 快捷建议 */}
      {!loading && displaySuggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {displaySuggestions.map((suggestion, index) => (
            <Button
              key={`suggestion-${index}`}
              variant="outline"
              size="sm"
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={disabled}
              className="!rounded-full !bg-white/5 !border-white/10 !text-white/60 hover:!bg-white/10 hover:!text-white/80 hover:!border-white/20"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      )}

      {/* 输入区域 */}
      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
              "w-full rounded-xl border bg-black/30 px-4 py-2 pr-12",
              "text-white placeholder:text-white/40",
              "focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50",
              "border-white/10",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-all duration-200"
            )}
          />
          {/* 字符计数 */}
          {text.length > 0 && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/30">
              {text.length}
            </span>
          )}
        </div>

        {/* 发送/停止按钮 */}
        {loading ? (
          <Button
            type="button"
            onClick={onAbort}
            variant="outline"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-xl shrink-0",
              "!border-red-500/30 !bg-red-500/10",
              "text-red-400 hover:!bg-red-500/20"
            )}
          >
            <Icon icon="material-symbols:stop-circle" className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSend}
            disabled={disabled || !text.trim()}
            size="icon"
            className={cn(
              "h-10 w-10 rounded-xl shrink-0",
              "!bg-zinc-800 !text-white hover:!bg-zinc-700",
              "disabled:!opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Icon icon="mynaui:send-solid" className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
