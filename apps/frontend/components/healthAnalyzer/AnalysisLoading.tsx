/**
 * 健康分析 - 加载状态组件
 */

import { Icon } from "@iconify/react";
import {
  Card,
  CardContent,
} from "@/components/ui/shadcn/card";

export function AnalysisLoading() {
  return (
    <Card className="border-white/10 bg-white/5 text-white">
      <CardContent className="py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-sky-500/30 border-t-sky-500 animate-spin" />
            <Icon
              icon="healthicons:brain"
              className="h-8 w-8 text-sky-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-white">AI 正在分析您的健康数据...</p>
            <p className="text-sm text-white/50 mt-1">请稍候，这可能需要几秒钟</p>
          </div>
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <div className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
            <span>正在连接 AI 服务</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
