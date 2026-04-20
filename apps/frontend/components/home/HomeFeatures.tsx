import { Icon } from "@iconify/react";
import Link from "next/link";

// 已实现的核心功能（统一使用 Solar 图标库）
const features = [
  {
    title: "健康档案",
    description: "记录血压、心率、血糖等健康数据",
    icon: "solar:health-bold",
    href: "/healthRecords",
    color: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-400",
  },
  {
    title: "AI 健康助手",
    description: "智能分析健康数据，提供个性化建议",
    icon: "solar:stethoscope-bold",
    href: "/healthAnalyzer",
    color: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-400",
  },
  {
    title: "社区交流",
    description: "分享健康心得，参与社区互动",
    icon: "solar:users-group-rounded-bold",
    href: "/community",
    color: "from-purple-500/20 to-purple-500/5",
    iconColor: "text-purple-400",
  },
  {
    title: "聊天室",
    description: "实时在线交流，与其他用户互动",
    icon: "solar:chat-round-bold",
    href: "/chat",
    color: "from-orange-500/20 to-orange-500/5",
    iconColor: "text-orange-400",
  },
];

export function HomeFeatures() {
  return (
    <section className="flex flex-col gap-8">
      {/* 标题 */}
      <div className="text-center flex flex-col gap-2">
        <h2 className="text-2xl md:text-3xl font-semibold">快速开始</h2>
        <p className="text-white/50">选择您需要的功能，开启健康之旅</p>
      </div>

      {/* 功能卡片 - 4列布局 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group relative p-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent hover:border-white/20 hover:bg-white/[0.03] transition-all duration-300"
          >
            {/* 图标 */}
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <Icon icon={item.icon} className={`h-6 w-6 ${item.iconColor}`} />
            </div>

            {/* 标题 */}
            <div className="text-lg font-semibold mb-2 !group-hover:text-white transition-colors !text-white">
              {item.title}
            </div>

            {/* 描述 */}
            <p className="text-sm text-white/50 group-hover:text-white/70 transition-colors">
              {item.description}
            </p>

            {/* 箭头 */}
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <Icon icon="solar:arrow-right-bold" className="h-4 w-4 text-white/50" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
