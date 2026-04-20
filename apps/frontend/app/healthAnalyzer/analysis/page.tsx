/**
 * 健康数据分析模式页面 - 录入数据分析
 */

import { PageHeader } from "@/components/ui/PageHeader";
import { HealthChatContent } from "@/components/healthAnalyzer";

export default function HealthAnalysisPage() {
  return (
    <div className="h-screen bg-black text-white antialiased overflow-hidden flex flex-col">
      <PageHeader
        title="健康数据分析"
        icon="solar:health-bold"
        iconColor="text-emerald-400"
        backHref="/healthAnalyzer"
      />
      <div className="flex-1 overflow-hidden">
        <div className="mx-auto w-[96%] h-full pb-4">
          <HealthChatContent mode="analysis" />
        </div>
      </div>
    </div>
  );
}
