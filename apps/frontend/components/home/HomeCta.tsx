import Link from "next/link";

import { Button } from "@/components/ui/shadcn/button";

export function HomeCta() {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold">加入健康社区协作网络</h2>
          <p className="text-sm text-white/60">
            用数字化方式连接社区服务资源与居民需求，打造更有温度的健康生态。
          </p>
        </div>
        <Link href="/auth/register">
          <Button className="h-11 bg-white text-black hover:bg-zinc-200">免费体验</Button>
        </Link>
      </div>
    </section>
  );
}
