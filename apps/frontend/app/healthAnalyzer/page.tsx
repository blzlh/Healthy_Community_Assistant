/**
 * 健康分析页面
 */

import { HealthAnalyzerContainer } from "@/components/healthAnalyzer";

export default function HealthAnalyzerPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        <HealthAnalyzerContainer />
      </div>
    </main>
  );
}
