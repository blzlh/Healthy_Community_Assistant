import Link from "next/link";
import { Icon } from "@iconify/react";

import { Button } from "@/components/ui/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/shadcn/card";

export function HomeHeroSection() {
  return (
    <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div className="flex h-full flex-col gap-6">
        <div className="inline-flex items-center justify-center gap-2 w-[40%] rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80">
          AI 驱动的社区健康服务平台
        </div>
        <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
          让社区健康服务更聪明、连续、可信赖
        </h1>
        <p className="text-base text-white/70 md:text-lg">
          聚合居民健康档案、智能提醒与社区互助资源，为家庭医生和居民提供
          一站式健康管理与协作体验。
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/auth/register">
            <Button className="h-11 bg-white text-black hover:bg-zinc-200">
              开始使用
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" className="h-11 border-white/30 text-white">
              已有账号
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border-white/10 bg-white/5 text-white">
        <CardHeader>
          <CardTitle>今日概览</CardTitle>
          <CardDescription className="text-white/60">
            社区健康服务运行态势一目了然
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
            <div>
              <div className="text-sm text-white/60">待随访</div>
              <div className="text-2xl font-semibold">12</div>
            </div>
            <Icon icon="healthicons:calendar" className="h-6 w-6 text-amber-300" />
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
            <div>
              <div className="text-sm text-white/60">健康计划执行率</div>
              <div className="text-2xl font-semibold">86%</div>
            </div>
            <Icon icon="healthicons:chart-bar" className="h-6 w-6 text-sky-300" />
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
            <div>
              <div className="text-sm text-white/60">今日咨询</div>
              <div className="text-2xl font-semibold">34</div>
            </div>
            <Icon icon="healthicons:chat" className="h-6 w-6 text-emerald-300" />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
