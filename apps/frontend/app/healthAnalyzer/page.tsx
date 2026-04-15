/**
 * 健康分析首页 - 选择模式
 */

import Link from "next/link";
import { Icon } from "@iconify/react";
import { BackToHome } from "@/components/BackToHome";

export default function HealthAnalyzerPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        {/* 顶部：返回主页 */}
        <div className="flex justify-end mb-6">
          <BackToHome />
        </div>

        {/* 标题 */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-3">AI 健康助手</h1>
          <p className="text-white/60">选择您需要的服务模式</p>
        </div>

        {/* 模式选择卡片 */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* 普通对话模式 */}
          <Link
            href="/healthAnalyzer/chat"
            className="group block p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-sky-500/50 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-sky-500/30 transition-colors">
                <Icon icon="lucide:message-circle" className="w-7 h-7 text-sky-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2 group-hover:text-sky-400 transition-colors">
                  自由对话
                </h2>
                <p className="text-sm text-white/60 leading-relaxed">
                  与AI健康助手进行自由对话，咨询健康相关问题，获取专业建议。
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-white/40 group-hover:text-sky-400 transition-colors">
              <span>开始对话</span>
              <Icon icon="lucide:arrow-right" className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 健康数据分析模式 */}
          <Link
            href="/healthAnalyzer/analysis"
            className="group block p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-emerald-500/50 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/30 transition-colors">
                <Icon icon="lucide:heart-pulse" className="w-7 h-7 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2 group-hover:text-emerald-400 transition-colors">
                  健康数据分析
                </h2>
                <p className="text-sm text-white/60 leading-relaxed">
                  录入您的血压、心率、血糖等健康数据，AI将为您提供个性化分析报告。
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-white/40 group-hover:text-emerald-400 transition-colors">
              <span>录入数据</span>
              <Icon icon="lucide:arrow-right" className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
