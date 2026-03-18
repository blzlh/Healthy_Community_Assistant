import { Icon } from "@iconify/react";

import { Button } from "@/components/ui/shadcn/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/shadcn/card";

type QuickActionItem = {
  title: string;
  description: string;
  icon: string;
};

export function HomeQuickActions({ items }: { items: QuickActionItem[] }) {
  return (
    <section className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">快捷入口</h2>
          <p className="text-sm text-white/60">一键触达高频服务，提高协作效率</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((action) => (
          <Card key={action.title} className="border-white/10 bg-white/5 text-white">
            <CardHeader className="flex flex-col gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <Icon icon={action.icon} className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription className="text-white/60">
                  {action.description}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                className="w-fit border border-white/10 text-white hover:bg-white/10"
              >
                立即进入
              </Button>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
