import { Icon } from "@iconify/react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/shadcn/card";

type HighlightItem = {
  title: string;
  description: string;
  icon: string;
};

export function HomeHighlights({ items }: { items: HighlightItem[] }) {
  return (
    <section className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">平台亮点</h2>
          <p className="text-sm text-white/60">聚焦居民、医生与社区协同的关键能力</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <Card key={item.title} className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <Icon icon={item.icon} className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <CardDescription className="text-white/60">
                {item.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
