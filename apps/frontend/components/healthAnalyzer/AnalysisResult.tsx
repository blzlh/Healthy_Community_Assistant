/**
 * 健康分析 - 分析结果组件
 */

import React, { forwardRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/shadcn/card";

interface AnalysisResultProps {
  result: string | null;
  loading: boolean;
  error: string | null;
  followUpQuestion: string;
  onFollowUpChange: (value: string) => void;
  onFollowUpSubmit: (e: React.FormEvent) => void;
  onAbort: () => void;
  onReset: () => void;
}

export const AnalysisResult = forwardRef<HTMLDivElement, AnalysisResultProps>(
  ({ result, loading, error, followUpQuestion, onFollowUpChange, onFollowUpSubmit, onAbort, onReset }, ref) => {
    return (
      <Card className="border-white/10 bg-white/5 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Icon icon="healthicons:report" className="h-5 w-5 text-emerald-400" />
            分析报告
          </CardTitle>
          {loading && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sky-400">
                <div className="h-3 w-3 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
                <span className="text-sm">生成中</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onAbort}
                className="h-7 border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
              >
                <Icon icon="healthicons:cancel" className="h-4 w-4 mr-1" />
                停止
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* Markdown 渲染区域 */}
          <div
            ref={ref}
            className="max-h-[50vh] overflow-y-auto rounded-xl border border-white/10 bg-black/30 p-4 mb-4"
          >
            <div className="prose prose-sm prose-invert max-w-none
                            prose-headings:text-white prose-headings:font-semibold
                            prose-h2:text-xl prose-h2:border-b prose-h2:border-white/20 prose-h2:pb-2 prose-h2:mb-4
                            prose-h3:text-lg prose-h3:text-sky-400
                            prose-p:text-white/80 prose-p:leading-relaxed prose-p:my-2
                            prose-table:border-collapse prose-table:w-full prose-table:my-4
                            prose-th:bg-white/10 prose-th:border prose-th:border-white/20 prose-th:px-3 prose-th:py-2 prose-th:text-white prose-th:font-medium
                            prose-td:border prose-td:border-white/20 prose-td:px-3 prose-td:py-2 prose-td:text-white/80
                            prose-ul:list-disc prose-ul:pl-5 prose-ul:text-white/80
                            prose-ol:list-decimal prose-ol:pl-5 prose-ol:text-white/80
                            prose-li:my-1
                            prose-strong:text-white prose-strong:font-semibold
                            prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sky-300
                            prose-blockquote:border-l-4 prose-blockquote:border-sky-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-white/60
                            prose-hr:border-white/20
                        ">
              {result ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {result}
                </ReactMarkdown>
              ) : (
                <div className="text-white/40 text-center py-8">
                  等待 AI 响应...
                </div>
              )}
              {loading && result && (
                <span className="inline-block w-2 h-4 bg-sky-400 animate-pulse ml-1 rounded-sm" />
              )}
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 mb-4 text-red-400 text-sm">
              ❌ {error}
            </div>
          )}

          {/* 追问功能 */}
          {!loading && result && (
            <>
              <form onSubmit={onFollowUpSubmit} className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Icon
                    icon="healthicons:chat"
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"
                  />
                  <input
                    type="text"
                    value={followUpQuestion}
                    onChange={(e) => onFollowUpChange(e.target.value)}
                    placeholder="继续提问，如：我应该如何降低血压？"
                    className="w-full rounded-lg border border-white/10 bg-black/30 py-3 pl-10 pr-4 text-white placeholder:text-white/40 focus:border-sky-500 focus:outline-none transition-colors"
                  />
                </div>
                <Button
                  type="submit"
                  className="!bg-zinc-800 !text-white hover:!bg-zinc-700"
                >
                  <Icon icon="healthicons:send" className="h-4 w-4 mr-1" />
                  提问
                </Button>
              </form>

              {/* 操作按钮 */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={onReset}
                  className="!border-white/20 !text-white/60 hover:!text-white hover:!bg-white/10"
                >
                  <Icon icon="healthicons:refresh" className="h-4 w-4 mr-2" />
                  重新分析
                </Button>
                <div className="text-xs text-white/40">
                  分析结果仅供参考
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }
);

AnalysisResult.displayName = "AnalysisResult";
