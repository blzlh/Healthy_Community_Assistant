/**
 * 健康数据分析模式页面 - 录入数据分析
 */

import { HealthAnalyzerContainer } from "@/components/healthAnalyzer/HealthAnalyzerContainer";

export default function HealthAnalysisPage() {
  return (
    <main className="h-screen bg-black text-white overflow-hidden">
      <div className="mx-auto w-full max-w-4xl px-6 py-6 h-full">
        <HealthAnalyzerContainer />
      </div>
    </main>
  );
}
