/**
 * 健康分析首页 - 选择模式
 */

import Link from "next/link";
import { Icon } from "@iconify/react";
import { PageHeader } from "@/components/ui/PageHeader";

export default function HealthAnalyzerPage() {
  return (
    <div className="h-screen bg-black text-white antialiased overflow-hidden flex flex-col">
      <PageHeader
        title="AI 健康助手"
        description="选择您需要的服务模式"
        icon="solar:stethoscope-bold"
        iconColor="text-sky-400"
        iconBgGradient="from-sky-500/20 to-emerald-500/20"
      />

      {/* 主内容 - 使用 flex-1 和 min-h-0 让内容区域撑满 */}
      <main className="flex-1 min-h-0 pb-4 px-6">
        <div className="h-full bg-[#0A0A0A] border border-[#292929] rounded-md overflow-y-auto">
          <div className="p-8">
            {/* 模式选择卡片 */}
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* 普通对话模式 */}
              <Link
                href="/healthAnalyzer/chat"
                className="group block p-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent hover:bg-white/[0.03] hover:border-sky-500/50 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-500/20 to-sky-500/5 border border-sky-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Icon icon="solar:chat-round-dots-bold" className="w-7 h-7 text-sky-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xl !text-white font-semibold mb-2 group-hover:text-sky-400 transition-colors">
                      自由对话
                    </div>
                    <div className="text-sm text-white/60 leading-relaxed">
                      与AI健康助手进行自由对话，咨询健康相关问题，获取专业建议。
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-white/40 group-hover:text-sky-400 transition-colors">
                  <span>开始对话</span>
                  <Icon icon="solar:arrow-right-bold" className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* 健康数据分析模式 */}
              <Link
                href="/healthAnalyzer/analysis"
                className="group block p-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent hover:bg-white/[0.03] hover:border-emerald-500/50 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Icon icon="solar:health-bold" className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xl !text-white font-semibold mb-2 group-hover:text-emerald-400 transition-colors">
                      健康数据分析
                    </div>
                    <div className="text-sm text-white/60 leading-relaxed">
                      录入您的血压、心率、血糖等健康数据，AI将为您提供个性化分析报告。
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-white/40 group-hover:text-emerald-400 transition-colors">
                  <span>录入数据</span>
                  <Icon icon="solar:arrow-right-bold" className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
