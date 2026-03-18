import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeHeroSection } from "@/components/home/HomeHeroSection";
import { HomeHighlights } from "@/components/home/HomeHighlights";
import { HomeQuickActions } from "@/components/home/HomeQuickActions";
import { HomeCta } from "@/components/home/HomeCta";

const highlights = [
  {
    title: "健康档案",
    description: "集中管理体检、慢病、运动和饮食记录，随时可查。",
    icon: "healthicons:health-data",
  },
  {
    title: "智能提醒",
    description: "用药、随访、运动计划自动提醒，减少遗漏。",
    icon: "healthicons:alarm",
  },
  {
    title: "社区互助",
    description: "找到附近的健康资源与志愿者，获取及时支持。",
    icon: "healthicons:community-meeting",
  },
];

const quickActions = [
  {
    title: "在线咨询",
    description: "连接家庭医生和专业护理团队",
    icon: "healthicons:doctor-male",
  },
  {
    title: "智能问答",
    description: "快速获取健康知识与服务指引",
    icon: "healthicons:chat",
  },
  {
    title: "健康计划",
    description: "生成个性化运动与饮食建议",
    icon: "healthicons:exercise",
  },
];

export function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-12">
        <HomeHeader />
        <HomeHeroSection />
        <HomeHighlights items={highlights} />
        <HomeQuickActions items={quickActions} />
        <HomeCta />
      </div>
    </main>
  );
}

export default function HomePage() {
  return <Home />;
}
