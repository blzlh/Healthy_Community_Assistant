"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/shadcn/button";
import { Carousel } from "antd";
import { useEffect, useState } from "react";

// 轮播背景图片
const heroSlides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920&h=800&fit=crop",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=1920&h=800&fit=crop",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=800&fit=crop",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=1920&h=800&fit=crop",
  },
];

export function HomeHero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative w-full h-[500px] md:h-[600px] rounded-xl overflow-hidden bg-zinc-900">
      {/* 轮播背景 */}
      <div className="absolute inset-0 z-0">
        {mounted && (
          <Carousel
            autoplay
            draggable
            dots={false}
            className="hero-carousel h-full"
          >
            {heroSlides.map((slide) => (
              <div key={slide.id}>
                <div
                  className="w-full h-[500px] md:h-[600px] bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.image})` }}
                />
              </div>
            ))}
          </Carousel>
        )}
      </div>

      {/* 渐变遮罩 */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

      {/* 内容 */}
      <div className="relative z-[2] h-full flex flex-col items-center justify-center text-center px-6">
        {/* 主标题 */}
        <div className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl leading-[1.1] mb-4">
          AI健康社区助手
        </div>
        <div className="text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed mb-8">
          集成健康档案管理、AI 智能分析、社区互动交流
          <br />
          为您提供全方位的健康管理体验
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-3 mb-12">
          <Link href="/healthAnalyzer">
            <Button className="h-12 px-8 bg-white text-black hover:bg-white/90 font-medium rounded-lg shadow-lg shadow-white/10">
              <Icon icon="healthicons:chat" className="h-5 w-5 mr-2" />
              开始 AI 咨询
            </Button>
          </Link>
          <Link href="/healthRecords">
            <Button className="h-12 px-8 border-white/20 bg-white/10 hover:bg-white/20 font-medium text-white hover:text-white rounded-lg backdrop-blur-sm">
              <Icon icon="healthicons:health-data" className="h-5 w-5 mr-2" />
              记录健康数据
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
